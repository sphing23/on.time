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
  // console.log("Tick played!" + Date.now());
}

// Export updateBeat to WebAssembly
function updateBeat(beat) {
  const beatElement = document.getElementById("beat");
  if (beatElement) {
    beatElement.textContent = beat.toString(); // Update the displayed beat
  }
}

// Load the tick sound
fetch('./tick-short.mp3')
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
      // Add any other required imports
      abort: () => console.error("Wasm aborted")
    }
  }))
  .then(instance => {
    // Get the exports (might be directly the instance or in instance.exports)
    const exports = instance.exports || instance.instance.exports;

    const { start, stop, update } = exports;

    // Replace the button event listeners with this
    const toggleButton = document.getElementById('toggle');
    const bpmInput = document.getElementById('bpmInput');
    const timeSignature = document.getElementById('timeSignature');
    const timeDivision = document.getElementById('timeDivision');
    let isRunning = false;
    let tempoTimer;

    toggleButton.addEventListener('click', () => {
      if (!isRunning) {
        const bpm = parseInt(bpmInput.value) || 120; // Default to 120 BPM if input is invalid
        const timeSig = parseInt(timeSignature.value.split('/')[0]); // Get the numerator of the time signature
        const timeSigBtmNo = parseInt(timeSignature.value.split('/')[1]); // Get the denominator of the time division
        const division = parseFloat(timeDivision.value); // get time division float
        audioContext.resume().then(() => {
          start(bpm, timeSig, timeSigBtmNo, division);
          isRunning = true;
          toggleButton.textContent = '⏹';
          bpmInput.disabled = true;
          timeSignature.disabled = true;
          timeDivision.disabled = true;

          function loop() {
            update();
            console.log("Looping" + Date.now());
            tempoTimer = setTimeout(loop, 0);
          }
          loop();
        });
      } else {
        stop();
        isRunning = false;
        toggleButton.textContent = '▶';
        bpmInput.disabled = false;
        timeSignature.disabled = false;
        timeDivision.disabled = false;
        clearTimeout(tempoTimer);
      }
    });
  })
  .catch(err => {
    console.error("Failed to instantiate WebAssembly module:", err);
  });
