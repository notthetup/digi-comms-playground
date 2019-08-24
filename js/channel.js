var AudioContext = window.AudioContext || window.webkitAudioContext;
var echoTime = 0;
var ir;
var noisegain;
window.addEventListener('load', () => {
  document.getElementById('load').addEventListener('click', () => {
    document.getElementById('modal').classList.remove('is-active');
    var context = new AudioContext();
    var wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        audioContext: context
    });
    var wctrl = document.getElementById('wctrl');
    var wctrlicon = document.querySelector('#wctrl span svg');
    wctrl.addEventListener('click', () => {
      if (wctrlicon.dataset['icon'] == 'play'){
        var buf = context.createBuffer(2,context.sampleRate*3,context.sampleRate);
        var dataL = buf.getChannelData(0);
        var dataR = buf.getChannelData(1);
        var echoSample = parseInt(Math.floor(context.sampleRate * echoTime));
        dataL[0] = 1;
        dataL[echoSample] = 1;
        dataR[0] = 1;
        dataR[echoSample] = 1;
        ir.buffer = buf;
        wavesurfer.play();
        wctrlicon.dataset['icon'] = 'pause';
      } else{
        wavesurfer.pause();
        wctrlicon.dataset['icon'] = 'play';
      }
    });

    wavesurfer.on('finish', () => {
      wavesurfer.play();
    });


    document.getElementById('wload').addEventListener('change', e => {
      wavesurfer.on('ready', () => {
        wctrl.removeAttribute('disabled');
      });
      wavesurfer.loadBlob(e.target.files[0]);
      ir = context.createConvolver();
      var comb = context.createGain();
      noisegain = context.createGain();
      var noisenode = context.createBufferSource();
      var buf = context.createBuffer(2,context.sampleRate*3,context.sampleRate);
      var dataL = buf.getChannelData(0);
      var dataR = buf.getChannelData(1);
      for (var i = 0; i < dataL.length; i++){
        dataL[i] = Math.random()*2-1;
        dataR[i] = Math.random()*2-1;
      }
      noisenode.buffer = buf;
      noisenode.loop = true;
      noisenode.connect(noisegain).connect(comb);
      noisegain.gain.value = 0;
      noisenode.start();
      wavesurfer.backend.setFilters([ir, comb]);

    }, false);
  });

  var echoSlider = document.getElementById('echoSlider');
  echoSlider.addEventListener('input', (e) => {
    document.getElementById('echoValue').innerHTML = parseFloat(e.target.value).toFixed(2);
    echoTime = parseFloat(e.target.value);
  });

  var noiseSlider = document.getElementById('noiseSlider');
  noiseSlider.addEventListener('input', (e) => {
    document.getElementById('noiseValue').innerHTML = parseFloat(e.target.value).toFixed(2);
    noisegain.gain.value = parseFloat(e.target.value);
  });
});
