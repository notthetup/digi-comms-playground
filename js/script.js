/*global WaveSurfer, GoertzelFilter*/

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
  var det = document.getElementById('det');
  var detBtn = document.getElementById('detBtn');
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
    // Init wavesurfer
    const bufferSize = 1024;
    processor = context.createScriptProcessor(16384, 1, 1);
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'black',
        interact: false,
        cursorWidth: 0,
        audioContext: context || null,
        audioScriptProcessor: processor || null,
        plugins: [WaveSurfer.microphone.create({
          'bufferSize': bufferSize
        })]
    });

    var gf1 = GoertzelFilter();
    var gf2 = GoertzelFilter();

    gf1.init(4000, context.sampleRate, bufferSize);
    gf2.init(5000, context.sampleRate, bufferSize);

    wavesurfer.microphone.on('deviceReady', function() {
        console.info('Device ready!');
    });
    wavesurfer.microphone.on('deviceError', function(code) {
        console.warn('Device error: ' + code);
    });
    wavesurfer.microphone.start();

    wavesurfer.on('ready', (buf) => {
      var data = buf.getChannelData(0);
      var r1 = gf1.run(data);
      var r2 = gf2.run(data);

      if (r1 > r2 && r1 > 0.05){
        det.innerHTML='0';
        detBtn.classList.add('is-info');
        console.log('Detected 4000');
      }else if (r1 < r2 && r2 > 0.05){
        det.innerHTML='1';
        detBtn.classList.add('is-info');
        console.log('Detected 5000');
      } else{
        det.innerHTML='-';
        detBtn.classList.remove('is-info');
      }
    });
  }

  function createBasicTransmitter(context){

    txnode = context.createGain();
    outgain = context.createGain();
    thrugain = context.createGain();

    thrugain.gain.value = 0.5;

    osc0 = context.createOscillator();
    gain0 = context.createGain();
    osc1 = context.createOscillator();
    gain1 = context.createGain();

    osc0.connect(gain0).connect(txnode);
    osc1.connect(gain1).connect(txnode);

    txnode.connect(outgain).connect(context.destination);
    // txnode.connect(thrugain).connect(processor);

    gain0.gain.value = 0;
    gain1.gain.value = 0;
    osc0.frequency.value = 4000;
    osc1.frequency.value = 5000;
    osc0.start();
    osc1.start();

  }
});
