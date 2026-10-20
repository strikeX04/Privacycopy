# Estilos do /animate

Cada estilo diz a paleta, o traço, o movimento e o que evitar. Movimento "em 2" quer dizer redesenhar o traço a cada 2 quadros com uma variação pequena da semente, o que dá cara de feito à mão: use `rng(CONFIG.semente + Math.floor(t * CONFIG.fps / 2))`.

## 1. Papel recortado
- Paleta: fundo creme #f3ead8, formas em #e4572e, #f2a541, #2a9d8f, #264653.
- Traço: formas chapadas sem contorno, bordas com leve serrilhado, sombra deslocada 6 px pra baixo e pra direita em #00000033.
- Movimento: em 2, peças que entram deslizando com um pequeno salto no fim.
- Evite: degradê, brilho, linha fina.

## 2. Hachura
- Paleta: papel #f5f1e8, tinta #1d1d1d, um destaque #c0392b.
- Traço: sombra feita de linhas paralelas inclinadas a 45 graus, contorno com tremor leve.
- Movimento: em 2, desenho que se completa como se estivesse sendo traçado.
- Evite: preenchimento chapado e cor demais.

## 3. Riso
- Paleta: rosa #ff48b0, azul #0078bf, amarelo #ffe800 sobre papel #f7f3e9, com sobreposição em modo multiply.
- Traço: formas chapadas com registro desalinhado de 3 a 5 px entre as cores e granulado por cima.
- Movimento: em 2, cortes secos no tempo do BPM.
- Evite: preto puro e sombra realista.

## 4. Caderno de esboço
- Paleta: folha #fdfaf3 com pauta azul-clara #cfe0f5, grafite #3b3b3b, marca-texto #fff176.
- Traço: lápis com pressão variável, rabiscos de anotação, setas desenhadas à mão.
- Movimento: em 2, escrita que aparece letra a letra e setas que se desenham.
- Evite: fonte geométrica perfeita no texto principal.

## 5. Matemática
- Paleta: fundo #101418, linhas #f4efe6, destaque #ff7a1a, apoio #4cc9f0. É a paleta padrão do modelo.
- Traço: linhas limpas, eixos, grades e fórmulas, à maneira das animações de matemática do YouTube.
- Movimento: em 1, suave e contínuo, transformações que mostram uma forma virando a outra.
- Evite: textura e tremor.

## 6. Pixel
- Paleta: até 16 cores, por exemplo #1a1c2c, #5d275d, #b13e53, #ef7d57, #ffcd75, #a7f070, #38b764, #257179.
- Traço: desenhe numa grade de 320 x 180 (ou 180 x 320 no 9:16) e amplie com `ctx.imageSmoothingEnabled = false`.
- Movimento: em 2, passos inteiros de pixel, nada de meio pixel.
- Evite: rotação suave e transparência.

## 7. Isométrico
- Paleta: fundo #0f172a, faces #38bdf8, #0ea5e9 e #0369a1 pra luz, meio e sombra, linhas #e2e8f0.
- Traço: blocos e plataformas em projeção isométrica de 30 graus, contorno fino.
- Movimento: em 1, câmera que desliza devagar e blocos que sobem do chão.
- Evite: perspectiva com ponto de fuga.

## 8. O seu visual
O usuário manda 2 a 5 prints de referência. Antes de desenhar:
1. Abra cada print e anote a paleta em código hexadecimal, a espessura do traço em relação à altura da tela, o tipo de fonte, a textura e quanto da tela fica vazio.
2. Escreva essas medidas aqui embaixo, numa seção nova com o nome do estilo, no mesmo formato dos 7 acima.
3. Faça 2 quadros de teste com `--quadros` e mostre ao lado da referência antes do storyboard.
Nunca copie personagem, logo ou marca de outra pessoa: o estilo é paleta, traço e ritmo.
