// assembly/index.ts

// Declare JavaScript functions
@external("env", "playTick")
declare function playTick(): void;

@external("env", "updateBeat")
declare function updateBeat(beat: i32): void;

// Track metronome state
let isRunning: bool = false;
let intervalMs: f64 = 0;
let nextTickTime: i64 = 0;
let currentBeat: i32 = 0; // Track the current beat (1, 2, 3, 4)

// Start the metronome
export function start(bpm: f64): void {
  isRunning = true;
  intervalMs = (60.0 / bpm) * 1000; // Calculate interval in milliseconds
  nextTickTime = Date.now(); // Set nextTickTime to NOW for immediate first tick
  currentBeat = 0; // Reset beat counter
  console.log("[Wasm] Metronome started");
}

// Stop the metronome
export function stop(): void {
  isRunning = false;
  console.log("[Wasm] Metronome stopped");
}

// Update loop (called from JavaScript)
export function update(): void {
  if (!isRunning) return;
  const now: i64 = Date.now();
  if (now >= nextTickTime) {
    currentBeat = (currentBeat % 4) + 1; // Cycle through 1, 2, 3, 4
    updateBeat(currentBeat); // Update the displayed beat
    playTick(); // Play the tick sound
    nextTickTime = now + i64(intervalMs); // Schedule the next tick
  }
}
