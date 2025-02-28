// Load the WebAssembly module
import { startMetronome } from './build/release.js';

// Set up Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let tickBuffer;

// Load the tick sound
fetch('tick.mp3')
  .then((response) => response.arrayBuffer())
  .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
  .then((buffer) => {
    tickBuffer = buffer;
  })
  .catch((error) => console.error('Error loading tick sound:', error));

// Function to play the tick sound (called from AssemblyScript)
export function playTick() {
  if (!tickBuffer) return;
  const source = audioContext.createBufferSource();
  source.buffer = tickBuffer;
  source.connect(audioContext.destination);
  source.start();
}

// Start the metronome
const bpm = 120; // Beats per minute
const duration = 60000; // Duration in milliseconds (1 minute)
startMetronome(bpm, duration);
