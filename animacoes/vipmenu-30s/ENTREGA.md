# VipMenu: anúncio 30 s (Reels e Stories)

Arquivo final: `saida/vipmenu-30s.mp4` · 1080 x 1920 · 9:16 · 30 fps · 30 s · narração da ElevenLabs com a voz Marcio (eleven_v4, take 1)

## Narração e textos na tela, por cena

| Cena | Tempo | Narração | Texto na tela |
|---|---|---|---|
| 1. Gancho | 0 a 3 s | "O cliente pediu hoje. O que faz ele voltar amanhã?" | "O cliente **pediu hoje.**" → "O que faz ele / voltar **amanhã?**" · card "Pedido confirmado · Mesa 7" |
| 2. Marca | 3 a 5,4 s | "É aí que entra o VipMenu." | Logo RS² Digital girando em 3D · "apresenta" · "VipMenu" |
| 3. Cardápio digital | 5,4 a 10,4 s | "O cliente escaneia o QR Code da mesa e o cardápio abre na hora." | "Escaneou." / "Abriu o **cardápio.**" |
| 4. Canal de pedidos | 10,4 a 17 s | "O pedido chega direto pra você, num canal próprio do seu restaurante." | "Um canal próprio / para receber **pedidos.**" |
| 5. Cartão fidelidade | 17 a 25 s | "No cartão fidelidade, ele entra com o número de WhatsApp, e cada selo fica salvo nesse número. Cada selo é um motivo pra voltar." | "Entrou com o **WhatsApp.**" → "Cada selo dá um / motivo pra **voltar.**" · na tela do app: "Progresso salvo no seu WhatsApp" |
| 6. Chamada final | 25 a 30 s | "Conheça o VipMenu, da RS2 Digital." | "VipMenu" · "por RS² Digital" · botão "Conheça o VipMenu" (parado de 26,5 s até o fim) |

Efeitos sonoros: toque, pop, whoosh, riser e impacto na logo, bip do scan, swish no giro do celular, ding do pedido, digitação e carimbo com brilho no selo. A trilha é gerada em código e fica em silêncio por 0,5 s antes do carimbo.

## Placeholders desta versão
As etiquetas amarelas "PRÉVIA" marcam o que ainda falta:
1. **Telas do app**: são desenhadas em código. Faltam os prints reais do cardápio, do pedido e do cartão.
2. **Logo do VipMenu**: a palavra "VipMenu" é provisória e usa o azul da RS2.
3. **Fluxo do pedido**: falta confirmar se o pedido vai para o WhatsApp do restaurante ou para um painel.
4. **Número de selos e regra do selo**: a versão usa 10 como exemplo.
5. **Destino do CTA**: falta o site, o @ ou o link.
6. "Seu Restaurante", os pratos e os preços dos pratos são exemplos.

## Como editar e renderizar de novo
- **Textos**: no começo do `index.html`, em `TXT` (nome do restaurante, CTA e número mascarado), e nas chamadas `manchete(...)` de cada cena.
- **Tirar as etiquetas amarelas**: `CONFIG.placeholders = false`.
- **Prints reais**: salve em `assets/` (por exemplo `cardapio.png`, `pedido.png` e `cartao.png`, em PNG de 1170 x 2532 ou parecido). Depois troque a função da tela, como `telaCardapio` ou `telaCartao`, por `ctx.drawImage(...)` do print dentro de `celular(...)`. A tela do celular mede 392 x 842 pontos.
- **Narração**: o arquivo é `narracao/take1.mp3`. Para trocar a voz ou o take, ajuste `TAKE` e os tempos de corte em `mix.sh`.

Comandos, a partir da raiz do repositório (com Node 20 ou mais, FFmpeg e Playwright):
```bash
node .claude/skills/animate/scripts/render.mjs animacoes/vipmenu-30s --storyboard   # prévia rápida em imagem
node .claude/skills/animate/scripts/render.mjs animacoes/vipmenu-30s                # vídeo sem narração
NODE_PATH=$(npm root -g) node animacoes/vipmenu-30s/audio.mjs                        # música e efeitos separados
bash animacoes/vipmenu-30s/mix.sh                                                    # narração + mixagem = saida/vipmenu-30s.mp4
```
