var AudioContext = window.AudioContext || window.webkitAudioContext;
window.addEventListener('load', () => {
  document.getElementById('load').addEventListener('click', () => {
    document.getElementById('modal').classList.remove('is-active');
    var context = new AudioContext();
    var wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        context: context
    });
    var wctrl = document.getElementById('wctrl');
    var wctrlicon = document.querySelector('#wctrl span svg');
    wctrl.addEventListener('click', () => {
      if (wctrlicon.dataset['icon'] == 'play'){
        wavesurfer.play();
        wctrlicon.dataset['icon'] == 'pause';
      } else{
        wavesurfer.pause();
        wctrlicon.dataset['icon'] == 'play';
      }
    });
    document.getElementById('wload').addEventListener('change', e => {
      wavesurfer.loadBlob(e.target.files[0]);
    }, false);
  });
});
