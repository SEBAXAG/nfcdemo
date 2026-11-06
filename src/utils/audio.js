// Web Audio API Synthesizer - Sci-Fi & NFC Acoustic Feedback

class CyberAudioController {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // NFC Contact Detection Frequency Sweep
  playNfcTap() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1480, now + 0.12);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {
      console.warn("Audio playback not allowed yet:", e);
    }
  }

  // NFC Validation and Handshake Confirmed
  playNfcSuccess() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [659.25, 880.0, 1318.51, 1760.0]; // E5, A5, E6, A6

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.25);
      });
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Hologram Particle Assembly Sound
  playHologramActivate() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Sub-bass sweep
      const oscBass = this.ctx.createOscillator();
      const gainBass = this.ctx.createGain();
      oscBass.type = 'sawtooth';
      oscBass.frequency.setValueAtTime(80, now);
      oscBass.frequency.exponentialRampToValueAtTime(240, now + 0.8);

      // Low pass filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + 0.8);

      gainBass.gain.setValueAtTime(0.01, now);
      gainBass.gain.linearRampToValueAtTime(0.25, now + 0.4);
      gainBass.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      oscBass.connect(filter);
      filter.connect(gainBass);
      gainBass.connect(this.ctx.destination);

      oscBass.start(now);
      oscBass.stop(now + 1.25);

      // Shimmer chimes
      for (let i = 0; i < 6; i++) {
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(1200 + Math.random() * 1400, now + 0.2 + i * 0.1);

        chimeGain.gain.setValueAtTime(0.01, now + 0.2 + i * 0.1);
        chimeGain.gain.linearRampToValueAtTime(0.08, now + 0.25 + i * 0.1);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + i * 0.1);

        chime.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);

        chime.start(now + 0.2 + i * 0.1);
        chime.stop(now + 0.6 + i * 0.1);
      }
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Particle Disperse / Eject sound
  playDisperse() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }
}

export const cyberAudio = new CyberAudioController();
