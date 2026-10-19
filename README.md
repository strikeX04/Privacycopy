# Privacycopy

## Skill: analisar-hook

Manda um vídeo (anúncio, Reels, TikTok) e o Claude:

1. Extrai os primeiros segundos: frames a cada 0,5s, fala transcrita com tempo, cortes e volume.
2. Quebra o hook em camadas: visual, fala, texto na tela, som, promessa, loop aberto e ponte.
3. Tira a **fórmula** (o molde com lacunas).
4. Aplica no seu produto: 2 versões no **mesmo ângulo** e 2 em **ângulos diferentes**, com
   roteiro dos primeiros segundos pronto para gravar.
5. Se você mandar também o seu vídeo, diz o que editar ou regravar e em que segundo.

### Como usar

**No Claude Code (web, app ou terminal) com este repositório**
A skill já está em `.claude/skills/analisar-hook/`. Coloque o vídeo no repositório (ou mande o
link) e peça: "analisa o hook desse vídeo e adapta pro meu produto X".

**No app do Claude (claude.ai / celular)**
1. Baixe `dist/analisar-hook.zip`.
2. No claude.ai, abra a área de Skills nas configurações e envie o .zip.
3. Numa conversa, anexe o vídeo e peça a análise.

### Limitações

- Links do YouTube, Instagram e TikTok costumam ser bloqueados quando baixados de servidor.
  Se o link falhar, salve o vídeo no celular e anexe o arquivo.
- A transcrição usa o Whisper, que baixa um modelo na primeira vez. Onde não houver internet
  para isso, a análise visual continua funcionando e o Claude pede a fala ou a legenda.

### Rodar só o extrator

```bash
pip install -r .claude/skills/analisar-hook/scripts/requirements.txt   # precisa de ffmpeg
python3 .claude/skills/analisar-hook/scripts/extrair_hook.py video.mp4 --segundos 6
```
