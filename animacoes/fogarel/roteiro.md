# Fogarel: comercial de 30 s

9:16 (1080 x 1920) · 30 fps · narração em português · feito com o toolkit `claude-motion/`

## Narração (ElevenLabs, voz "Bianca – Voz Serena")
> Sabe aquele fogo do dia a dia? A pressa... o estresse... a tensão nos ombros.
> Aqui, a gente transforma esse fogo em calor que cuida.
> Pedras quentes, óleos aromáticos... e mãos que sabem acalmar até um dragão.
> Fogarel. Casa de massagem. Venha relaxar. Agende o seu horário.

## Cenas
| Tempo | O que acontece |
|---|---|
| 0 a 3,9 s | Noite, lua cheia. Um dragão no penhasco inspira (a garganta acende) e cospe fogo no vale. O fogo toma a tela. |
| 3,9 a 12,6 s | As faíscas se recolhem numa vela. "a pressa", "o estresse", "a tensão nos ombros" aparecem e a chama fica agitada. No "Aqui", as palavras queimam e a chama se acalma. |
| 12,6 a 18,2 s | A vela vai pro canto de uma sala de massagem. "calor que cuida." Pedras quentes nas costas da cliente, uma gota de óleo cai. |
| 18,2 a 21,3 s | Um sopro de vapor e quem está na maca é o dragão, de olhos fechados, com pedras nas costas. "até um dragão." |
| 21,3 a 30 s | Uma faísca do nariz do dragão sobe e vira a chama do logo. "Fogarel · Casa de massagem · Venha relaxar · Agende seu horário". |

## Refazer
```bash
cd claude-motion
python3 -m sfx sfx/cues/fogarel.py
npx remotion render Fogarel out/fogarel-silent.mp4
ffmpeg -y -i out/fogarel-silent.mp4 -i public/fogarel/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart -shortest out/fogarel.mp4
```
