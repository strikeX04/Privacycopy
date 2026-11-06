#!/usr/bin/env node
// Exporta a música e os efeitos do index.html em arquivos separados (saida/musica.wav e saida/efeitos.wav),
// para a mixagem com a narração em mix.sh.
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Playwright vem da instalação do sistema: rode com NODE_PATH=$(npm root -g)
const { chromium } = createRequire(import.meta.url)('playwright');
const pasta = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(pasta, 'saida'), { recursive: true });
const nav = await chromium.launch();
const aba = await nav.newPage();
await aba.goto(pathToFileURL(join(pasta, 'index.html')).href + '?render=1');
const { musica, efeitos } = await aba.evaluate(() => window.trilhaPartes());
writeFileSync(join(pasta, 'saida', 'musica.wav'), Buffer.from(musica, 'base64'));
writeFileSync(join(pasta, 'saida', 'efeitos.wav'), Buffer.from(efeitos, 'base64'));
await nav.close();
console.log('saida/musica.wav e saida/efeitos.wav prontos');
