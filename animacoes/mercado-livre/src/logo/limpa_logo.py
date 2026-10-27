# Recorta o logo (símbolo e nome), aumenta 8x com bordas nítidas e tira o fundo amarelo.
import sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
NAVY = np.array([45, 50, 119]); WHITE = np.array([255, 255, 255]); YEL = np.array([255, 230, 0])
def processa(box, nome, emblema):
    c = im.crop(box); W, H = c.size; K = 16
    big = c.resize((W * K, H * K), Image.BICUBIC).filter(ImageFilter.GaussianBlur(K * (0.55 if emblema else 0.75)))
    a = np.array(big).astype(float)
    pal = np.stack([NAVY, WHITE, YEL]).astype(float)
    d = ((a[:, :, None, :] - pal[None, None]) ** 2).sum(-1)
    # amarelo escuro do miolo também conta como amarelo
    d[:, :, 2] = np.minimum(d[:, :, 2], ((a - np.array([248, 200, 10])) ** 2).sum(-1))
    lab = d.argmin(-1).astype(np.uint8)
    rgb = np.zeros_like(a)
    rgb[lab == 0] = NAVY; rgb[lab == 1] = WHITE
    ymask = lab == 2
    rgb[ymask] = np.clip(a[ymask] * [1, 1, 0] + [0, 0, 0], 0, 255)
    alpha = np.full(lab.shape, 255, np.uint8)
    if emblema:
        fora = np.zeros_like(ymask); h, w = ymask.shape
        pilha = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
        while pilha:
            x, y = pilha.pop()
            if x < 0 or y < 0 or x >= w or y >= h or fora[y, x] or not ymask[y, x]: continue
            # preenche a linha inteira de uma vez
            x0 = x
            while x0 > 0 and ymask[y, x0 - 1] and not fora[y, x0 - 1]: x0 -= 1
            x1 = x
            while x1 < w - 1 and ymask[y, x1 + 1] and not fora[y, x1 + 1]: x1 += 1
            fora[y, x0:x1 + 1] = True
            for yy in (y - 1, y + 1):
                if 0 <= yy < h:
                    seg = ymask[yy, x0:x1 + 1] & ~fora[yy, x0:x1 + 1]
                    if seg.any():
                        idx = np.where(seg)[0]; starts = idx[np.r_[True, np.diff(idx) > 1]]
                        pilha.extend((x0 + int(i), yy) for i in starts)
        alpha[fora] = 0
    else:
        alpha[lab != 0] = 0
        rgb[:] = NAVY
    img = Image.fromarray(np.dstack([rgb.astype(np.uint8), alpha]), 'RGBA')
    # pré-multiplica pra reduzir sem franja, depois reduz 2x (antisserrilhado)
    img = img.resize((W * K // 2, H * K // 2), Image.LANCZOS)
    bb = img.getchannel('A').getbbox(); img = img.crop(bb)
    img.save(out + '/' + nome + '.png'); print(nome, img.size)
processa((112, 100, 256, 210), 'emblema', True)
processa((258, 100, 476, 210), 'nome', False)
