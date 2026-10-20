---
name: animate
description: Faz vídeo animado curto inteiro em código, como explicativo, história ou reel. Desenha cada quadro em JavaScript num canvas, gera a trilha em código, renderiza com Playwright e junta num MP4 com FFmpeg. Segue o fluxo roteiro, storyboard pra aprovação, rascunho, render final e folha de contato pra conferir e corrigir. Use quando o usuário digitar /animate ou pedir vídeo animado, explicativo animado ou motion feito em código.
argument-hint: "[tema, duração e formato] [estilo]"
---

# Animate

Você faz vídeos animados curtos em código: uma página HTML com um canvas, onde cada quadro é desenhado por uma função do tempo, e a trilha é sintetizada em código. O script `render.mjs` abre a página num navegador sem tela, tira uma foto de cada quadro e o FFmpeg junta tudo num MP4. Você não assiste vídeo, então confere o trabalho olhando o storyboard e a folha de contato, que são imagens.

Pedido do usuário: $ARGUMENTS

## Antes de tudo: as ferramentas

Rode e confira:
- `node -v` precisa ser 20 ou maior.
- `ffmpeg -version` precisa responder.
- `ls ${CLAUDE_SKILL_DIR}/node_modules/playwright` precisa existir.

Se faltar o Playwright, instale você mesmo com `cd ${CLAUDE_SKILL_DIR} && npm install` (a versão fica fixa no package.json). Numa sessão do Claude Code na nuvem o Chromium já vem instalado, então pare aí. No computador do usuário, rode também `npx playwright install chromium`.
Se faltar outra coisa, diga o comando de instalação e pare:
- FFmpeg no Mac: `brew install ffmpeg`. No Windows: `winget install Gyan.FFmpeg`.
- Node: instalador LTS em nodejs.org.

## Regras que nunca mudam

1. Nada de animar antes do storyboard aprovado. Roteiro errado custa um render inteiro.
2. Tudo depende só do tempo `t`. Nunca use `Math.random()`, `Date.now()` ou `performance.now()` dentro das cenas. Use `rng(semente)` do modelo. O mesmo `t` sempre desenha o mesmo quadro.
3. Um arquivo só: `index.html`, sem imagem, vídeo, áudio, fonte ou script de fora. Exceção: arquivo que o próprio usuário der e pedir pra usar.
4. Todo fato, número, nome ou data que aparece na tela é conferido numa busca na web, com a fonte anotada em `roteiro.md`.
5. Texto na tela em português do Brasil com acento, sem travessão, e grande: mínimo de 40 px em 16:9 e 48 px em 9:16. Nada a menos de 6% da borda.
6. Pronto é medido: a folha de contato foi vista e a lista de conferência passou. Informe o que conferiu, não "ficou bom".

## O fluxo

### 1. Entrevista curta
Pergunte só o que não dá pra deduzir do pedido, numa mensagem, com uma opção recomendada em cada:
- Tema e o que a pessoa tem que entender ou sentir no fim.
- Duração: 15, 30, 45 ou 60 segundos. Recomende 30.
- Formato: 16:9 (YouTube, 1920 x 1080) ou 9:16 (Reels, Shorts e TikTok, 1080 x 1920).
- Estilo: um dos 8 de `${CLAUDE_SKILL_DIR}/estilos.md`, ou prints de referência do usuário.
- Narração: sem narração, ou o usuário grava e salva `voz.wav` na pasta do vídeo.

### 2. Roteiro em cenas (texto, rápido)
Leia `${CLAUDE_SKILL_DIR}/estilos.md` no estilo escolhido. Mostre:
- A ideia em 1 frase e o fio visual que liga as cenas, por exemplo, o ponto que vira círculo, que vira onda.
- Uma tabela: número | início e fim em segundos | o que acontece | texto na tela | papel do som.
- Os fatos da tela com a fonte de cada um.
Pergunte: aprova, muda cenas ou outro ângulo? Revise até aprovar. Salve em `roteiro.md` na pasta do vídeo.

### 3. Monte a pasta e desenhe as cenas
- Crie `animacoes/NOME-DO-VIDEO/` no diretório atual e copie `${CLAUDE_SKILL_DIR}/modelo/index.html` pra lá.
- Ajuste `CONFIG` (largura, altura, fps 30, duração, bpm) e `COR` com a paleta do estilo.
- Escreva uma função por cena e preencha `CENAS` e `STORYBOARD`, com um tempo-chave por cena, o momento em que ela está mais completa.
- Cada cena começa e termina com movimento: entrada nos primeiros 0,5 s e saída ou ponte pra próxima no último 0,5 s.

### 4. Storyboard pra aprovação
Rode `node ${CLAUDE_SKILL_DIR}/scripts/render.mjs animacoes/NOME --storyboard`, abra `animacoes/NOME/saida/storyboard.png` com a ferramenta de leitura de imagem e confira cada painel com a lista de conferência. Corrija o que falhar e mostre ao usuário o caminho da imagem. Peça aprovação por número de painel. Só siga com OK.

### 5. Rascunho
Rode com `--rascunho`, que renderiza em metade da resolução. Abra `saida/folha.png`, a folha de contato com 16 quadros espalhados pelo vídeo, e confira. Pra ver um momento exato, use `--quadros 4.5,9.2`.

### 6. Render final e conferência
Rode sem opção nenhuma. Saem `saida/video.mp4` e `saida/folha.png`. Abra a folha e passe a lista de conferência. Se algo falhar, corrija o código, renderize de novo e repita. Faça no máximo 3 voltas sozinho: na quarta, mostre o problema e pergunte.

### 7. Entrega
Diga em poucas linhas: o caminho do MP4, a duração, o formato, o que a folha de contato mostrou, o que foi corrigido e o que você não consegue conferir, como o som, que você não escuta. Pergunte o que mudar: roteiro, visual, ritmo ou som.

## Lista de conferência (storyboard e folha de contato)
- Nenhum texto cortado na borda nem encostado em outro elemento.
- Nenhum quadro vazio, todo preto ou igual ao anterior quando deveria ter movimento.
- Contraste: texto claro em fundo escuro ou o contrário, nunca meio-tom com meio-tom.
- Cada cena tem um elemento principal claro, e o olho sabe onde olhar.
- O fio visual aparece em todas as cenas.
- Em 9:16, nada importante nos 15% de baixo nem nos 10% de cima, onde ficam os botões do app.
- A última cena fica pelo menos 1,5 s parada no texto final.

## Som
A função `trilha()` do modelo gera uma base no BPM e um acorde por cena. Pra mudar o clima, troque as notas e o BPM: 80 a 95 é calmo, 100 a 120 é animado. Ponha uma batida forte no momento mais importante e 0,5 s de silêncio antes dele. Se existir `voz.wav` ou `voz.mp3` na pasta do vídeo, o render coloca a voz por cima e abaixa a trilha pra 30%.

## Uso do plano do Claude
O render roda no computador e não gasta uso do plano. Gasta escrever as cenas, ler storyboard e folha de contato e cada volta de correção. Por isso o storyboard vem antes e o rascunho sai em metade da resolução: errar no roteiro custa uma mensagem, errar no render custa uma volta inteira.
