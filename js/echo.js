var AudioContext = window.AudioContext || window.webkitAudioContext;
    var context, inputgain, noechogain, echogain, source, speechbuffer;
    window.addEventListener('load', () => {
      document.getElementById('load').addEventListener('click', () => {
        document.getElementById('modal').classList.remove('is-active');
          //Loading from URL
        context = new AudioContext();

        inputgain = new GainNode(context);
        noechogain = new GainNode(context);
        echogain = new GainNode(context);

        var ir = new ConvolverNode(context);

        inputgain.connect(noechogain).connect(context.destination);
        inputgain.connect(ir).connect(echogain).connect(context.destination);
        fetch('st.wav')
        .then(function(response) {
          if (!response.ok) {
            console.error('HTTP error, status = ' + response.status);
          }
          return response.arrayBuffer();
        })
        .then(function(buffer) {
          context.decodeAudioData(buffer, function(decodedData) {
            ir.buffer = decodedData;
          });
        });

        fetch('speech.wav')
        .then(function(response) {
          if (!response.ok) {
            console.error('HTTP error, status = ' + response.status);
          }
          return response.arrayBuffer();
        })
        .then(function(buffer) {
          context.decodeAudioData(buffer, function(decodedData) {
            speechbuffer = decodedData;
          });
        });

      });
      var noecho = document.getElementById('noecho');
      var echo = document.getElementById('echo');

      noecho.addEventListener('click', e => {
        if (e.target.innerHTML == 'Play'){
          noechogain.gain.value = 1;
          echogain.gain.value = 0;
          if (source) source.disconnect();
          source = new AudioBufferSourceNode(context);
          source.buffer = speechbuffer;
          source.connect(inputgain);
          source.start();
          e.target.innerHTML = 'Stop';
        } else {
          source.stop();
          e.target.innerHTML = 'Play';
        }
      });

      echo.addEventListener('click', e => {
        if (e.target.innerHTML == 'Play'){
          noechogain.gain.value = 0;
          echogain.gain.value = 1;
          if (source) source.disconnect();
          source = new AudioBufferSourceNode(context);
          source.buffer = speechbuffer;
          source.connect(inputgain);
          source.start();
          e.target.innerHTML = 'Stop';
        } else {
          source.stop();
          e.target.innerHTML = 'Play';
        }
      });

    });
