import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { checkDrugInteractions } from '../src/services/drugInteractionService.js';

/**
 * PulseTone-95: GhostLine Property-Based Testing (PBT) Suite
 * Kiroween 2026 Hackathon — Track: Resurrection
 * Verifying 1995 ITU-T Q.23 DTMF determinism, 2023 AGS Beers Criteria, and Family Wallet Autonomy
 */

// ---------------------------------------------------------------------------
// 1. 1995 ITU-T Q.23 Dual-Tone Multi-Frequency (DTMF) Standard Specifications
// ---------------------------------------------------------------------------
export const DTMF_SPEC: Record<string, { lowHz: number; highHz: number }> = {
  '1': { lowHz: 697, highHz: 1209 },
  '2': { lowHz: 697, highHz: 1336 },
  '3': { lowHz: 697, highHz: 1477 },
  '4': { lowHz: 770, highHz: 1209 },
  '5': { lowHz: 770, highHz: 1336 },
  '6': { lowHz: 770, highHz: 1477 },
  '7': { lowHz: 852, highHz: 1209 },
  '8': { lowHz: 852, highHz: 1336 },
  '9': { lowHz: 852, highHz: 1477 },
  '*': { lowHz: 941, highHz: 1209 },
  '0': { lowHz: 941, highHz: 1336 },
  '#': { lowHz: 941, highHz: 1477 },
};

export const VALID_DTMF_KEYS = Object.keys(DTMF_SPEC);

/**
 * ITU-T Q.23 Tone Encoder
 */
export function encodeDtmfTone(key: string): { lowHz: number; highHz: number } {
  const spec = DTMF_SPEC[key];
  if (!spec) throw new Error(`Invalid DTMF key: ${key}`);
  return { ...spec };
}

/**
 * ITU-T Q.23 Goertzel / Frequency Window Decoder
 * Rejects tones deviating outside +/- tolerancePct (Standard ITU-T recommendation is +/- 1.5%)
 */
