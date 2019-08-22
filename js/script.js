window.addEventListener('load', () => {
  var wavesurfer;
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var context;
  var processor;
  var osc0;
  var gain0;
  var osc1;
  var gain1;
  var txnode, outgain, thrugain;

  document.getElementById('load').addEventListener('click', () => {
    document.getElementById('modal').classList.remove('is-active');
    context = new AudioContext();
    toggleRXDisplay();
    createBasicTransmitter(context);
  });

  var tx0 = document.getElementById('tx0');
  var tx1 = document.getElementById('tx1');
  var gainSlider = document.getElementById('gainSlider');

  tx0.addEventListener('mousedown', () => {
    gain0.gain.value = 1;
  });

  tx0.addEventListener('mouseup', () => {
    gain0.gain.value = 0;
  });

  tx1.addEventListener('mousedown', () => {
    gain1.gain.value = 1;
  });

  tx1.addEventListener('mouseup', () => {
    gain1.gain.value = 0;
  });

  gainSlider.addEventListener('input', (e) => {
    outgain.gain.value = e.target.value/100;
    document.getElementById('gainValue').innerHTML = e.target.value;
  });

  document.addEventListener('keydown',(e) => {
    const keyName = e.key;
    if (keyName == '0') {
        gain0.gain.value = 1;
        tx0.classList.add('is-info');
    }
    if (keyName == '1') {
        gain1.gain.value = 1;
        tx1.classList.add('is-info');
    }
  });

  document.addEventListener('keyup',(e) => {
    const keyName = e.key;
    if (keyName == '0') {
        gain0.gain.value = 0;
        tx0.classList.remove('is-info');
    }
    if (keyName == '1') {
        gain1.gain.value = 0;
        tx1.classList.remove('is-info');
    }
  });

  function toggleRXDisplay(){
    if (wavesurfer === undefined) {
        // Init wavesurfer
        processor = context.createScriptProcessor(16384, 1, 1);
        wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: 'black',
            interact: false,
            cursorWidth: 0,
            audioContext: context || null,
            audioScriptProcessor: processor || null,
            plugins: [WaveSurfer.microphone.create({
              'bufferSize': 4096
            })]
        });

        wavesurfer.microphone.on('deviceReady', function() {
            console.info('Device ready!');
        });
        wavesurfer.microphone.on('deviceError', function(code) {
            console.warn('Device error: ' + code);
        });
        wavesurfer.microphone.start();
    } else {
        // start/stop mic on button click
        if (wavesurfer.microphone.active) {
            wavesurfer.microphone.stop();
        } else {
            wavesurfer.microphone.start();
        }
    }
  }

  function createBasicTransmitter(context){

    txnode = new GainNode(context);
    outgain = new GainNode(context);
    thrugain = new GainNode(context);

    thrugain.gain.value = 0.5;

    osc0 = new OscillatorNode(context);
    gain0 = new GainNode(context);
    osc1 = new OscillatorNode(context);
    gain1 = new GainNode(context);

    osc0.connect(gain0).connect(txnode);
    osc1.connect(gain1).connect(txnode);

    txnode.connect(outgain).connect(context.destination);
    txnode.connect(thrugain).connect(processor);

    gain0.gain.value = 0;
    gain1.gain.value = 0;
    osc0.frequency.value = 4000;
    osc1.frequency.value = 5000;
    osc0.start();
    osc1.start();

  }
});
