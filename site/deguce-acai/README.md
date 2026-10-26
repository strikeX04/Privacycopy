# Site Deguce Açaí

Site de uma página: apresentação, cardápio, montagem do pedido e localização.
O cliente monta o açaí (tipo, tamanho, acompanhamentos, quantidade), informa nome,
entrega ou retirada e pagamento, e o pedido abre pronto no WhatsApp da loja.

## Editar

Tudo que muda com frequência está em `config.js`: número do WhatsApp, endereço,
horário, tipos de açaí, tamanhos (com preço opcional), acompanhamentos e formas de pagamento.
Quando o endereço é preenchido, o mapa do Google aparece sozinho.

## Publicar

São só arquivos estáticos (`index.html`, `styles.css`, `config.js`, `app.js`, `assets/`).
Funcionam em GitHub Pages, Netlify ou Vercel, sem servidor.