export function decodeDtmfTone(
  lowHz: number,
  highHz: number,
  tolerancePct = 1.5
): string | null {
  const tol = tolerancePct / 100;
  for (const [key, spec] of Object.entries(DTMF_SPEC)) {
    const lowMin = spec.lowHz * (1 - tol);
    const lowMax = spec.lowHz * (1 + tol);
    const highMin = spec.highHz * (1 - tol);
    const highMax = spec.highHz * (1 + tol);

    if (
      lowHz >= lowMin &&
      lowHz <= lowMax &&
      highHz >= highMin &&
      highHz <= highMax
    ) {
      return key;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 2. Autonomous Family Wallet Settlement Invariant Function
// ---------------------------------------------------------------------------
export function evaluateAutonomousRefillSettlement(
  currentMonthlySpent: number,
  refillPrice: number,
  monthlyCap = 50.0
): {
  autonomousVaultPermitted: boolean;
  action: 'PAYPAL_VAULT_CAPTURE' | 'ESCALATE_CAREGIVER_PAGER_INVOICE';
  projectedTotal: number;
} {
  const projectedTotal = parseFloat((currentMonthlySpent + refillPrice).toFixed(2));
  const isPermitted = refillPrice <= monthlyCap && projectedTotal <= monthlyCap;

  return {
    autonomousVaultPermitted: isPermitted,
    action: isPermitted ? 'PAYPAL_VAULT_CAPTURE' : 'ESCALATE_CAREGIVER_PAGER_INVOICE',
    projectedTotal,
  };
}

// ---------------------------------------------------------------------------
// 3. PROPERTY-BASED TEST SUITE
// ---------------------------------------------------------------------------
describe('Kiroween 2026: Property-Based Testing (PBT) Suite', () => {

  // =========================================================================
  // PROPERTY 1: DTMF Frequency & Sequence Determinism (ITU-T Q.23)
  // =========================================================================
  describe('Property 1: ITU-T Q.23 DTMF Encoding/Decoding Determinism & Noise Rejection', () => {
    it('proves bijectivity: for any sequence of valid DTMF digits, encoding and decoding returns the exact sequence without collision', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...VALID_DTMF_KEYS), { minLength: 1, maxLength: 20 }),
          (digits) => {
            const decoded = digits.map((digit) => {
              const { lowHz, highHz } = encodeDtmfTone(digit);
              return decodeDtmfTone(lowHz, highHz, 1.5);
            });
            expect(decoded).toEqual(digits);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('proves noise tolerance within +/- 1.2% in-band jitter: decoding remains 100% deterministic', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...VALID_DTMF_KEYS),
          fc.double({ min: -0.012, max: 0.012, noNaN: true }),
          fc.double({ min: -0.012, max: 0.012, noNaN: true }),
          (digit, lowJitter, highJitter) => {
            const base = encodeDtmfTone(digit);
            const jitteredLow = base.lowHz * (1 + lowJitter);
            const jitteredHigh = base.highHz * (1 + highJitter);

            const decoded = decodeDtmfTone(jitteredLow, jitteredHigh, 1.5);
            expect(decoded).toBe(digit);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('proves out-of-band rejection: frequencies in the inter-tone guard band (+2% to +6%) are deterministically rejected as line noise', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...VALID_DTMF_KEYS),
          fc.oneof(
            fc.double({ min: 0.02, max: 0.06, noNaN: true }),
            fc.double({ min: -0.06, max: -0.02, noNaN: true })
          ),
          (digit, guardBandOffset) => {
            const base = encodeDtmfTone(digit);
            const noisyLow = base.lowHz * (1 + guardBandOffset);
            const noisyHigh = base.highHz;

            const decoded = decodeDtmfTone(noisyLow, noisyHigh, 1.5);
            expect(decoded).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('proves that any frequency deviation outside +/- 1.5% never decodes to the original digit', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...VALID_DTMF_KEYS),
          fc.oneof(
            fc.double({ min: 0.016, max: 0.30, noNaN: true }),
            fc.double({ min: -0.30, max: -0.016, noNaN: true })
          ),
          (digit, deviation) => {
            const base = encodeDtmfTone(digit);
            const deviatedLow = base.lowHz * (1 + deviation);
            const decoded = decodeDtmfTone(deviatedLow, base.highHz, 1.5);
            expect(decoded).not.toBe(digit);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // =========================================================================
  // PROPERTY 2: 2023 AGS Beers Criteria Safety Invariant
  // =========================================================================
  describe('Property 2: 2023 AGS Beers Criteria Clinical Safety Invariants', () => {
    // Helper to generate randomized casing and whitespace
    const randomPermuteString = (str: string, prefixSpaces: number, suffixSpaces: number, casingPattern: number) => {
      const chars = str.split('').map((c, i) => {
        return (casingPattern + i) % 2 === 0 ? c.toUpperCase() : c.toLowerCase();
      });
      return `${' '.repeat(prefixSpaces)}${chars.join('')}${' '.repeat(suffixSpaces)}`;
    };

    it('proves Warfarin + Aspirin always triggers a CRITICAL bleeding warning across arbitrary casing and whitespace', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.nat({ max: 4 }),
          fc.nat({ max: 4 }),
          fc.nat({ max: 10 }),
          fc.nat({ max: 4 }),
          fc.nat({ max: 4 }),
          fc.nat({ max: 10 }),
          async (wPref, wSuff, wCase, aPref, aSuff, aCase) => {
            const warfarinPermuted = randomPermuteString('Warfarin', wPref, wSuff, wCase);
            const aspirinPermuted = randomPermuteString('Aspirin', aPref, aSuff, aCase);

            const result = await checkDrugInteractions(warfarinPermuted, [aspirinPermuted]);
            expect(result.hasInteraction || (result as any).hasInteractions).toBe(true);
            expect(result.warnings.length).toBeGreaterThanOrEqual(1);
            expect(result.warnings.some((w) => w.severity === 'CRITICAL')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('proves Lisinopril + Potassium always triggers a HIGH hyperkalemia warning across arbitrary casing and whitespace', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.nat({ max: 4 }),
          fc.nat({ max: 4 }),
          fc.nat({ max: 10 }),
          fc.nat({ max: 4 }),
          fc.nat({ max: 4 }),
          fc.nat({ max: 10 }),
          async (lPref, lSuff, lCase, pPref, pSuff, pCase) => {
            const lisinoprilPermuted = randomPermuteString('Lisinopril', lPref, lSuff, lCase);
            const potassiumPermuted = randomPermuteString('Potassium', pPref, pSuff, pCase);

            const result = await checkDrugInteractions(lisinoprilPermuted, [potassiumPermuted]);
            expect(result.hasInteraction || (result as any).hasInteractions).toBe(true);
            expect(result.warnings.length).toBeGreaterThanOrEqual(1);
            expect(result.warnings.some((w) => w.title.toLowerCase().includes('hyperkalemia'))).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('proves Diazepam (high-risk benzodiazepine) in geriatric patients is NEVER silently approved', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.nat({ max: 4 }),
          fc.nat({ max: 4 }),
          fc.nat({ max: 10 }),
          async (pref, suff, cCase) => {
            const diazepamPermuted = randomPermuteString('Diazepam', pref, suff, cCase);

            const result = await checkDrugInteractions(diazepamPermuted, ['Amlodipine 5mg']);
            expect(result.hasInteraction || (result as any).hasInteractions).toBe(true);
            expect(result.warnings.length).toBeGreaterThanOrEqual(1);
            expect(result.beersCriteriaAssessment?.recommendation).toBe('AVOID');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // =========================================================================
  // PROPERTY 3: Autonomous Family Wallet $50.00 Cap Invariant
  // =========================================================================
  describe('Property 3: Autonomous Family Wallet $50.00 Spending Cap Invariant', () => {
    it('proves autonomous Vault capture is permitted IF AND ONLY IF S + P <= $50.00', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.0, max: 50.0, noNaN: true }),
          fc.double({ min: 0.01, max: 500.0, noNaN: true }),
          (currentSpent, refillPrice) => {
            const roundedSpent = parseFloat(currentSpent.toFixed(2));
            const roundedPrice = parseFloat(refillPrice.toFixed(2));
            const projected = parseFloat((roundedSpent + roundedPrice).toFixed(2));

            const outcome = evaluateAutonomousRefillSettlement(roundedSpent, roundedPrice, 50.0);

            if (projected <= 50.0 && roundedPrice <= 50.0) {
              expect(outcome.autonomousVaultPermitted).toBe(true);
              expect(outcome.action).toBe('PAYPAL_VAULT_CAPTURE');
            } else {
              expect(outcome.autonomousVaultPermitted).toBe(false);
              expect(outcome.action).toBe('ESCALATE_CAREGIVER_PAGER_INVOICE');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('proves exact boundary condition at $50.00 threshold', () => {
      // Exactly $50.00 spend is permitted
      const atExactCap = evaluateAutonomousRefillSettlement(40.0, 10.0, 50.0);
      expect(atExactCap.autonomousVaultPermitted).toBe(true);
      expect(atExactCap.action).toBe('PAYPAL_VAULT_CAPTURE');

      // $50.01 spend is immediately escalated
      const oneCentOverCap = evaluateAutonomousRefillSettlement(40.0, 10.01, 50.0);
      expect(oneCentOverCap.autonomousVaultPermitted).toBe(false);
      expect(oneCentOverCap.action).toBe('ESCALATE_CAREGIVER_PAGER_INVOICE');
    });
  });

  describe('Property 4: ITU-T Q.23 Goertzel / FFT Spectral Bin Orthogonality (44.1kHz & 48kHz)', () => {
    const ITU_T_FREQUENCIES = [697, 770, 852, 941, 1209, 1336, 1477, 1633];
    const FFT_SIZE = 4096;

    it('proves that all 8 DTMF tones map to mutually orthogonal FFT bins with zero collision and min separation >= 6 bins', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(44100, 48000),
          (sampleRate) => {
            const bins = ITU_T_FREQUENCIES.map((f) => Math.round((f * FFT_SIZE) / sampleRate));
            const uniqueBins = new Set(bins);

            // Invariant 1: Exactly 8 unique frequency bins (no aliasing or bin collisions)
            expect(uniqueBins.size).toBe(8);

            // Invariant 2: Inter-bin distance is at least 6 bins across all pairs (guarantees acoustic separation)
            for (let i = 0; i < bins.length; i++) {
              for (let j = i + 1; j < bins.length; j++) {
                const distance = Math.abs(bins[i] - bins[j]);
                expect(distance).toBeGreaterThanOrEqual(6);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('proves frequency deviation up to +/-1.5% maintains bin separation without collision', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(44100, 48000),
          fc.double({ min: -0.015, max: 0.015, noNaN: true }),
          (sampleRate, drift) => {
            const bins = ITU_T_FREQUENCIES.map((f) => Math.round((f * (1 + drift) * FFT_SIZE) / sampleRate));
            const uniqueBins = new Set(bins);
            expect(uniqueBins.size).toBe(8);
            for (let i = 0; i < bins.length; i++) {
              for (let j = i + 1; j < bins.length; j++) {
                expect(Math.abs(bins[i] - bins[j])).toBeGreaterThanOrEqual(6);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
