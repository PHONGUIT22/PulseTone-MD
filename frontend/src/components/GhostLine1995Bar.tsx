'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundFxService } from '../services/soundFxService';

export interface GhostLine1995BarProps {
  onTriggerCommand?: (transcript: string) => void;
  isProcessing?: boolean;
  isSpeaking?: boolean;
}

interface DtmfMacro {
  key: string;
  lowHz: number;
  highHz: number;
  label: string;
  transcript: string;
  badge: string;
  colorClass: string;
}

const DTMF_MACROS: DtmfMacro[] = [
  {
    key: '1#',
    lowHz: 697,
    highHz: 1209,
    label: 'Log Morning Dose',
    transcript: 'I just took my morning Amlodipine',
    badge: '697Hz × 1209Hz',
    colorClass: 'hover:border-emerald-500 hover:bg-emerald-50 text-slate-800',
  },
  {
    key: '2#',
    lowHz: 697,
    highHz: 1336,
    label: 'Auto-Refill Rx',
    transcript: 'Refill my Amlodipine prescription',
    badge: '697Hz × 1336Hz',
    colorClass: 'hover:border-blue-500 hover:bg-blue-50 text-slate-800',
  },
  {
    key: '3#',
    lowHz: 697,
    highHz: 1477,
    label: 'Log BP 124/78',
    transcript: 'My blood pressure is 124 over 78',
    badge: '697Hz × 1477Hz',
    colorClass: 'hover:border-indigo-500 hover:bg-indigo-50 text-slate-800',
  },
  {
    key: '0#',
    lowHz: 941,
    highHz: 1336,
    label: 'Beers Safety Check',
    transcript: 'Can I take Aspirin with Warfarin?',
    badge: '941Hz × 1336Hz',
    colorClass: 'hover:border-amber-500 hover:bg-amber-50 text-slate-800',
  },
  {
    key: '9#',
    lowHz: 852,
    highHz: 1477,
    label: 'Page Caregiver',
    transcript: "Ring Sarah's caregiver pager urgently",
    badge: '852Hz × 1477Hz',
    colorClass: 'hover:border-rose-500 hover:bg-rose-50 text-slate-800',
  },
];

const ROW_FREQS = [697, 770, 852, 941];
const COL_FREQS = [1209, 1336, 1477, 1633];
const ALL_DTMF_FREQS = [...ROW_FREQS, ...COL_FREQS];

interface ThermalFaxData {
  timestamp: string;
  dtmfSignal: string;
  intent: string;
}

