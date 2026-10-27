#!/bin/bash
# Junta a cena (src/cena.js + three.js) num index.html só, sem nada de fora.
set -e
cd "$(dirname "$0")"
B=/tmp/claude-0/-home-user-Privacycopy/c875fe5c-908d-53e1-acd7-2081b4307049/scratchpad/build
NODE_PATH=$B/node_modules $B/node_modules/.bin/esbuild src/cena.js --bundle --format=iife --minify --legal-comments=none --outfile=$B/cena.bundle.js --log-level=warning
python3 - "$B/cena.bundle.js" <<'PY'
import sys
js = open(sys.argv[1]).read().replace('</script', '<\\/script')
logo = ''
try: logo = open('src/logo.js').read()
except FileNotFoundError: pass
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
<script>''' + logo + '''</script>
<script>''' + js + '''</script>
</body>
</html>
'''
open('index.html','w').write(html)
print('index.html', len(html)//1024, 'KB')
PY
