// assembly/index.ts

// Declare JavaScript functions
@external("env", "playTick")
declare function playTick(): void;

@external("env", "updateBeat")
declare function updateBeat(beat: i32): void;

// Track metronome state
let isRunning: bool = false;
let intervalMs: f64 = 0;
let beatIntervalMs: f64 = 0;
let nextTickTime: i64 = 0;
let nextBeatTime: i64 = 0;
let currentBeat: i32 = 0; // Track the current beat (1, 2, 3, 4)
let beatsPerMeasure: i32 = 4; // Default to 4 beats per measure
let beatsTimeDivision: i32 = 4; // Default to quarter note
let divisionFactor: f64 = 1.0; // Default to quarter note

// Start the metronome
export function start(bpm: f64, timeSig: i32, timeSigBtmNo: i32, division: f64): void {
  isRunning = true;
  beatsPerMeasure = timeSig;
  beatsTimeDivision = timeSigBtmNo;
  divisionFactor = division;
  intervalMs = (60.0 / bpm) * 1000 * (divisionFactor * beatsTimeDivision); // Calculate interval in milliseconds
  beatIntervalMs = (60.0 / bpm) * 1000;
  nextTickTime = Date.now(); // Set nextTickTime to NOW for immediate first tick
  nextBeatTime = nextTickTime;
  currentBeat = 0; // Reset beat counter
  update();
}

// Stop the metronome
export function stop(): void {
  isRunning = false;
}

// Update loop (called from JavaScript)
export function update(): void {
  if (!isRunning) return;
  const now: i64 = Date.now();
  if (now >= (nextTickTime)) {
    playTick(); // Play the tick sound
    nextTickTime = now + i64(intervalMs); // Schedule the next tick
    if (now >= (nextBeatTime)) {
      currentBeat = currentBeat < beatsPerMeasure ? currentBeat + 1 : 1; // Cycle through beats based on time signature
      updateBeat(currentBeat); // Update the displayed beat
      nextBeatTime = now + i64(beatIntervalMs); // Schedule the next beat
    }
  }
}
