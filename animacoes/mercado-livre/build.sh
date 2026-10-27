#!/bin/bash
# Junta a cena (src/cena.js + three.js) num index.html só, sem nada de fora.
set -e
cd "$(dirname "$0")"
B=/tmp/claude-0/-home-user-Privacycopy/c875fe5c-908d-53e1-acd7-2081b4307049/scratchpad/build
NODE_PATH=$B/node_modules $B/node_modules/.bin/esbuild src/cena.js --bundle --format=iife --minify --legal-comments=none --outfile=$B/cena.bundle.js --log-level=warning
python3 - "$B/cena.bundle.js" <<'PY'
import sys
js = open(sys.argv[1]).read().replace('</script', '<\\/script')
import base64
def uri(f): return 'data:image/png;base64,' + base64.b64encode(open('src/logo/' + f, 'rb').read()).decode()
logo = """
// logo do usuário: carrega as imagens e só então liga a cena
(function () {
  const fontes = { LOGO_EMBLEMA: '%s', LOGO_LINHA: '%s', LOGO_NOME: '%s' };
  const nomes = Object.keys(fontes); let faltam = nomes.length;
  nomes.forEach((n) => { const im = new Image(); im.onload = () => { window[n] = im; if (--faltam === 0) liga(); }; im.src = fontes[n]; });
  function liga() { const s = document.createElement('script'); s.textContent = document.getElementById('cena').textContent; document.body.appendChild(s); }
})();
""" % (uri('emblema.png'), uri('emblema_linha.png'), uri('nome.png'))
html = '''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Mercado Livre: da caixa ao logo</title>
<style>
  html, body { margin: 0; background: #111; height: 100%; }
  canvas { display: block; max-width: 100vw; max-height: 100vh; margin: auto; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script id="cena" type="text/plain">''' + js + '''</script>
<script>''' + logo + '''</script>
</body>
</html>
'''
open('index.html','w').write(html)
print('index.html', len(html)//1024, 'KB')
PY
