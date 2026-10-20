#!/usr/bin/env node
// render.mjs: transforma a página da animação em MP4, storyboard, quadros soltos ou folha de contato.
// uso:
//   node render.mjs PASTA                         -> PASTA/saida/video.mp4 + PASTA/saida/folha.png
//   node render.mjs PASTA --storyboard            -> PASTA/saida/storyboard.png (um quadro por cena)
//   node render.mjs PASTA --quadros 2.5,7,12      -> PASTA/saida/quadro-2.5.png ...
//   node render.mjs PASTA --rascunho              -> vídeo em metade da resolução, pra conferir rápido
// PASTA tem o index.html da animação (copiado de modelo/index.html).
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const pasta = resolve(args[0] || '.');
const tem = (f) => args.includes(f);
const valor = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const pagina = join(pasta, 'index.html');
if (!existsSync(pagina)) { console.error('Não achei ' + pagina); process.exit(1); }
const saida = join(pasta, 'saida');
mkdirSync(saida, { recursive: true });

function ffmpeg(lista) {
  const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...lista], { stdio: 'inherit' });
  if (r.error) { console.error('FFmpeg não encontrado no PATH. Instale e rode de novo.'); process.exit(1); }
  if (r.status !== 0) process.exit(r.status);
}

const escala = tem('--rascunho') ? 0.5 : 1;
const navegador = await chromium.launch();
const aba = await navegador.newPage({ deviceScaleFactor: 1 });
await aba.goto(pathToFileURL(pagina).href + '?render=1');
await aba.waitForFunction(() => typeof window.seek === 'function' && window.CONFIG);
const C = await aba.evaluate(() => window.CONFIG);
const L = Math.round(C.largura * escala), A = Math.round(C.altura * escala);
await aba.setViewportSize({ width: L, height: A });
await aba.evaluate((e) => window.definirEscala && window.definirEscala(e), escala);

async function foto(t, arquivo) {
  const dados = await aba.evaluate((t) => { window.seek(t); return document.getElementById('c').toDataURL('image/png'); }, t);
  writeFileSync(arquivo, Buffer.from(dados.split(',')[1], 'base64'));
}

if (tem('--storyboard') || valor('--quadros')) {
  const lista = valor('--quadros') ? valor('--quadros').split(',').map(Number) : await aba.evaluate(() => window.STORYBOARD || []);
  if (!lista.length) { console.error('Sem tempos: preencha STORYBOARD no index.html ou passe --quadros'); process.exit(1); }
  if (valor('--quadros')) {
    for (const t of lista) await foto(t, join(saida, 'quadro-' + t + '.png'));
    console.log('Quadros salvos em ' + saida);
  } else {
    const dir = join(saida, 'storyboard'); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir);
    for (let i = 0; i < lista.length; i++) await foto(lista[i], join(dir, String(i + 1).padStart(2, '0') + '.png'));
    const col = Math.min(4, lista.length), lin = Math.ceil(lista.length / col);
    ffmpeg(['-framerate', '1', '-i', join(dir, '%02d.png'), '-vf', 'scale=640:-2,tile=' + col + 'x' + lin + ':padding=8:margin=8', '-frames:v', '1', join(saida, 'storyboard.png')]);
    console.log('Storyboard: ' + join(saida, 'storyboard.png') + ' (' + lista.length + ' cenas, na ordem do STORYBOARD)');
  }
  await navegador.close();
  process.exit(0);
}

// vídeo completo: um PNG por quadro, trilha gerada em código, FFmpeg junta tudo
const dir = join(saida, 'quadros'); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir);
const total = Math.round(C.duracao * C.fps);
const inicio = Date.now();
for (let i = 0; i < total; i++) {
  await foto(i / C.fps, join(dir, String(i).padStart(5, '0') + '.png'));
  if (i % C.fps === 0) process.stdout.write('\rquadro ' + i + ' de ' + total);
}
console.log('\rquadros prontos: ' + total + ' em ' + Math.round((Date.now() - inicio) / 1000) + ' s');
const entradas = [], filtro = [];
const wav = await aba.evaluate(async () => (window.trilha ? await window.trilha() : null));
await navegador.close();
if (wav) { writeFileSync(join(saida, 'trilha.wav'), Buffer.from(wav, 'base64')); entradas.push(join(saida, 'trilha.wav')); }
// narração opcional: um arquivo voz.wav ou voz.mp3 na PASTA entra por cima da trilha, que abaixa pra 30%
const voz = ['voz.wav', 'voz.mp3'].map((f) => join(pasta, f)).find(existsSync);
if (voz) entradas.push(voz);
if (entradas.length === 2) filtro.push('-filter_complex', '[1:a]volume=0.3[m];[m][2:a]amix=inputs=2:duration=first:normalize=0[a]', '-map', '0:v', '-map', '[a]');
else if (entradas.length === 1) filtro.push('-map', '0:v', '-map', '1:a');
const video = join(saida, tem('--rascunho') ? 'rascunho.mp4' : 'video.mp4');
ffmpeg(['-framerate', String(C.fps), '-i', join(dir, '%05d.png'), ...entradas.flatMap((e) => ['-i', e]), ...filtro,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart',
  ...(entradas.length ? ['-c:a', 'aac', '-b:a', '192k', '-shortest'] : []), video]);
// folha de contato: 16 quadros espalhados pelo vídeo numa grade 4x4, pro Claude olhar e corrigir
ffmpeg(['-i', video, '-vf', 'fps=16/' + C.duracao + ',scale=480:-2,tile=4x4:padding=6:margin=6', '-frames:v', '1', join(saida, 'folha.png')]);
if (!tem('--manter-quadros')) rmSync(dir, { recursive: true, force: true });
console.log('Vídeo: ' + video + '\nFolha de contato: ' + join(saida, 'folha.png'));
