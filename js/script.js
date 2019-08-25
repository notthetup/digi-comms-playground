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
  var gains;
  var chiplen;

  const bufferSize = 1024;
  var freqs = [4000, 6000];
  var detectorThreshold = 0.01;


  document.getElementById('load').addEventListener('click', () => {
    document.getElementById('modal').classList.remove('is-active');
    context = new AudioContext();
    chiplen = 1024/context.sampleRate;
    toggleRXDisplay();
    createBasicTransmitter(context);
  });

  var tx0 = document.getElementById('tx0');
  var tx1 = document.getElementById('tx1');
  var det = document.getElementById('det');
  var detBtn = document.getElementById('detBtn');
  var gainSlider = document.getElementById('gainSlider');
  var seqBtn = document.getElementById('seqBtn');
  var seqInput = document.getElementById('seq');
  var rec = document.getElementById('rec');

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
    if (e.target.id == 'seq') return;
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
    if (e.target.id == 'seq') return;
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

  seqBtn.addEventListener('click', () => {
    var val = seqInput.value;
    if (/^[01]+$/.test(val)){
      console.log('Transmitting ' + val);
      seqBtn.disable = true;
      rec.value = '';
      seqBtn.classList.add('is-info');
      transmitSequence(val, () => {
        seqBtn.disable = true;
        seqBtn.classList.remove('is-info');
      });
    }
    seqInput.value = '';
  });

  function transmitSequence(sequence, cb){
    var now = context.currentTime;
    gains[0].gain.setValueAtTime(0, now);
    gains[1].gain.setValueAtTime(0, now);
    for (var i = 0; i < sequence.length; i++){
      gains[parseInt(sequence[i])].gain.setValueAtTime(1, now+(i*chiplen));
      gains[parseInt(sequence[i])].gain.setValueAtTime(0, now+((i+1)*chiplen));
    }
    setTimeout(cb, sequence.length*chiplen);
  }

  function toggleRXDisplay(){
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
          'bufferSize': bufferSize
        })]
    });

    var gf1 = GoertzelFilter();
    var gf2 = GoertzelFilter();

    gf1.init(freqs[0], context.sampleRate, bufferSize);
    gf2.init(freqs[1], context.sampleRate, bufferSize);

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

      if (r1 > r2 && r1 > detectorThreshold){
        det.innerHTML='0';
        detBtn.classList.add('is-info');
        rec.value += '0';
        console.log(`Detected ${freqs[0]}`);
      }else if (r1 < r2 && r2 > detectorThreshold){
        det.innerHTML='1';
        rec.value += '1';
        detBtn.classList.add('is-info');
        console.log(`Detected ${freqs[1]}`);
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

    gains = [gain0, gain1];

    osc0.connect(gain0).connect(txnode);
    osc1.connect(gain1).connect(txnode);

    txnode.connect(outgain).connect(context.destination);
    // txnode.connect(thrugain).connect(processor);

    gain0.gain.value = 0;
    gain1.gain.value = 0;
    osc0.frequency.value = freqs[0];
    osc1.frequency.value = freqs[1];
    osc0.start();
    osc1.start();

  }
});
