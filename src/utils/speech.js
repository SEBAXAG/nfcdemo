// Web Speech API wrapper with articulation callbacks for 3D Face Mouth Animation

class CyberSpeechSynthesizer {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voice = null;
    this.rate = 1.0;
    this.pitch = 1.1; // Slightly higher/synthetic tone
    this.initialized = false;
    this.isSpeaking = false;
    this.listeners = new Set();
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;

    const setVoice = () => {
      const voices = this.synth.getVoices();
      // Look for Spanish voices
      const spanishVoice = voices.find(v => v.lang.startsWith('es') || v.lang.includes('ES') || v.lang.includes('MX'));
      if (spanishVoice) {
        this.voice = spanishVoice;
      } else if (voices.length > 0) {
        this.voice = voices[0];
      }
      this.initialized = true;
    };

    setVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = setVoice;
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    this.listeners.forEach(cb => cb(event, data));
  }

  speak(text = "¡Hola! ¿En qué puedo servirte?", onArticulate) {
    if (!this.synth) {
      console.warn("Speech Synthesis not supported by this browser.");
      return;
    }

    // Cancel any previous speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.lang = this.voice?.lang || 'es-ES';
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    // Simulation timer fallback in case browser speech engine doesn't fire boundary events
    let simInterval = null;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notify('start', { text });
      if (onArticulate) onArticulate(true);

      // Pulse mouth articulation while speaking
      let toggle = false;
      simInterval = setInterval(() => {
        if (!this.isSpeaking) {
          clearInterval(simInterval);
          return;
        }
        toggle = !toggle;
        this.notify('articulate', { intensity: toggle ? 0.9 : 0.3 });
      }, 140);
    };

    utterance.onboundary = (event) => {
      this.notify('boundary', { charIndex: event.charIndex });
    };

    const cleanup = () => {
      this.isSpeaking = false;
      if (simInterval) clearInterval(simInterval);
      this.notify('end', null);
      if (onArticulate) onArticulate(false);
    };

    utterance.onend = cleanup;
    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      cleanup();
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.notify('end', null);
    }
  }
}

export const cyberSpeech = new CyberSpeechSynthesizer();
