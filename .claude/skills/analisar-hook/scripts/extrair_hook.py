#!/usr/bin/env python3
"""Extrai a matéria-prima do hook de um vídeo para o Claude analisar.

Gera, numa pasta de saída:
  - hook_grade.jpg   frames dos primeiros segundos (a cada 0,5s), com o tempo marcado
  - corpo_grade.jpg  frames espalhados pelo resto do vídeo (para entender o ângulo)
  - transcricao.json fala com tempo de cada palavra (se o faster-whisper estiver instalado)
  - relatorio.md     resumo legível de tudo (também é impresso no terminal)

Uso:
  python3 extrair_hook.py VIDEO_OU_LINK [--segundos 6] [--saida pasta] [--modelo small] [--idioma pt]
"""

import argparse
import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path


def rodar(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def baixar(url, pasta):
    if not shutil.which("yt-dlp"):
        try:
            import yt_dlp  # noqa: F401
            base = [sys.executable, "-m", "yt_dlp"]
        except ImportError:
            sys.exit("Para usar link, instale o yt-dlp: pip install yt-dlp")
    else:
        base = ["yt-dlp"]
    destino = pasta / "video.%(ext)s"
    r = rodar(base + ["-f", "mp4/best", "--no-playlist", "-o", str(destino), url])
    arquivos = sorted(pasta.glob("video.*"))
    if r.returncode != 0 or not arquivos:
        sys.exit(f"Não consegui baixar o vídeo do link.\n{r.stderr[-800:]}")
    return arquivos[0]


def info_video(video):
    r = rodar(["ffprobe", "-v", "error", "-print_format", "json",
               "-show_format", "-show_streams", str(video)])
    if r.returncode != 0:
        sys.exit(f"Não consegui ler o vídeo: {r.stderr[-500:]}")
    dados = json.loads(r.stdout)
    v = next((s for s in dados["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in dados["streams"] if s["codec_type"] == "audio"), None)
    if v is None:
        sys.exit("O arquivo não tem faixa de vídeo.")
    fps = v.get("avg_frame_rate", "0/1")
    num, den = (fps.split("/") + ["1"])[:2]
    # Vídeos de celular guardam a rotação à parte: corrige largura/altura.
    rot = 0
    for sd in v.get("side_data_list", []):
        if "rotation" in sd:
            rot = abs(int(sd["rotation"]))
    w, h = int(v["width"]), int(v["height"])
    if rot in (90, 270):
        w, h = h, w
    return {
        "duracao": float(dados["format"].get("duration", 0)),
        "largura": w,
        "altura": h,
        "fps": round(float(num) / float(den), 2) if float(den) else None,
        "tem_audio": a is not None,
    }


def extrair_frame(video, t, destino, largura=360):
    rodar(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.2f}", "-i", str(video),
           "-frames:v", "1", "-vf", f"scale={largura}:-2", "-q:v", "3", str(destino)])
    return destino if destino.exists() else None


def montar_grade(frames, destino, colunas=4):
    from PIL import Image, ImageDraw, ImageFont

    imgs = [(t, Image.open(p).convert("RGB")) for t, p in frames if p]
    if not imgs:
        return None
    w = max(i.width for _, i in imgs)
    h = max(i.height for _, i in imgs)
    faixa = 28
    linhas = math.ceil(len(imgs) / colunas)
    grade = Image.new("RGB", (colunas * w, linhas * (h + faixa)), "white")
    d = ImageDraw.Draw(grade)
    try:
        fonte = ImageFont.truetype("DejaVuSans-Bold.ttf", 20)
    except OSError:
        fonte = ImageFont.load_default()
    for n, (t, img) in enumerate(imgs):
        x, y = (n % colunas) * w, (n // colunas) * (h + faixa)
        d.rectangle([x, y, x + w, y + faixa], fill="black")
        d.text((x + 8, y + 3), f"{t:.1f}s", fill="yellow", font=fonte)
        grade.paste(img, (x, y + faixa))
    grade.save(destino, quality=85)
    return destino


def detectar_cortes(video, limiar=0.3):
    r = rodar(["ffmpeg", "-v", "info", "-i", str(video), "-an",
               "-filter:v", f"select='gt(scene,{limiar})',showinfo", "-f", "null", "-"])
    return [round(float(t), 2) for t in re.findall(r"pts_time:([\d.]+)", r.stderr)]


def volume_inicio(video, segundos=1.5):
    r = rodar(["ffmpeg", "-v", "info", "-t", str(segundos), "-i", str(video),
               "-vn", "-af", "volumedetect", "-f", "null", "-"])
    m = re.search(r"mean_volume: ([-\d.]+) dB", r.stderr)
    return float(m.group(1)) if m else None


def transcrever(video, pasta, modelo, idioma):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return None, "faster-whisper não instalado (pip install faster-whisper)"
    import numpy as np

    # O ffmpeg entrega o áudio pronto (16 kHz, mono). Assim o Whisper não depende
    # do PyAV, que quebra com frequência entre versões.
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-vn", "-ac", "1",
                        "-ar", "16000", "-f", "s16le", "-"], capture_output=True)
    if r.returncode != 0 or not r.stdout:
        return None, "não consegui extrair o áudio"
    audio = np.frombuffer(r.stdout, np.int16).astype(np.float32) / 32768.0
    try:
        m = WhisperModel(modelo, device="cpu", compute_type="int8")
        segs, info = m.transcribe(audio, language=idioma, word_timestamps=True,
                                  beam_size=5, vad_filter=False)
        saida = {"idioma": info.language, "segmentos": []}
        for s in segs:
            saida["segmentos"].append({
                "inicio": round(s.start, 2),
                "fim": round(s.end, 2),
                "texto": s.text.strip(),
                "palavras": [{"t": round(w.start, 2), "p": w.word.strip()}
                             for w in (s.words or [])],
            })
        return saida, None
    except Exception as e:  # modelo não baixou, sem internet etc.
        return None, f"transcrição falhou: {e}"


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("entrada", help="caminho do vídeo ou link (TikTok, Reels, YouTube...)")
    ap.add_argument("--segundos", type=float, default=6.0,
                    help="tamanho da janela do hook (padrão 6s)")
    ap.add_argument("--saida", default=None, help="pasta de saída")
    ap.add_argument("--modelo", default="small",
                    help="modelo Whisper: tiny, base, small, medium (padrão small)")
    ap.add_argument("--idioma", default=None, help="ex.: pt, en, es (padrão: detectar)")
    ap.add_argument("--sem-transcricao", action="store_true")
    a = ap.parse_args()

    for prog in ("ffmpeg", "ffprobe"):
        if not shutil.which(prog):
            sys.exit(f"Preciso do {prog} instalado.")

    eh_link = re.match(r"https?://", a.entrada) is not None
    nome = "video_link" if eh_link else Path(a.entrada).stem
    pasta = Path(a.saida or f"hook_{nome}").resolve()
    pasta.mkdir(parents=True, exist_ok=True)

    video = baixar(a.entrada, pasta) if eh_link else Path(a.entrada).resolve()
    if not video.exists():
        sys.exit(f"Arquivo não encontrado: {video}")

    info = info_video(video)
    dur = info["duracao"]
    janela = min(a.segundos, dur) if dur else a.segundos

    # Frames do hook: a cada 0,5s dentro da janela.
    pf = pasta / "frames"
    pf.mkdir(exist_ok=True)
    tempos_hook = [round(i * 0.5, 1) for i in range(math.ceil(janela / 0.5)) if i * 0.5 < dur]
    frames_hook = [(t, extrair_frame(video, t, pf / f"hook_{t:05.1f}s.jpg")) for t in tempos_hook]
    grade_hook = montar_grade(frames_hook, pasta / "hook_grade.jpg")

    # Frames do corpo: 8 pontos espalhados depois do hook.
    grade_corpo = None
    if dur > janela + 1:
        passo = (dur - janela) / 8
        tempos_corpo = [round(janela + passo * (i + 0.5), 1) for i in range(8)]
        frames_corpo = [(t, extrair_frame(video, t, pf / f"corpo_{t:06.1f}s.jpg"))
                        for t in tempos_corpo]
        grade_corpo = montar_grade(frames_corpo, pasta / "corpo_grade.jpg")

    cortes = detectar_cortes(video)
    cortes_hook = [c for c in cortes if c <= janela]
    vol = volume_inicio(video) if info["tem_audio"] else None

    trans, erro_trans = (None, "pulada") if a.sem_transcricao or not info["tem_audio"] \
        else transcrever(video, pasta, a.modelo, a.idioma)
    if trans:
        (pasta / "transcricao.json").write_text(json.dumps(trans, ensure_ascii=False, indent=1))

    # ---- relatório ----
    L = [f"# Matéria-prima do hook: {video.name}", ""]
    formato = "vertical" if info["altura"] > info["largura"] else "horizontal/quadrado"
    L += [f"- Duração: {dur:.1f}s | {info['largura']}x{info['altura']} ({formato}) | {info['fps']} fps",
          f"- Janela do hook analisada: 0 a {janela:.1f}s",
          f"- Cortes de cena no hook: {len(cortes_hook)} "
          f"({', '.join(f'{c}s' for c in cortes_hook) or 'nenhum, plano único'})",
          f"- Cortes no vídeo todo: {len(cortes)} "
          f"(~{len(cortes) / dur * 10:.1f} por 10s)" if dur else "- Cortes: ?"]
    if not info["tem_audio"]:
        L.append("- Áudio: vídeo SEM som")
    elif vol is not None:
        L.append(f"- Volume médio nos primeiros 1,5s: {vol} dB "
                 f"({'começa forte' if vol > -25 else 'começa baixo/silencioso' if vol < -40 else 'médio'})")
    L.append("")

    L += ["## Imagens para olhar", f"- Hook: {grade_hook}"]
    if grade_corpo:
        L.append(f"- Resto do vídeo: {grade_corpo}")
    L.append(f"- Frames soltos: {pf}")
    L.append("")

    L.append("## Fala")
    if trans and trans["segmentos"]:
        palavras = [w for s in trans["segmentos"] for w in s["palavras"]]
        primeira = palavras[0]["t"] if palavras else None
        no_hook = " ".join(w["p"] for w in palavras if w["t"] < janela)
        L += [f"- Idioma: {trans['idioma']}",
              f"- Primeira palavra em: {primeira}s",
              f"- Falado dentro do hook (0-{janela:.0f}s): \"{no_hook}\"", "",
              "### Transcrição completa"]
        L += [f"[{s['inicio']:.1f}-{s['fim']:.1f}s] {s['texto']}" for s in trans["segmentos"]]
    elif trans:
        L.append("- Nenhuma fala detectada (provavelmente só música/efeitos ou hook só visual).")
    else:
        L.append(f"- Sem transcrição: {erro_trans}. Peça a fala/legenda ao usuário se precisar.")

    rel = "\n".join(L) + "\n"
    (pasta / "relatorio.md").write_text(rel)
    (pasta / "relatorio.json").write_text(json.dumps({
        "video": str(video), **info, "janela_hook": janela, "cortes": cortes,
        "volume_inicio_db": vol, "grade_hook": str(grade_hook),
        "grade_corpo": str(grade_corpo) if grade_corpo else None,
        "transcricao": trans, "erro_transcricao": erro_trans,
    }, ensure_ascii=False, indent=1))
    print(rel)
    print(f"(tudo salvo em {pasta})")


if __name__ == "__main__":
    main()