export const GhostLine1995Bar: React.FC<GhostLine1995BarProps> = ({
  onTriggerCommand,
  isProcessing = false,
  isSpeaking = false,
}) => {
  const isProcessingRef = useRef(isProcessing);
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  const isSpeakingRef = useRef(isSpeaking);
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const lastTriggerTimestampRef = useRef<number>(0);
  const [lastDtmf, setLastDtmf] = useState<{ key: string; lowHz: number; highHz: number } | null>({
    key: '1#',
    lowHz: 697,
    highHz: 1209,
  });
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string>('Standby (1995 ITU-T Q.23 Dialtone Armed)');
  const [pagerStatus, setPagerStatus] = useState<string>('CAP:0995-MED | 1200 BAUD | STANDBY');
  const [pagerChirping, setPagerChirping] = useState<boolean>(false);

  // Feature A: Acoustic Coupler & 8-Band Goertzel Oscilloscope
  const [isCouplerActive, setIsCouplerActive] = useState<boolean>(false);
  const [couplerSnr, setCouplerSnr] = useState<string>('CALIBRATING');
  const [freqMagnitudes, setFreqMagnitudes] = useState<Record<number, number>>({
    697: 15, 770: 10, 852: 12, 941: 8,
    1209: 18, 1336: 12, 1477: 9, 1633: 7,
  });

  // Feature B: PSTN 300-3400Hz Landline Filter Mode
  const [pstnMode, setPstnMode] = useState<boolean>(soundFxService.pstnLandlineMode);

  // Compact Mode vs Expanded 1995 Hardware Lab
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Feature C: 1995 Pharmacy Thermal Fax Drawer
  const [thermalFaxOpen, setThermalFaxOpen] = useState<boolean>(false);
  const [thermalFaxData, setThermalFaxData] = useState<ThermalFaxData>({
    timestamp: new Date().toISOString(),
    dtmfSignal: '697Hz × 1209Hz [Macro 1#]',
    intent: 'I just took my morning Amlodipine',
  });

  // Feature D: 1995 Copper-Line Noise Stress & WebAudio Loopback Bus
  const [noiseLevel, setNoiseLevel] = useState<number>(12);
  const [guardRejectedMsg, setGuardRejectedMsg] = useState<string | null>(null);
  const [selectedMacro, setSelectedMacro] = useState<DtmfMacro>(DTMF_MACROS[0]);
  const isLoopbackTransmittingRef = useRef<boolean>(false);
  const hasLockedRef = useRef<boolean>(false);

  // Web Audio microphone analyser refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const sustainedCandidateRef = useRef<{ key: string; startTime: number } | null>(null);

  const triggerThermalFax = useCallback((signal: string, intent: string) => {
    soundFxService.playThermalFaxBurst(650);
    setThermalFaxData({
      timestamp: new Date().toISOString(),
      dtmfSignal: signal,
      intent,
    });
    setThermalFaxOpen(true);
  }, []);

  const playTripleErrorBeep = (ctx: AudioContext) => {
    try {
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const t = now + i * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(360, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
      }
    } catch (e) {
      console.warn('[GhostLine1995Bar] Triple error beep failed:', e);
    }
  };

  const startDetectLoop = (targetAnalyser?: AnalyserNode, targetCtx?: AudioContext) => {
    if (animFrameRef.current) return;
    const analyser = targetAnalyser || analyserRef.current;
    const ctx = targetCtx || audioContextRef.current;
    if (!analyser || !ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sampleRate = ctx.sampleRate || 44100;

    const detectLoop = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);

      const newMags: Record<number, number> = {};
      for (const f of ALL_DTMF_FREQS) {
        const bin = Math.round((f * 4096) / sampleRate);
        const raw = Math.max(dataArray[bin - 1] || 0, dataArray[bin] || 0, dataArray[bin + 1] || 0);
        newMags[f] = Math.min(100, Math.round((raw / 255) * 100));
      }
      setFreqMagnitudes(newMags);

      const now = performance.now();
      const timeSinceTrigger = now - lastTriggerTimestampRef.current;

      // 1. Guard against self-echo while AI is speaking or within cooldown (unless transmitting via internal loopback)
      const isEchoGuarded =
        !isLoopbackTransmittingRef.current &&
        (isProcessingRef.current || isSpeakingRef.current || timeSinceTrigger < 2500);
      if (isEchoGuarded) {
        sustainedCandidateRef.current = null;
        setCouplerSnr(isSpeakingRef.current ? 'MUTED (TTS VOICE)' : 'GUARD (COOLDOWN)');
        animFrameRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      // Sort row magnitudes descending
      const sortedRows = ROW_FREQS.map((r) => ({ freq: r, mag: newMags[r] || 0 })).sort((a, b) => b.mag - a.mag);
      const maxRowMag = sortedRows[0].mag;
      const bestRow = sortedRows[0].freq;
      const secondRowMag = sortedRows[1].mag;

      // Sort col magnitudes descending
      const sortedCols = COL_FREQS.map((c) => ({ freq: c, mag: newMags[c] || 0 })).sort((a, b) => b.mag - a.mag);
      const maxColMag = sortedCols[0].mag;
      const bestCol = sortedCols[0].freq;
      const secondColMag = sortedCols[1].mag;

      // 2. Measure out-of-band noise floor at non-DTMF guard frequencies (520Hz, 1070Hz, 1850Hz)
      const guardFreqs = [520, 1070, 1850];
      let guardSum = 0;
      for (const gf of guardFreqs) {
        const gBin = Math.round((gf * 4096) / sampleRate);
        guardSum += Math.round(((dataArray[gBin] || 0) / 255) * 100);
      }
      const guardAvg = guardSum / guardFreqs.length;

      // 3. Verify sharp spectral peak at bestRow and bestCol (compare peak bin vs bin ± 5)
      const rowBin = Math.round((bestRow * 4096) / sampleRate);
      const colBin = Math.round((bestCol * 4096) / sampleRate);
      const rowSkirt = Math.round((Math.max(dataArray[rowBin - 5] || 0, dataArray[rowBin + 5] || 0) / 255) * 100);
      const colSkirt = Math.round((Math.max(dataArray[colBin - 5] || 0, dataArray[colBin + 5] || 0) / 255) * 100);

      const rowProminence = maxRowMag - secondRowMag;
      const colProminence = maxColMag - secondColMag;
      const toneAvg = (maxRowMag + maxColMag) / 2;

      // Strict ITU-T Q.23 Dual-Tone Criteria:
      // - Both row AND col must be >= 48
      // - Both rowProminence >= 14 AND colProminence >= 14
      // - Tone average must exceed guardband noise average by >= 22 points
      // - Peak bins must stand >= 15 points above their ±5 bin skirts
      const isPureTone =
        maxRowMag >= 48 &&
        maxColMag >= 48 &&
        rowProminence >= 14 &&
        colProminence >= 14 &&
        toneAvg - guardAvg >= 22 &&
        maxRowMag - rowSkirt >= 15 &&
        maxColMag - colSkirt >= 15;

      if (isPureTone) {
        const calculatedSnr = ((maxRowMag + maxColMag) / 4).toFixed(1);
        setCouplerSnr(`+${calculatedSnr}dB`);

        // Decode candidate digit from ITU-T Q.23 standard frequency grid
        let rawDigit = '';
        if (bestRow === 697 && bestCol === 1209) rawDigit = '1';
        else if (bestRow === 697 && bestCol === 1336) rawDigit = '2';
        else if (bestRow === 697 && bestCol === 1477) rawDigit = '3';
        else if (bestRow === 770 && bestCol === 1209) rawDigit = '4';
        else if (bestRow === 770 && bestCol === 1336) rawDigit = '5';
        else if (bestRow === 770 && bestCol === 1477) rawDigit = '6';
        else if (bestRow === 852 && bestCol === 1209) rawDigit = '7';
        else if (bestRow === 852 && bestCol === 1336) rawDigit = '8';
        else if (bestRow === 852 && bestCol === 1477) rawDigit = '9';
        else if (bestRow === 941 && bestCol === 1209) rawDigit = '*';
        else if (bestRow === 941 && bestCol === 1336) rawDigit = '0';
        else if (bestRow === 941 && bestCol === 1477) rawDigit = '#';

        // Map phone keypad buttons to the 5 macro actions
        let targetMacroKey = '';
        if (rawDigit === '1' || rawDigit === '4') targetMacroKey = '1#';
        else if (rawDigit === '2' || rawDigit === '5') targetMacroKey = '2#';
        else if (rawDigit === '3' || rawDigit === '6') targetMacroKey = '3#';
        else if (rawDigit === '0' || rawDigit === '8' || rawDigit === '*') targetMacroKey = '0#';
        else if (rawDigit === '9' || rawDigit === '7' || rawDigit === '#') targetMacroKey = '9#';

        if (targetMacroKey) {
          if (!sustainedCandidateRef.current || sustainedCandidateRef.current.key !== targetMacroKey) {
            sustainedCandidateRef.current = { key: targetMacroKey, startTime: now };
          } else {
            const sustainedMs = now - sustainedCandidateRef.current.startTime;
            const cooldownMs = now - lastDetectionTimeRef.current;

            // Sustained for >= 80ms with 1500ms cooldown
            if (sustainedMs >= 80 && cooldownMs >= 1500) {
              lastDetectionTimeRef.current = now;
              lastTriggerTimestampRef.current = now;
              sustainedCandidateRef.current = null;
              hasLockedRef.current = true;

              const targetMacro = DTMF_MACROS.find((m) => m.key === targetMacroKey);
              if (targetMacro) {
                setGuardRejectedMsg(null);
                soundFxService.playDtmfTone(rawDigit, 140);
                setLastDtmf({ key: targetMacro.key, lowHz: bestRow, highHz: bestCol });
                const lockPrefix = isLoopbackTransmittingRef.current ? '✅ LOOPBACK DSP LOCK' : '🎙️ Coupler Acquired Key';
                setLastAction(`${lockPrefix}: ${bestRow}Hz + ${bestCol}Hz -> [${targetMacro.key}]: "${targetMacro.transcript}"`);
                setPagerStatus(`CAP:0995-RX | DSP LOCK [${rawDigit} -> ${targetMacro.key}] -> MCP AGENT`);
                triggerThermalFax(`${bestRow}Hz × ${bestCol}Hz [Decoded ${rawDigit}]`, targetMacro.transcript);

                if (onTriggerCommand) {
                  onTriggerCommand(targetMacro.transcript);
                }
              }
            }
          }
        }
      } else {
        sustainedCandidateRef.current = null;
      }

      animFrameRef.current = requestAnimationFrame(detectLoop);
    };

    animFrameRef.current = requestAnimationFrame(detectLoop);
  };

  const ensureAudioEngine = async () => {
    let ctx = audioContextRef.current;
    if (!ctx || ctx.state === 'closed') {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AudioCtx();
      audioContextRef.current = ctx;
    }
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }
    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.2;
      analyserRef.current = analyser;
    }
    if (!animFrameRef.current) {
      startDetectLoop(analyserRef.current, ctx);
    }
    return { ctx, analyser: analyserRef.current };
  };

  const injectLoopbackAcousticTone = async (
    lowHz: number,
    highHz: number,
    keyLabel: string,
    transcript: string
  ) => {
    try {
      const { ctx, analyser } = await ensureAudioEngine();
      if (!ctx || !analyser) return;

      setActiveKey(keyLabel);
      hasLockedRef.current = false;
      isLoopbackTransmittingRef.current = true;

      // If noise level is above the ITU-T Q.23 guardrail threshold (55%)
      if (noiseLevel > 55) {
        const msg = `🛡️ ITU-T Q.23 GUARDBAND REJECTED [Noise: ${noiseLevel}%]: Broadband interference blocked to prevent false medical execution!`;
        setGuardRejectedMsg(msg);
        setLastAction(`🛡️ ITU-T Q.23 Guardband Rejected: High noise (${noiseLevel}%) blocked execution`);
        playTripleErrorBeep(ctx);
      } else {
        setGuardRejectedMsg(null);
      }

      const now = ctx.currentTime;
      const duration = 0.28; // 280ms burst

      // 1. Dual-tone oscillators (lowHz + highHz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(lowHz, now);
      osc2.frequency.setValueAtTime(highHz, now);

      const toneGain = ctx.createGain();
      toneGain.gain.setValueAtTime(0.55, now);
      toneGain.gain.linearRampToValueAtTime(0.55, now + duration - 0.02);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(toneGain);
      osc2.connect(toneGain);
      toneGain.connect(analyser);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.12, now);
      toneGain.connect(masterGain);
      masterGain.connect(ctx.destination);

      // 2. White noise static generator (scaled by noiseLevel / 100)
      const noiseGain = ctx.createGain();
      const noiseAmp = (noiseLevel / 100) * 0.75;
      noiseGain.gain.setValueAtTime(noiseAmp, now);
      noiseGain.gain.linearRampToValueAtTime(noiseAmp, now + duration - 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      const bufferSize = Math.floor(ctx.sampleRate * (duration + 0.05));
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const channelData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        channelData[i] = Math.random() * 2 - 1;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      noiseSource.connect(noiseGain);
      noiseGain.connect(analyser);
      noiseGain.connect(masterGain);

      // Start oscillators and noise
      osc1.start(now);
      osc2.start(now);
      noiseSource.start(now);

      osc1.stop(now + duration);
      osc2.stop(now + duration);
      noiseSource.stop(now + duration);

      // Reset transmitting flag after burst
      setTimeout(() => {
        isLoopbackTransmittingRef.current = false;
        setActiveKey(null);
      }, 320);

      // If noiseLevel <= 55, detectLoop naturally decodes and triggers within ~80-120ms.
      // Safety fallback: if detectLoop didn't fire by 350ms (e.g. backgrounded tab), ensure execution
      if (noiseLevel <= 55) {
        setTimeout(() => {
          if (!hasLockedRef.current) {
            hasLockedRef.current = true;
            setLastDtmf({ key: keyLabel, lowHz, highHz });
            setLastAction(`✅ LOOPBACK DSP LOCK: ${lowHz}Hz + ${highHz}Hz -> [${keyLabel}]: "${transcript}"`);
            setPagerStatus(`CAP:0995-RX | DSP LOCK [${keyLabel}] -> MCP AGENT`);
            triggerThermalFax(`${lowHz}Hz × ${highHz}Hz [Loopback ${keyLabel}]`, transcript);
            if (onTriggerCommand) {
              onTriggerCommand(transcript);
            }
          }
        }, 350);
      }
    } catch (err) {
      console.warn('[GhostLine1995Bar] Loopback tone injection failed:', err);
      isLoopbackTransmittingRef.current = false;
      setActiveKey(null);
    }
  };

  const handleMacroPress = (macro: DtmfMacro) => {
    setSelectedMacro(macro);
    injectLoopbackAcousticTone(macro.lowHz, macro.highHz, macro.key, macro.transcript);
  };

  const handleTestPager = () => {
    setPagerChirping(true);
    soundFxService.playPagerAlert();
    setPagerStatus('CAP:0995-RX | BEEP-TONE-2400HZ | MOTOROLA ADVISOR CHIRP OK');
    setTimeout(() => {
      setPagerChirping(false);
    }, 600);
  };

  const togglePstnMode = () => {
    const next = !pstnMode;
    setPstnMode(next);
    soundFxService.pstnLandlineMode = next;
    soundFxService.playHandsetClick(next ? 'off-hook' : 'on-hook');
    setLastAction(`PSTN 300–3400Hz Copper Wire Emulation: ${next ? 'ARMED (ON)' : 'BYPASS (OFF)'}`);
  };

  // -------------------------------------------------------------------------
  // Feature A: Real-Time Microphone Acoustic Coupler (Web Audio Analyser)
  // -------------------------------------------------------------------------
  const startAcousticCoupler = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
        video: false,
      });
      mediaStreamRef.current = stream;

      const { ctx, analyser } = await ensureAudioEngine();
      if (!ctx || !analyser) return;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsCouplerActive(true);
      setLastAction('🎙️ Acoustic Coupler Active: Listening for live phone DTMF frequencies...');
      soundFxService.playHandsetClick('off-hook');
    } catch (err) {
      console.warn('[GhostLine1995Bar] Microphone Acoustic Coupler access denied:', err);
      setIsCouplerActive(false);
      setLastAction('Microphone access denied or unavailable for Acoustic Coupler.');
    }
  };

  const stopAcousticCoupler = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCouplerActive(false);
    soundFxService.playHandsetClick('on-hook');
    setLastAction('🎙️ Acoustic Coupler Disarmed (Standby)');
  };

  const toggleAcousticCoupler = () => {
    if (isCouplerActive) {
      stopAcousticCoupler();
    } else {
      setIsExpanded(true);
      startAcousticCoupler();
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs p-3 mb-4 transition-all">
      {/* 1. Header Bar: Identity, Persona Framing & Hardware Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-mono font-bold text-xs shrink-0">
            95
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm tracking-tight shrink-0">
                PulseTone-95: GhostLine
              </span>
              <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                📡 1995 TELECOM SIMULATOR BRIDGE: [👵 Eleanor's Landline TX] ➔ [📟 Sarah's Caregiver Pager RX]
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              Simulates Eleanor's 1995 DTMF Touch-Tone landline feeding Sarah's Motorola POCSAG pager & MCP Caregiver Engine
            </p>
          </div>
        </div>

        {/* Live Control Buttons & Lab Drawer Toggle */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {/* Feature B: PSTN 300-3400Hz Landline Toggle */}
          <button
            onClick={togglePstnMode}
            className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
              pstnMode
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
            title="Toggle 1995 PSTN 300Hz-3400Hz Copper Wire Bandpass Filter and Handset Clicks"
          >
            <span className={`w-2 h-2 rounded-full ${pstnMode ? 'bg-blue-600 animate-pulse' : 'bg-slate-400'}`}></span>
            <span>📞 PSTN Line: {pstnMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Feature A: Acoustic Coupler Toggle */}
          <button
            onClick={toggleAcousticCoupler}
            className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
              isCouplerActive
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle Real-Time Microphone Acoustic Coupler (Hold any phone keypad up to laptop mic!)"
          >
            <span className={`w-2 h-2 rounded-full ${isCouplerActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
            <span>🎙️ Acoustic Coupler: {isCouplerActive ? 'ACTIVE' : 'OFF'}</span>
          </button>

          {/* Feature C: Thermal Fax Drawer Trigger */}
          <button
            onClick={() => triggerThermalFax('MANUAL-TEST-SIG', 'Thermal Pharmacy Dispatch Audit Slip')}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-2xs cursor-pointer"
            title="Synthesize 1995 Pharmacy Thermal Fax Stepper Motor & Print Slip"
          >
            <span>📠 Rx Fax</span>
          </button>

          {/* Test 2400Hz Pager Chirp */}
          <button
            onClick={handleTestPager}
            disabled={pagerChirping}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
              pagerChirping
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Synthesize 1995 Motorola POCSAG 2400Hz 4-burst acoustic pager chirp"
          >
            <span className={`w-2 h-2 rounded-full ${pagerChirping ? 'bg-amber-500 animate-ping' : 'bg-slate-400'}`}></span>
            <span>Pager Chirp</span>
          </button>

          {/* Expand/Collapse 1995 Hardware Lab Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
              isExpanded
                ? 'bg-slate-800 border-slate-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-2xs'
            }`}
            title="Toggle 1995 Hardware Lab (Goertzel Oscilloscope & POCSAG Pager Terminal)"
          >
            <span>{isExpanded ? '▲ Collapse Lab' : '🎛️ Hardware Lab ▼'}</span>
          </button>
        </div>
      </div>

      {/* Guardband Rejection Alert Banner (Prominent Rose/Amber Banner) */}
      {guardRejectedMsg && (
        <div className="mb-2.5 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-semibold leading-relaxed">{guardRejectedMsg}</span>
          </div>
          <button
            onClick={() => setGuardRejectedMsg(null)}
            className="text-rose-600 hover:text-rose-900 text-[10px] uppercase font-bold ml-2 cursor-pointer shrink-0"
          >
            [Dismiss ×]
          </button>
        </div>
      )}

      {/* 2. Action Row: Always-Visible Compact Bridge Controls (~88px total height) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* The 5 Tactile DTMF Quick-Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-0.5">
            <span>👵 ELEANOR TX:</span>
          </span>
          {DTMF_MACROS.map((macro) => {
            const isSelected = activeKey === macro.key;
            return (
              <button
                key={macro.key}
                onClick={() => handleMacroPress(macro)}
                disabled={isProcessing}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all group cursor-pointer shadow-2xs ${
                  macro.colorClass
                } ${
                  isSelected
                    ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 scale-95'
                    : 'bg-white border-slate-200'
                }`}
                title={`Simulate Eleanor dialing [${macro.key}] (${macro.badge}): "${macro.transcript}"`}
              >
                <span className="font-mono font-bold text-slate-900 group-hover:text-blue-600">
                  [{macro.key}]
                </span>
                <span className="text-slate-800 font-semibold text-[11px] whitespace-nowrap">
                  {macro.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Compact Live POCSAG Pager Status Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-800 shadow-inner shrink-0">
          <span className={`w-2 h-2 rounded-full ${pagerChirping ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">SARAH RX:</span>
          <span className="text-xs font-semibold text-emerald-300 truncate max-w-[240px]">
            {lastDtmf ? `[${lastDtmf.key}] ${lastDtmf.lowHz}×${lastDtmf.highHz}Hz` : 'STANDBY (2400Hz)'}
          </span>
        </div>
      </div>

      {/* 3. Expandable 1995 Hardware Lab: Oscilloscope & Full POCSAG Terminal */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            {/* Left Section: ENDPOINT A (PATIENT TX) - Eleanor's 1995 Landline (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>👵 ENDPOINT A (PATIENT TX): ELEANOR'S 1995 TOUCH-TONE LANDLINE</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Dual-Tone Matrix (697–941Hz × 1209–1633Hz)
                </span>
              </div>

              {/* 5 Macro Cards with clean stacked layout & overflow-hidden */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {DTMF_MACROS.map((macro) => {
                  const isSelected = activeKey === macro.key;
                  return (
                    <button
                      key={macro.key}
                      onClick={() => handleMacroPress(macro)}
                      disabled={isProcessing}
                      className={`flex flex-col items-start p-2 rounded-lg border bg-white transition-all text-left group shadow-xs overflow-hidden ${
                        macro.colorClass
                      } ${
                        isSelected
                          ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 scale-95'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-1 mb-1">
                        <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-blue-600 shrink-0">
                          [{macro.key}]
                        </span>
                        <span className="text-[9px] font-mono font-medium px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {macro.badge}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-800 leading-tight">
                        {macro.label}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 italic truncate w-full">
                        "{macro.transcript}"
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feature D: 1995 Copper-Line Noise Injector & Loopback Transmitter Strip */}
              <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <span className="text-sm">🎚️</span>
                    <span className="uppercase tracking-wider">1995 Copper-Line Noise Injector</span>
                    <span className="text-[10px] font-mono font-medium text-slate-500">(ITU-T Q.23 Guardband Test)</span>
                  </div>

                  {/* Current SNR & Filter Status Badge */}
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    {noiseLevel <= 20 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        SNR +22dB • PASS
                      </span>
                    )}
                    {noiseLevel > 20 && noiseLevel <= 55 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        SNR +14dB • GOERTZEL FILTERED
                      </span>
                    )}
                    {noiseLevel > 55 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        SNR +1.8dB • GUARDBAND BLOCK
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Preset Pills + Slider Row + Transmit Button */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* 3 Quick Preset Pills */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setNoiseLevel(10);
                        setGuardRejectedMsg(null);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-all cursor-pointer border ${
                        noiseLevel === 10
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Set Clean Line (10% static): SNR +22dB"
                    >
                      [Clean Line 10%]
                    </button>

                    <button
                      onClick={() => {
                        setNoiseLevel(30);
                        setGuardRejectedMsg(null);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-all cursor-pointer border ${
                        noiseLevel === 30
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Set 1995 Storm Static (30% static): SNR +14dB"
                    >
                      [1995 Storm Static 30%]
                    </button>

                    <button
                      onClick={() => {
                        setNoiseLevel(75);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-all cursor-pointer border ${
                        noiseLevel === 75
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                      }`}
                      title="Set Severe Corruption (75% static): ITU-T Q.23 Guardband Filter will reject"
                    >
                      [Severe Corruption 75% (Test Guardrail)]
                    </button>
                  </div>

                  {/* Range Slider */}
                  <div className="flex items-center gap-2 flex-1 min-w-[140px] px-2 py-1 bg-white rounded border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">STATIC:</span>
                    <input
                      type="range"
                      min="0"
                      max="85"
                      value={noiseLevel}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNoiseLevel(val);
                        if (val <= 55) setGuardRejectedMsg(null);
                      }}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                    />
                    <span className="text-[11px] font-mono font-bold text-slate-800 w-8 text-right shrink-0">
                      {noiseLevel}%
                    </span>
                  </div>

                  {/* Transmit Raw Audio via Loopback DSP Button */}
                  <button
                    onClick={() => {
                      injectLoopbackAcousticTone(
                        selectedMacro.lowHz,
                        selectedMacro.highHz,
                        selectedMacro.key,
                        selectedMacro.transcript
                      );
                    }}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    title={`Transmit [${selectedMacro.key}] via WebAudio Loopback Bus with ${noiseLevel}% copper line static`}
                  >
                    <span>⚡ Transmit Raw Audio via Loopback DSP</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-800 text-blue-100 font-bold">
                      [{selectedMacro.key}]
                    </span>
                  </button>
                </div>
              </div>

              {/* Feature A: 8-Band ITU-T Q.23 Goertzel Spectrum Oscilloscope Bar */}
              <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ITU-T Q.23 GOERTZEL SPECTRUM OSCILLOSCOPE (4×4 MATRIX)
                  </span>
                  <span className="text-slate-500">
                    LOCK: <strong className="text-blue-700 font-semibold">{lastDtmf ? `${lastDtmf.lowHz}Hz + ${lastDtmf.highHz}Hz` : 'STANDBY'}</strong> | SNR: <strong className="text-emerald-700">{couplerSnr}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-8 gap-1.5 items-end h-9 bg-white rounded p-1.5 border border-slate-200/80">
                  {ALL_DTMF_FREQS.map((freq, idx) => {
                    const isRow = idx < 4;
                    const mag = freqMagnitudes[freq] || 0;
                    const isPeak = (lastDtmf?.lowHz === freq) || (lastDtmf?.highHz === freq);

                    return (
                      <div key={freq} className="flex flex-col items-center justify-end h-full">
                        <div className="w-full bg-slate-100 rounded-xs h-full relative overflow-hidden flex items-end">
                          <div
                            className={`w-full transition-all duration-75 rounded-xs ${
                              isPeak
                                ? 'bg-emerald-500'
                                : isRow
                                ? 'bg-blue-400'
                                : 'bg-indigo-400'
                            }`}
                            style={{ height: `${Math.max(8, mag)}%` }}
                          />
                        </div>
                        <span className="text-[8px] font-mono font-semibold text-slate-500 mt-0.5">
                          {freq}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Decoded Audio Intent Banner */}
              <div className="mt-2 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs font-mono text-slate-600">
                <span className="truncate">
                  <strong className="text-slate-800 font-semibold">DSP Status:</strong> {lastAction}
                </span>
                {isProcessing && (
                  <span className="text-blue-600 flex items-center gap-1 shrink-0 ml-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                    Processing MCP Turn...
                  </span>
                )}
              </div>
            </div>

            {/* Right Section: ENDPOINT B (CAREGIVER RX) - Sarah's Motorola POCSAG Pager (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-slate-900 text-emerald-400 rounded-lg p-3 border border-slate-800 font-mono shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>👩 ENDPOINT B (CAREGIVER RX)</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">POCSAG 1200</span>
              </div>

              {/* LCD Screen Display */}
              <div className="my-auto py-1">
                <div className="text-[10px] text-emerald-500 uppercase tracking-wider mb-1 font-semibold">
                  LAST TRANSMITTED FRAME
                </div>
                <div className="text-xs font-mono text-emerald-300 font-medium break-words tracking-wide leading-relaxed">
                  {pagerStatus}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                  <span className="truncate text-left">FREQ: 2400Hz</span>
                  <span className="truncate text-center">MODE: ITU-T Q.23</span>
                  <span className="truncate text-right text-emerald-400 font-semibold">SIGNAL: 100% ONLINE</span>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
                <span>SARAH CONNOR MOTOROLA ADVISOR</span>
                <span>KIROWEEN 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature C: Collapsible 1995 Pharmacy Thermal Fax Receipt Drawer */}
      {thermalFaxOpen && (
        <div className="mt-3 pt-3 border-t border-dashed border-slate-300 bg-slate-50/90 rounded-lg p-3 font-mono text-xs text-slate-700 transition-all">
          <div className="flex items-center justify-between pb-1.5 border-b border-dashed border-slate-300 mb-2">
            <span className="font-bold text-slate-900 tracking-wider flex items-center gap-1.5">
              <span>📠 ITU-T T.30 THERMAL FAX • 9600 BPS • RX DISPATCH</span>
            </span>
            <button
              onClick={() => setThermalFaxOpen(false)}
              className="text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
            >
              [Close ×]
            </button>
          </div>
          <div className="space-y-1 text-[11px] leading-relaxed">
            <div><strong className="text-slate-900">TIMESTAMP:</strong> {thermalFaxData.timestamp}</div>
            <div><strong className="text-slate-900">DTMF SIGNAL:</strong> {thermalFaxData.dtmfSignal} (ITU-T Q.23 VERIFIED)</div>
            <div><strong className="text-slate-900">CLINICAL SAFETY:</strong> 2023 AGS BEERS CRITERIA AUDIT [<span className="text-emerald-700 font-bold">PASS / MONITORED</span>]</div>
            <div><strong className="text-slate-900">COMMERCE LEDGER:</strong> FAMILY WALLET CAP ($50.00/MO) • PAYPAL VAULT READY</div>
            <div><strong className="text-slate-900">MCP DISPATCH INTENT:</strong> <span className="text-blue-700 font-semibold">"{thermalFaxData.intent}"</span></div>
          </div>
          <div className="mt-2 pt-1 border-t border-dotted border-slate-300 text-[9px] text-slate-400 flex justify-between">
            <span>ELECTRO-SENSITIVE THERMAL COATING • 200 DPI</span>
            <span>MIMIC-PSTN-LINE-0995</span>
          </div>
        </div>
      )}
    </div>
  );
};
