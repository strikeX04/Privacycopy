"""Sound design for the Fogarel spot. Every time comes from fogarel.timeline.json.

    python3 -m sfx sfx/cues/fogarel.py
"""

import wave

from sfx.dsp import compress
from sfx.synth import SR, blip, chime, click, crackle, envelope, flames, impact, pad, pop, roar, sizzle, whoosh

TIMELINE = "fogarel.timeline.json"
OUT = "public/fogarel/mix.wav"
VOICE = "public/fogarel/voz.wav"
TARGET_LUFS = -14.0

# B minor while the stress builds, resolving to D major when the fire becomes care.
B_MIN = [123.47, 185.0, 246.94, 277.18, 293.66]
D_MAJ9 = [146.83, 220.0, 277.18, 329.63, 369.99]
G_MAJ7 = [98.0, 196.0, 246.94, 293.66, 369.99]
D_69 = [146.83, 220.0, 293.66, 329.63, 493.88, 587.33]


def load_voice(path):
    w = wave.open(path)
    assert w.getframerate() == SR and w.getnchannels() == 1
    raw = w.readframes(w.getnframes())
    import array

    a = [x / 32768 for x in array.array("h", raw)]
    # even out the soft delivery so the voice sits above the bed
    a, _ = compress(a, a, thresh_db=-30.0, ratio=3.0, attack=0.008, release=0.12)
    peak = max(map(abs, a))
    return [x / peak * 0.9 for x in a]


def score(mix, tl):
    s1, s2, s3, s4, s5 = tl["s1"], tl["s2"], tl["s3"], tl["s4"], tl["s5"]
    dur = tl["duration"]
    put = mix.put
    vo = tl["vo"]["start"]

    # voice on top of everything
    put(vo, load_voice(VOICE), 1.0)

    # music bed, from the first word to the end
    volume = envelope([
        (0, 0), (s2["reveal"], 0), (s2["reveal"] + 1.5, 0.8), (s2["calm"], 0.9),
        (s2["calm"] + 1.0, 1.1), (s5["enter"], 1.1), (s5["name"] + 0.3, 1.25), (dur - 1.5, 1.25), (dur, 0),
    ])
    chords = [
        (0, B_MIN), (s2["calm"], D_MAJ9), (s3["enter"] + 0.6, G_MAJ7),
        (s3["stones"], D_MAJ9), (s4["enter"], G_MAJ7), (s5["name"], D_69),
    ]
    mix.put_stereo(0, *pad(dur, chords, volume=volume, tremolo=0.18, detune=0.3), gain=0.03)

    # scene 1: night wind, embers, the inhale, the roar, the fire
    put(0, whoosh(s2["reveal"], 180, 420, peak=0.5, q=0.4), 0.10)
    put(0, crackle(s1["white"], rate=6, seed=1), 0.05, 0.3)
    put(s1["inhale"], whoosh(s1["strike"] - s1["inhale"], 1800, 260, peak=0.92), 0.22, -0.2)
    put(s1["inhale"] + 0.2, roar(1.0, 55, 62), 0.06, -0.2)
    put(s1["strike"] - 0.02, roar(1.9, 72, 118), 0.20, -0.15)
    put(s1["strike"], impact(1.3), 0.24)
    put(s1["strike"] + 0.08, flames(s1["fireEnd"] - s1["strike"] + 0.5), 0.17, 0.35)
    put(s1["strike"] + 0.1, crackle(2.4, rate=60, seed=2), 0.12, 0.45)
    put(s1["flood"], whoosh(s1["white"] - s1["flood"] + 0.4, 500, 3200, peak=0.75), 0.18, 0.2)

    # scene 2: the candle lights, crackles harder with every stress word, then settles
    put(s2["candle"] - 0.1, whoosh(0.45, 1400, 260, peak=0.25), 0.16)
    put(s2["candle"], blip(293.66, dur=0.8, tau=0.3), 0.10)
    put(s2["candle"], crackle(s2["w1"] - s2["candle"], rate=4, seed=3), 0.06)
    put(s2["w1"], crackle(s2["w2"] - s2["w1"], rate=9, seed=4), 0.08)
    put(s2["w2"], crackle(s2["w3"] - s2["w2"], rate=16, seed=5), 0.09)
    put(s2["w3"], crackle(s2["calm"] - s2["w3"] + 0.4, rate=26, seed=6), 0.10)
    put(s2["calm"] + 0.4, crackle(s3["enter"] - s2["calm"], rate=3, seed=7), 0.05)
    for w, note, pan in [(s2["w1"], 246.94, -0.25), (s2["w2"], 220.0, 0.0), (s2["w3"], 185.0, 0.25)]:
        put(w, whoosh(0.3, 600, 2200, peak=0.4), 0.07, pan)
        put(w + 0.1, blip(note, dur=0.6, tau=0.18), 0.12, pan)
    put(s2["calm"], whoosh(1.4, 3000, 380, peak=0.3), 0.10)
    put(s2["calm"] + 0.1, sizzle(1.2, fc=5200), 0.04)

    # scene 3: into the spa, stones land and hiss, oil drops
    put(s2["glow"], whoosh(1.2, 300, 1200, peak=0.6, q=0.5), 0.09)
    put(s3["title"], whoosh(0.3, 500, 2400, peak=0.45), 0.07)
    put(s3["title"] + 0.15, blip(587.33, dur=0.5, tau=0.15), 0.09)
    for i in range(5):
        t = s3["stones"] + i * 0.16
        put(t + 0.08, click(700 + i * 40, dur=0.06), 0.14, -0.1 + i * 0.12)
        put(t + 0.1, sizzle(0.9, fc=6000 + i * 300), 0.035, -0.1 + i * 0.12)
    put(s3["stones"], pop(587.33, 880.0), 0.14)
    put(s3["oil"], pop(659.25, 987.77), 0.14)
    put(s3["oil"] + 0.45, pop(520, 1500, dur=0.12), 0.20, 0.15)
    put(s3["oil"] + 0.5, blip(1174.66, dur=0.9, tau=0.35), 0.05, 0.15)

    # scene 4: a puff of steam, the dragon, its happy little sigh
    put(s4["enter"] - 0.3, whoosh(1.2, 3200, 700, peak=0.35), 0.14)
    put(s4["enter"] - 0.2, sizzle(1.0, fc=4800), 0.05)
    put(s4["line"] + 0.25, blip(440.0, dur=0.5, tau=0.15), 0.07)
    put(s4["dragon"] - 0.4, blip(554.37, dur=0.6, tau=0.2), 0.08)
    put(s4["puff"], whoosh(0.4, 1500, 380, peak=0.2), 0.12, 0.3)
    put(s4["puff"] - 0.05, roar(0.9, 48, 54), 0.045, 0.3)

    # scene 5: the ember rises into the logo
    put(s5["enter"] - 0.15, whoosh(0.9, 280, 2600, peak=0.85), 0.12)
    put(s5["name"], chime([587.33, 739.99, 880.0, 1174.66], dur=2.6, tau=0.9), 0.15)
    put(s5["tag"], blip(880.0, dur=0.5, tau=0.15), 0.07)
    put(s5["relax"] + 0.1, blip(739.99, dur=0.6, tau=0.2), 0.07)
    put(s5["cta"], pop(587.33, 880.0), 0.16)
    put(s5["cta"] + 0.05, click(1500, dur=0.05), 0.08)
    put(s5["enter"], crackle(dur - s5["enter"], rate=2.5, seed=9), 0.035)
