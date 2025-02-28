// index.js

console.log("JavaScript loaded!");

// Web Audio API setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let tickBuffer;

// Define the playTick function
function playTick() {
  if (!tickBuffer) {
    console.error("Audio not loaded!");
    return;
  }
  const source = audioContext.createBufferSource();
  source.buffer = tickBuffer;
  source.connect(audioContext.destination);
  source.start(0);
  console.log("Tick played!");
}

// Export updateBeat to WebAssembly
function updateBeat(beat) {
    const beatElement = document.getElementById("beat");
    if (beatElement) {
      beatElement.textContent = beat.toString(); // Update the displayed beat
    }
  }

// Load the tick sound
fetch('./tick.wav')
  .then(res => res.arrayBuffer())
  .then(buffer => audioContext.decodeAudioData(buffer))
  .then(decoded => {
    tickBuffer = decoded;
    console.log("Audio loaded!");
  })
  .catch(console.error);


// Load WebAssembly directly
fetch('./build/release.wasm')
  .then(response => response.arrayBuffer())
  .then(bytes => WebAssembly.instantiate(bytes, {
    env: {
      playTick: playTick,
      updateBeat: (i) => updateBeat(i),

      // Provide Date.now function
      "Date.now": () => Date.now(),
      "console.log": () => console.log(),
      // Add any other required imports
      abort: () => console.error("Wasm aborted")
    }
  }))
.then(instance => {
  // Get the exports (might be directly the instance or in instance.exports)
  const exports = instance.exports || instance.instance.exports;
  
  const { start, stop, update } = exports;
  
  // Button event listeners
  let animationFrame;
  document.getElementById('start').addEventListener('click', () => {
    audioContext.resume().then(() => {
      start(120); // Start at 120 BPM
      function loop() {
        update();
        animationFrame = requestAnimationFrame(loop);
      }
      loop();
    });
  });

  document.getElementById('stop').addEventListener('click', () => {
    stop();
    cancelAnimationFrame(animationFrame);
  });
})
.catch(err => {
  console.error("Failed to instantiate WebAssembly module:", err);
});
