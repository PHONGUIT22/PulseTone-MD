/**
 * PulseTone-95 Ambient Procedural Audio Engine
 * Zero-dependency browser Web Audio API sound effects.
 * 0ms latency, zero external MP3 assets, 100% offline resilient.
 */

class SoundFxService {
  public pstnLandlineMode: boolean = true;
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * 1. Iconic Alexa 2-Tone Earcon Chime ("ba-ding!" ~ 440Hz -> 587Hz sine wave)
   */
  playAlexaEarcon() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, now); // Tone 1: A4 (440Hz)
      osc1.frequency.setValueAtTime(440, now + 0.08);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(587.33, now + 0.09); // Tone 2: D5 (587.33Hz)

      osc1.connect(gain);
      osc2.connect(gain);

      osc1.start(now);
      osc1.stop(now + 0.09);

      osc2.start(now + 0.09);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn('[SoundFx] Earcon playback suppressed:', e);
    }
  }

  /**
   * 2. Tactile mechanical pill bottle pop sound
   */
  playPillClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn('[SoundFx] Pill click suppressed:', e);
    }
  }

  /**
   * 3. Warm major-seventh chord on dose taken (Fmaj7: F4, A4, C5, E5)
   */
  playCelebrationChord() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [349.23, 440.0, 523.25, 659.25]; // F4, A4, C5, E5
      const duration = 0.9;

      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.03);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05 + index * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.03);
        osc.stop(now + duration);
      });
    } catch (e) {
      console.warn('[SoundFx] Celebration chord suppressed:', e);
    }
  }

  /**
   * 4. Pulsing gentle warning tone when refusal or hesitation is detected
   */
  playWarningTone() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const pulses = [0, 0.18];

      pulses.forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(466.16, now + offset); // Bb4
        osc.frequency.exponentialRampToValueAtTime(415.3, now + offset + 0.12);

        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.14);
      });
    } catch (e) {
      console.warn('[SoundFx] Warning tone suppressed:', e);
    }
  }

  /**
   * 5. Urgent telephone ring tone when Sarah Circuit-Breaker triggers
   * Dual frequency ringing pattern (440Hz + 480Hz telephone standard)
   */
  playDaughterPing() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const ringDur = 0.35;
      const pauses = [0, 0.45];

      pauses.forEach((offset) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, now + offset); // North American standard 440Hz
        osc2.frequency.setValueAtTime(480, now + offset); // + 480Hz

        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.setValueAtTime(0.2, now + offset + ringDur - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + ringDur);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now + offset);
        osc1.stop(now + offset + ringDur);

        osc2.start(now + offset);
        osc2.stop(now + offset + ringDur);
      });
    } catch (e) {
      console.warn('[SoundFx] Daughter ping suppressed:', e);
    }
  }

  /**
   * 6. Iconic Ring Doorbell 2-Tone Chime ("Ding-Dong" bell ~ 880Hz / 659Hz with metallic bell decay)
   */
  playRingChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Note 1: Ding (880Hz - A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.28, now + 0.015);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.65);

      // Note 2: Dong (659.25Hz - E5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const note2Start = now + 0.38;
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, note2Start);
      gain2.gain.setValueAtTime(0, note2Start);
      gain2.gain.linearRampToValueAtTime(0.25, note2Start + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, note2Start + 0.95);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(note2Start);
      osc2.stop(note2Start + 0.95);
    } catch (e) {
      console.warn('[SoundFx] Ring chime suppressed:', e);
    }
  }

  /**
   * 1995 ITU-T Q.23 Dual-Tone Multi-Frequency (DTMF) Synthesizer
   * Mathematically sums low-group and high-group sine wave oscillators via Web Audio API.
   */
  playDtmfTone(key: string, durationMs = 160): { key: string; lowHz: number; highHz: number } {
    const DTMF_MAP: Record<string, [number, number]> = {
      '1': [697, 1209],
      '2': [697, 1336],
      '3': [697, 1477],
      '4': [770, 1209],
      '5': [770, 1336],
      '6': [770, 1477],
      '7': [852, 1209],
      '8': [852, 1336],
      '9': [852, 1477],
      '*': [941, 1209],
      '0': [941, 1336],
      '#': [941, 1477],
    };

    const freqs = DTMF_MAP[key] || [697, 1209];
    const [lowHz, highHz] = freqs;

    const ctx = this.getContext();
    if (!ctx) return { key, lowHz, highHz };

    try {
      const now = ctx.currentTime;
      const durationSec = durationMs / 1000;

      const oscLow = ctx.createOscillator();
      const oscHigh = ctx.createOscillator();
      const gain = ctx.createGain();

      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.008);
      gain.gain.setValueAtTime(0.2, now + durationSec - 0.008);
      gain.gain.linearRampToValueAtTime(0.001, now + durationSec);

      oscLow.type = 'sine';
      oscLow.frequency.setValueAtTime(lowHz, now);

      oscHigh.type = 'sine';
      oscHigh.frequency.setValueAtTime(highHz, now);

      oscLow.connect(gain);
      oscHigh.connect(gain);

      oscLow.start(now);
      oscLow.stop(now + durationSec);
      oscHigh.start(now);
      oscHigh.stop(now + durationSec);
    } catch (e) {
      console.warn('[SoundFx] DTMF synthesis suppressed:', e);
    }

    return { key, lowHz, highHz };
  }

  /**
   * 1995 Motorola POCSAG Alphanumeric Pager 2400 Hz Quad-Chirp Alert
   * Generates authentic 4-burst acoustic beep sequence.
   */
  playPagerAlert() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chirpDuration = 0.045; // 45ms burst
      const gapDuration = 0.035;   // 35ms silence

      for (let i = 0; i < 4; i++) {
        const start = now + i * (chirpDuration + gapDuration);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.004);
        gain.gain.setValueAtTime(0.25, start + chirpDuration - 0.004);
        gain.gain.linearRampToValueAtTime(0.001, start + chirpDuration);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, start);

        osc.connect(gain);
        osc.start(start);
        osc.stop(start + chirpDuration);
      }
    } catch (e) {
      console.warn('[SoundFx] Pager alert chirp suppressed:', e);
    }
  }

  /**
   * 1995 Bell System Handset Mechanical Plunger Relay Click
   * 15ms filtered noise burst + 180Hz / 120Hz resonant mechanical thud.
   */
  playHandsetClick(state: 'off-hook' | 'on-hook' = 'off-hook') {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freq = state === 'off-hook' ? 180 : 120;

      // 1. Mechanical acoustic resonant thud
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.05);

      oscGain.connect(ctx.destination);
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.28, now + 0.003);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(oscGain);
      osc.start(now);
      osc.stop(now + 0.055);

      // 2. 15ms relay spring click noise burst
      const bufferSize = Math.floor(ctx.sampleRate * 0.015);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.connect(ctx.destination);
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      noise.connect(filter);
      filter.connect(noiseGain);
      noise.start(now);
    } catch (e) {
      console.warn('[SoundFx] Handset click suppressed:', e);
    }
  }

  /**
   * 1995 Pharmacy Thermal Fax Stepper Motor & Transmission Burst
   * Rapid 28Hz pulsed white-noise bursts filtered through 1800Hz bandpass + 1400Hz confirmation beep.
   */
  playThermalFaxBurst(durationMs = 650) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const totalSec = durationMs / 1000;
      const stepperSec = Math.max(0.2, totalSec - 0.14);

      // 1. Paper-feed stepper motor: pulsed noise at ~28Hz
      const stepCount = Math.floor(stepperSec * 28);
      for (let i = 0; i < stepCount; i++) {
        const t = now + (i / 28);
        const bufferSize = Math.floor(ctx.sampleRate * 0.016);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = (Math.random() * 2 - 1) * Math.sin((j / bufferSize) * Math.PI);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, t);
        filter.Q.setValueAtTime(4.0, t);

        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.016);

        noise.connect(filter);
        filter.connect(gain);
        noise.start(t);
      }

      // 2. 1400Hz confirmation beep at end of transmission
      const beepStart = now + stepperSec;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, beepStart);

      oscGain.connect(ctx.destination);
      oscGain.gain.setValueAtTime(0, beepStart);
      oscGain.gain.linearRampToValueAtTime(0.2, beepStart + 0.005);
      oscGain.gain.exponentialRampToValueAtTime(0.001, beepStart + 0.12);

      osc.connect(oscGain);
      osc.start(beepStart);
      osc.stop(beepStart + 0.12);
    } catch (e) {
      console.warn('[SoundFx] Thermal fax burst suppressed:', e);
    }
  }

  /**
   * 1995 PSTN Landline 300Hz-3400Hz Copper Wire Bandpass Filter Routing
   */
  applyPstnBandpassFilter(audioElement?: HTMLAudioElement) {
    const ctx = this.getContext();
    if (!ctx) return;

    if (audioElement && (audioElement as any)._pstnRouted) return;

    try {
      if (audioElement) {
        const source = ctx.createMediaElementSource(audioElement);
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(300, ctx.currentTime);

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(3400, ctx.currentTime);

        source.connect(hp);
        hp.connect(lp);
        lp.connect(ctx.destination);
        (audioElement as any)._pstnRouted = true;
      }
    } catch (e) {
      console.warn('[SoundFx] PSTN bandpass filter routing:', e);
    }
  }
}

export const soundFxService = new SoundFxService();
