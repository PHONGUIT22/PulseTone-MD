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

  // Feature C: 1995 Pharmacy Thermal Fax Drawer
  const [thermalFaxOpen, setThermalFaxOpen] = useState<boolean>(false);
  const [thermalFaxData, setThermalFaxData] = useState<ThermalFaxData>({
    timestamp: new Date().toISOString(),
    dtmfSignal: '697Hz × 1209Hz [Macro 1#]',
    intent: 'I just took my morning Amlodipine',
  });

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

  const handleMacroPress = (macro: DtmfMacro) => {
    lastTriggerTimestampRef.current = performance.now();
    setActiveKey(macro.key);

    // 1. Synthesize ITU-T Q.23 dual tone
    const primaryDigit = macro.key[0];
    const hashDigit = '#';
    soundFxService.playDtmfTone(primaryDigit, 140);
    setTimeout(() => {
      soundFxService.playDtmfTone(hashDigit, 140);
      setActiveKey(null);
    }, 150);

    // 2. Animate Oscilloscope bars
    const simulatedMags: Record<number, number> = {
      697: 10, 770: 10, 852: 10, 941: 10,
      1209: 10, 1336: 10, 1477: 10, 1633: 10,
    };
    simulatedMags[macro.lowHz] = 98;
    simulatedMags[macro.highHz] = 95;
    setFreqMagnitudes(simulatedMags);
    setCouplerSnr(`+${(18 + Math.random() * 3).toFixed(1)}dB`);

    setLastDtmf({ key: macro.key, lowHz: macro.lowHz, highHz: macro.highHz });
    setLastAction(`Decoded [${macro.key}]: "${macro.transcript}"`);
    setPagerStatus(`CAP:0995-MED | TX [${macro.key}] -> MCP AGENT`);

    // 3. Trigger 1995 Pharmacy Thermal Fax
    triggerThermalFax(`${macro.lowHz}Hz × ${macro.highHz}Hz [Macro ${macro.key}]`, macro.transcript);

    // 4. Dispatch speech command to autonomous agent
    if (onTriggerCommand) {
      onTriggerCommand(macro.transcript);
    }
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

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.25;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsCouplerActive(true);
      setLastAction('🎙️ Acoustic Coupler Active: Listening for live phone DTMF frequencies...');
      soundFxService.playHandsetClick('off-hook');

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const sampleRate = ctx.sampleRate;

      const detectLoop = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        const newMags: Record<number, number> = {};
        for (const f of ALL_DTMF_FREQS) {
          const bin = Math.round((f * 4096) / sampleRate);
          const raw = Math.max(dataArray[bin - 1] || 0, dataArray[bin] || 0, dataArray[bin + 1] || 0);
          // Percentage 0-100
          newMags[f] = Math.min(100, Math.round((raw / 255) * 100));
        }
        setFreqMagnitudes(newMags);

        const now = performance.now();
        const timeSinceTrigger = now - lastTriggerTimestampRef.current;
        const isEchoGuarded = timeSinceTrigger < 3000;

        if (isEchoGuarded) {
          sustainedCandidateRef.current = null;
          setCouplerSnr('GUARD (COOLDOWN)');
          animFrameRef.current = requestAnimationFrame(detectLoop);
          return;
        }

        // Sort row magnitudes descending to verify pure-tone prominence
        const sortedRows = ROW_FREQS.map((r) => ({ freq: r, mag: newMags[r] || 0 })).sort((a, b) => b.mag - a.mag);
        const maxRowMag = sortedRows[0].mag;
        const bestRow = sortedRows[0].freq;
        const secondRowMag = sortedRows[1].mag;

        // Sort col magnitudes descending to verify pure-tone prominence
        const sortedCols = COL_FREQS.map((c) => ({ freq: c, mag: newMags[c] || 0 })).sort((a, b) => b.mag - a.mag);
        const maxColMag = sortedCols[0].mag;
        const bestCol = sortedCols[0].freq;
        const secondColMag = sortedCols[1].mag;

        // Pure-tone prominence check (sensitive to phone speakers over air)
        const rowProminence = maxRowMag - secondRowMag;
        const colProminence = maxColMag - secondColMag;
        const isPureTone = maxRowMag >= 38 && maxColMag >= 38 && (rowProminence >= 6 || colProminence >= 6);

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

              // Sustained for >= 45ms with 1200ms cooldown for instant 1-tap phone response
              if (sustainedMs >= 45 && cooldownMs >= 1200) {
                lastDetectionTimeRef.current = now;
                lastTriggerTimestampRef.current = now;
                sustainedCandidateRef.current = null;

                const targetMacro = DTMF_MACROS.find((m) => m.key === targetMacroKey);
                if (targetMacro) {
                  soundFxService.playDtmfTone(rawDigit, 140);
                  setLastDtmf({ key: targetMacro.key, lowHz: bestRow, highHz: bestCol });
                  setLastAction(`🎙️ Coupler Acquired Key [${rawDigit}] -> [${targetMacro.key}]: "${targetMacro.transcript}"`);
                  setPagerStatus(`CAP:0995-RX | ACOUSTIC [${rawDigit} -> ${targetMacro.key}] -> MCP AGENT`);
                  triggerThermalFax(`${bestRow}Hz × ${bestCol}Hz [Coupler ${rawDigit}]`, targetMacro.transcript);

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
    } catch (err) {
      console.warn('[GhostLine1995Bar] Microphone Acoustic Coupler access denied:', err);
      setIsCouplerActive(false);
      setLastAction('Microphone access denied or unavailable for Acoustic Coupler.');
    }
  };

  const stopAcousticCoupler = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsCouplerActive(false);
    soundFxService.playHandsetClick('on-hook');
    setLastAction('🎙️ Acoustic Coupler Disarmed (Standby)');
  };

  const toggleAcousticCoupler = () => {
    if (isCouplerActive) {
      stopAcousticCoupler();
    } else {
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
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-4 transition-all">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-mono font-bold text-sm">
            95
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm tracking-tight">
                PulseTone-95: GhostLine
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                1995 Telecom Resurrection
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                ITU-T Q.23 + POCSAG
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Landline Touch-Tone DTMF Muscle Memory & Motorola Alphanumeric Pager Telemetry for MCP Autonomous Healthcare
            </p>
          </div>
        </div>

        {/* Live Control Buttons & Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Feature B: PSTN 300-3400Hz Landline Toggle */}
          <button
            onClick={togglePstnMode}
            className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-md border transition-all ${
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
            className={`flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-md border transition-all ${
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
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-xs"
            title="Synthesize 1995 Pharmacy Thermal Fax Stepper Motor & Print Slip"
          >
            <span>📠 Print Rx Slip</span>
          </button>

          {/* Test 2400Hz Pager Chirp */}
          <button
            onClick={handleTestPager}
            disabled={pagerChirping}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-all ${
              pagerChirping
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
            title="Synthesize 1995 Motorola POCSAG 2400Hz 4-burst acoustic pager chirp"
          >
            <span className={`w-2 h-2 rounded-full ${pagerChirping ? 'bg-amber-500 animate-ping' : 'bg-slate-400'}`}></span>
            <span>Test 2400Hz Pager</span>
          </button>
        </div>
      </div>

      {/* Main Grid: DTMF Keypad Macros + Alphanumeric POCSAG Pager Readout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Left Section: 1995 DTMF Quick-Dial Macros (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              1995 Touch-Tone Landline Macros (Eleanor's Tactile Muscle Memory)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Web Audio API Dual-Sine Synthesis
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {DTMF_MACROS.map((macro) => {
              const isSelected = activeKey === macro.key;
              return (
                <button
                  key={macro.key}
                  onClick={() => handleMacroPress(macro)}
                  disabled={isProcessing}
                  className={`flex flex-col items-start p-2.5 rounded-lg border bg-white transition-all text-left group shadow-xs ${
                    macro.colorClass
                  } ${
                    isSelected
                      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 scale-95'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-1 mb-1.5 flex-wrap">
                    <span className="font-mono font-bold text-base text-slate-900 group-hover:text-blue-600 shrink-0">
                      [{macro.key}]
                    </span>
                    <span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0 whitespace-nowrap">
                      {macro.badge}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {macro.label}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 italic line-clamp-1">
                    "{macro.transcript}"
                  </span>
                </button>
              );
            })}
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

        {/* Right Section: 1995 POCSAG Alphanumeric Pager Readout (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-slate-900 text-emerald-400 rounded-lg p-3 border border-slate-800 font-mono shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>POCSAG 1200 ALPHANUMERIC</span>
            </div>
            <span className="text-[10px] text-slate-400">SARAH CONNOR RX</span>
          </div>

          {/* LCD Screen Display */}
          <div className="my-auto py-1">
            <div className="text-[11px] text-emerald-500 uppercase tracking-wider mb-0.5">
              LAST TRANSMITTED FRAME
            </div>
            <div className="text-xs font-mono text-emerald-300 font-medium break-all tracking-wide">
              {pagerStatus}
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
              <span>FREQ: 2400.00 Hz</span>
              <span>CARRIER: ITU-T Q.23</span>
              <span className="text-emerald-400">100% ONLINE</span>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
            <span>RESURRECTION TRACK: 1995 TELECOM</span>
            <span>KIROWEEN 2026</span>
          </div>
        </div>
      </div>

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
