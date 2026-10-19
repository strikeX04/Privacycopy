---
name: analisar-hook
description: Analisa o hook (os primeiros segundos) de um vídeo de anúncio, Reels ou TikTok e mostra como aplicar o mesmo hook no vídeo do usuário, no mesmo ângulo ou em ângulos diferentes. Use quando o usuário mandar um vídeo ou link e pedir para entender, quebrar, copiar, modelar, clonar ou adaptar o hook, o gancho, a abertura ou o começo do vídeo, ou disser "analisa esse criativo", "por que esse vídeo prende" ou "faz um hook assim pro meu produto".
---

# Analisar Hook

Objetivo: separar **o que o hook faz** (o mecanismo) de **o que ele mostra** (o conteúdo),
para o usuário reaproveitar o mecanismo no próprio produto sem copiar o vídeo.

Responda sempre em português do Brasil, direto e prático. O resultado final é roteiro
gravável, não teoria.

## Passo 1. Pegar o vídeo

Aceite qualquer uma destas entradas:

- **Arquivo de vídeo** (mp4, mov, webm). No claude.ai os anexos ficam em `/mnt/user-data/uploads/`.
- **Link** de TikTok, Instagram, YouTube ou Facebook. O script tenta baixar com `yt-dlp`.
  Redes sociais costumam bloquear download vindo de servidor. Se falhar, peça o arquivo
  (no celular dá para salvar o vídeo e anexar) e siga em frente.
- **Anúncio da biblioteca do Gethookd** (se o conector estiver ligado): use
  `get_ad`, `transcribe_ad` e `get_ad_hooks` para pegar mídia e transcrição, e
  `get_ad_media` para baixar o vídeo e rodar o script nele.
- **Sem vídeo nenhum**: se o usuário só descrever ou colar a fala, faça a análise com o que tiver
  e diga o que ficou de fora (por exemplo, o visual).

## Passo 2. Extrair a matéria-prima

```bash
python3 <pasta-da-skill>/scripts/extrair_hook.py "VIDEO_OU_LINK" --saida hook_analise
```

Opções: `--segundos 6` (tamanho da janela do hook), `--modelo small` (Whisper; use `base` se
estiver lento, `medium` se a fala estiver ruim), `--idioma pt`.

Dependências: `ffmpeg` (obrigatório), `pip install faster-whisper pillow numpy` para a fala e
`pip install yt-dlp` para links. Se o Whisper não puder ser instalado ou baixar o modelo, o
script continua sem a fala. Nesse caso peça a fala ou a legenda ao usuário.

O script imprime um relatório com duração, formato, cortes de cena, volume do início,
transcrição com tempos e o caminho de duas imagens:

- `hook_grade.jpg`: um frame a cada 0,5s do hook, com o tempo marcado.
- `corpo_grade.jpg`: frames espalhados pelo resto do vídeo.

**Abra as duas imagens com a ferramenta de leitura.** Sem olhar os frames você não
vê o hook visual, o texto na tela nem o enquadramento. Se algo passar rápido demais, abra
os frames soltos da pasta `frames/`.

## Passo 3. Decompor o hook

Use `references/tipos-de-hook.md` para classificar. Preencha esta ficha:

| Camada | O que observar |
|---|---|
| **Visual (0 a 1s)** | Primeiro frame, enquadramento, movimento, rosto, produto, algo estranho ou fora do lugar |
| **Falado** | A primeira frase exata e quando ela começa |
| **Texto na tela** | O que está escrito, onde e por quanto tempo |
| **Som e ritmo** | Começa alto ou em silêncio, música, efeito, cortes no hook |
| **Promessa** | O que o espectador espera ganhar se continuar assistindo |
| **Loop aberto** | Qual pergunta fica sem resposta e onde ela é respondida |
| **Ponte** | Como o hook vira o corpo do vídeo (a frase ou o corte que segura depois dos 3s) |

Depois classifique:

- **Tipo de hook** (um principal e no máximo um secundário), pela lista de referência.
- **Gatilho psicológico** que faz parar de rolar a tela.
- **Ângulo** do vídeo inteiro: a razão pela qual a pessoa compraria (dor, desejo, medo,
  economia, status, praticidade, prova, novidade, inimigo comum...).
- **Nível de consciência** do público para quem o hook fala: inconsciente, consciente do
  problema, da solução, do produto ou pronto para comprar.
- **Formato**: UGC, talking head, demonstração, POV, antes/depois, entrevista, tela verde,
  slideshow etc.

## Passo 4. Tirar a fórmula

Escreva o hook como um **molde com lacunas**, sem nada específico do vídeo original. Exemplo:

> Original: "Pare de jogar dinheiro fora com creme que não funciona."
> Fórmula: "Pare de [ação que o público faz e acha certa] com [categoria] que [falha]."

Faça o mesmo para o visual: "[Close na pessoa fazendo a ação errada] e corte seco para [produto]".

## Passo 5. Entender o produto do usuário

Se ainda não souber, pergunte numa mensagem só (no máximo 4 perguntas):

1. Qual é o produto e o que ele resolve?
2. Para quem? (público e principal dor ou desejo)
3. Você já tem um vídeo gravado para adaptar, ou vai gravar do zero?
4. Quer o mesmo ângulo do vídeo de referência, outros ângulos ou os dois?

Se a loja Shopify estiver conectada e o usuário citar o produto, busque os dados lá em vez
de perguntar. Se o usuário mandou o **vídeo dele** também, rode o script nele e diga
exatamente o que trocar nos primeiros segundos: o que regravar, o que cortar e em que
segundo a ponte entra.

## Passo 6. Entregar as adaptações

Siga `references/como-adaptar.md`. Por padrão entregue:

- **2 versões no mesmo ângulo**: mesma fórmula, conteúdo do produto do usuário.
- **2 versões em ângulos diferentes**: mesmo mecanismo de hook, outra razão de compra.

Se o usuário pedir só um dos dois, entregue só aquele.

## Formato da resposta

Seja curto. O usuário provavelmente está no celular.

```
## O hook em uma frase
[o que ele faz e por que prende, 1 a 2 linhas]

## Raio-X
- Tipo: ... | Gatilho: ... | Ângulo: ... | Formato: ...
- Visual (0-1s): ...
- Fala: "..." (começa em Xs)
- Texto na tela: "..."
- Ritmo: ...
- Loop aberto: ... (fecha em Xs)
- Ponte: ...

## Fórmula
Fala: "..."
Visual: ...

## Pro seu produto

### Mesmo ângulo
**Versão 1: [nome curto]**
- 0-1s visual: ...
- Fala: "..."
- Texto na tela: "..."
- Ponte (3-6s): "..."
- Por que funciona: ...

**Versão 2 ...**

### Outro ângulo: [nome do ângulo]
(mesmos campos)

## Cuidados
[só o que se aplicar: promessa que a plataforma de anúncios pode reprovar, claims de saúde,
direito de imagem, música com direitos autorais]
```

## Regras

- Não copie fala, roteiro ou cenas do original palavra por palavra. Reaproveite a estrutura e o
  mecanismo.
- Não invente o que não viu. Se a transcrição ou os frames não mostram algo, diga que não deu
  para ver.
- Use números e promessas que o usuário consiga provar. Avise quando uma promessa tende a ser
  reprovada pelo Meta ou pelo TikTok (antes/depois em saúde e estética, "cura", resultado
  garantido, atributos pessoais como "você que é gordo...").
- Se o hook original for fraco, diga isso e explique o porquê antes de adaptar.
