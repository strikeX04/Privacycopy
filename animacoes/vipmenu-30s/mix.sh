#!/usr/bin/env bash
# Mixagem final: posiciona cada frase da narração na sua cena, abaixa a música quando a voz entra
# e junta com o vídeo renderizado.
# uso: bash mix.sh   (depois de rodar render.mjs e audio.mjs)
set -euo pipefail
cd "$(dirname "$0")"
TAKE=narracao/take1.mp3

# frase: corte_inicio corte_fim atraso(s)  -> a fala começa no tempo certo da cena
FRASES=(
  "0     1.48  0.15"   # O cliente pediu hoje.
  "1.48  3.23  1.31"   # O que faz ele voltar amanhã?
  "3.23  5.36  3.15"   # É aí que entra o VipMenu.
  "5.36  9.62  5.47"   # O cliente escaneia o QR Code da mesa e o cardápio abre na hora.
  "9.62  13.77 11.00"  # O pedido chega direto pra você, num canal próprio do seu restaurante.
  "13.77 19.45 17.00"  # No cartão fidelidade, ele entra com o número de WhatsApp, e cada selo fica salvo nesse número.
  "19.45 21.93 22.56"  # Cada selo é um motivo pra voltar.
  "21.93 25.28 25.34"  # Conheça o VipMenu, da RS2 Digital.
)
filtro=""; rotulos=""; i=0
for f in "${FRASES[@]}"; do
  read -r a b d <<< "$f"; ms=$(awk "BEGIN{printf \"%d\", $d*1000}")
  filtro+="[0:a]atrim=$a:$b,asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=$(awk "BEGIN{print $b-$a-0.04}"):d=0.04,adelay=${ms}|${ms}[f$i];"
  rotulos+="[f$i]"; i=$((i+1))
done
filtro+="${rotulos}amix=inputs=$i:normalize=0,apad=whole_dur=30,atrim=0:30,aformat=channel_layouts=stereo[voz]"
ffmpeg -y -loglevel error -i "$TAKE" -filter_complex "$filtro" -map "[voz]" -ar 48000 saida/voz.wav

# música abaixa sob a voz; efeitos ficam por cima; tudo normalizado para redes sociais (-14 LUFS)
ffmpeg -y -loglevel error -i saida/video.mp4 -i saida/voz.wav -i saida/musica.wav -i saida/efeitos.wav -filter_complex "\
[1:a]asplit=2[v1][vsc];\
[2:a]volume=0.55[m];[m][vsc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[mduck];\
[3:a]volume=0.75[sfx];\
[v1]volume=1.15[vz];\
[vz][mduck][sfx]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart saida/vipmenu-30s.mp4
echo "Pronto: saida/vipmenu-30s.mp4"
