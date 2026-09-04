// Web Audio API Synthesizer for Janmashtami Festive Audio
// Generates authentic Dholak beats, temple bells, bansuri (flute), cheers, and pot break effects.

class FestiveAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private dholakTimer: number | null = null;
  private fluteTimer: number | null = null;

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopFestiveMusic();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play a crisp Dholak drum beat (low base "Dha" or high rim "Ta")
  public playDholak(type: 'dha' | 'ta' | 'tin' = 'dha', volume = 0.8) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (type === 'dha') {
      // Low resonant bass drum
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.22);

      gain.gain.setValueAtTime(volume * 0.9, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    } else if (type === 'ta') {
      // High snappy rim sound with noise burst
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);

      gain.gain.setValueAtTime(volume * 0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);

      // Add high slap noise
      this.playSnapNoise(0.05, volume * 0.4);
    } else {
      // Resonant "Tin" harmonic
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.25);

      gain.gain.setValueAtTime(volume * 0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.26);
    }
  }

  private playSnapNoise(duration: number, volume: number) {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1200;

    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  // Sparkling temple bell / Manjira chime
  public playTempleBell(freq = 1560, volume = 0.5) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [freq, freq * 1.51, freq * 2.02, freq * 2.75];

    freqs.forEach((f, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = index === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, t);

      const decay = 1.2 / (index + 1);
      gain.gain.setValueAtTime(volume * (0.3 / (index + 1)), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + decay);
    });
  }

  // Krishna's Bansuri (Flute) melodic note
  public playBansuriNote(noteFreq: number, duration = 0.8, volume = 0.35) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    // Flute breathiness filter
    osc.type = 'sine';
    osc.frequency.setValueAtTime(noteFreq, t);

    // Subtle natural vibrato
    vibrato.frequency.value = 5.2; // 5Hz vibrato
    vibratoGain.gain.value = noteFreq * 0.015;
    vibrato.connect(osc.frequency);

    // Warm envelope (gentle attack and gentle release)
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    vibrato.start(t);
    osc.start(t);
    vibrato.stop(t + duration);
    osc.stop(t + duration);
  }

  // "Govinda Aala Re!" and energetic crowd cheer
  public playCheerSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Harmonized chorus chords & excitement sweep
    const notes = [261.63, 329.63, 392.00, 523.25]; // C major celebratory chord
    const t = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * 0.9, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, t + 0.6);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200 + i * 200, t);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 1.25);
    });

    // Add crowd roar texture
    this.playSnapNoise(0.9, 0.25);
  }

  // Sparkling joyful cheering pop-up audio effect (chime triad + mini crowd cheer)
  public playCheerPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Harmonious ascending triad (E5, G#5, B5, E6)
    const notes = [659.25, 830.61, 987.77, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.001, t + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.16 / (idx + 1), t + idx * 0.04 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.38);
    });

    // Cheerful mini clap/cheer noise
    this.playSnapNoise(0.08, 0.12);
  }

  // Pot break crash & butter splash
  public playPotBreakSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Ceramic / terracotta crack (sharp transient)
    const crackOsc = this.ctx.createOscillator();
    const crackGain = this.ctx.createGain();
    crackOsc.type = 'triangle';
    crackOsc.frequency.setValueAtTime(650, t);
    crackOsc.frequency.exponentialRampToValueAtTime(80, t + 0.15);

    crackGain.gain.setValueAtTime(0.7, t);
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    crackOsc.connect(crackGain);
    crackGain.connect(this.ctx.destination);
    crackOsc.start(t);
    crackOsc.stop(t + 0.2);

    // 2. Shatter debris noise
    this.playSnapNoise(0.4, 0.6);

    // 3. Wet curd splash sound (bubbly low-pass sweep)
    const splashOsc = this.ctx.createOscillator();
    const splashFilter = this.ctx.createBiquadFilter();
    const splashGain = this.ctx.createGain();

    splashOsc.type = 'sine';
    splashOsc.frequency.setValueAtTime(220, t + 0.05);
    splashOsc.frequency.exponentialRampToValueAtTime(70, t + 0.4);

    splashFilter.type = 'bandpass';
    splashFilter.frequency.setValueAtTime(450, t + 0.05);
    splashFilter.Q.value = 3;

    splashGain.gain.setValueAtTime(0.5, t + 0.05);
    splashGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    splashOsc.connect(splashFilter);
    splashFilter.connect(splashGain);
    splashGain.connect(this.ctx.destination);

    splashOsc.start(t + 0.05);
    splashOsc.stop(t + 0.5);

    // 4. Temple bells ringing in triumph!
    setTimeout(() => {
      this.playTempleBell(1760, 0.6);
      setTimeout(() => this.playTempleBell(2093, 0.5), 180);
      setTimeout(() => this.playTempleBell(2637, 0.4), 360);
    }, 100);
  }

  // Play festive step / climb sound
  public playStepSound(pitch = 1.0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280 * pitch, t);
    osc.frequency.exponentialRampToValueAtTime(140 * pitch, t + 0.07);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Start continuous rhythmic Govinda celebration groove (Dholak loop)
  public startFestiveMusic(tempoBpm = 115) {
    if (this.isMuted) return;
    this.stopFestiveMusic();

    let step = 0;
    const intervalMs = (60 / tempoBpm / 2) * 1000; // 8th notes

    // Traditional Dholak Bol pattern: Dha - Tin - Ta - Dha - Dha - Tin - Ta - Ta
    const pattern: Array<'dha' | 'ta' | 'tin' | null> = [
      'dha', null, 'tin', 'ta',
      'dha', 'dha', 'tin', 'ta'
    ];

    const fluteNotes = [440, 493.88, 554.37, 659.25, 739.99]; // A major pentatonic raag notes

    this.dholakTimer = window.setInterval(() => {
      const hit = pattern[step % pattern.length];
      if (hit) {
        this.playDholak(hit, 0.7);
      }
      if (step % 16 === 0) {
        this.playTempleBell(1800, 0.25);
      }
      step++;
    }, intervalMs);

    // Ambient playful bansuri melody every few bars
    let melodyStep = 0;
    this.fluteTimer = window.setInterval(() => {
      const note = fluteNotes[melodyStep % fluteNotes.length];
      this.playBansuriNote(note, 0.7, 0.2);
      melodyStep = (melodyStep + 1 + Math.floor(Math.random() * 2)) % fluteNotes.length;
    }, intervalMs * 4);
  }

  public stopFestiveMusic() {
    if (this.dholakTimer !== null) {
      clearInterval(this.dholakTimer);
      this.dholakTimer = null;
    }
    if (this.fluteTimer !== null) {
      clearInterval(this.fluteTimer);
      this.fluteTimer = null;
    }
  }
}

export const festiveAudio = new FestiveAudioEngine();
