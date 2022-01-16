
export class AudioPlayer  {

  static AudioPlayerId="AudioPlayer_AudioObject";

  constructor() {
    this.audioObject=null;
    this.context=undefined;
    this.scriptNode=undefined;
    this.analyser=undefined;
    this.source=undefined;
    this.bufferLength=undefined;
    this.dataArray=undefined;
    this.firstLaunch=true;
    this.decodedBuffer=undefined;
    this.currentSongURL=undefined;
    this.paused=false;
    this.playing=false;
    this.activeRequest=undefined;
    this.playerStateCallback = undefined;
    this.frequencyData = undefined;
  }

  init() {
    this.audioObject=document.getElementById(AudioPlayer.AudioPlayerId);
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    // create audio context ... has to be via onclick event
    this.context = new AudioContext({latencyHint:"playback"});
    this.context.resume();
    //create analyser node
    this.analyser = this.context.createAnalyser();

    /*
    if (this.context.suspend)
      this.context.suspend();

    // create buffer source object
    if (this.audioObject !== null) {
      this.source = this.context.createMediaElementSource(this.audioObject);
    }

    this.gainNode = this.context.createGain();
    // create script node to process buffer chunks for fft processing
    this.scriptNode = this.context.createScriptProcessor(2048, 1, 1);
    this.scriptNode.connect(this.context.destination);
    //create analyser node
    this.analyser = this.context.createAnalyser();
    // connect analyser to script node
    //this.analyser.connect(this.scriptNode);
    // todo: what does this do ?
    this.analyser.smoothingTimeConstant = 0.6;
    // define fft size
    this.analyser.fftSize = 2048;


    this.scriptNode.onaudioprocess = () => {
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(this.frequencyData);
    };

     */
    this.firstLaunch = false;
  }

  getFrequencyData() {
    if (this.frequencyData !== undefined) {
      this.analyser.getByteFrequencyData(this.frequencyData);
    }
    return this.frequencyData;
  }


  playbackStopped(source) {
    if (this.source === source) {
      console.log("playbackStopped:" + source);
      // reset visualization
      this.playing = false;
      if (this.playerStateCallback !== undefined) {
        this.playerStateCallback("stopped")
      }
    }
    else {
      console.log({current:this.source, source})
    }
  }

  playAudioElementSource(url) {
    this.audioObject.pause();
    this.audioObject.src = url;

    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

    //this.source.buffer = buffer;
    this.playing=true;

    /*
    //let source = this.source;
    //this.source.onended = () => this.playbackStopped(source);
    //this.source.start();
    this.destination = this.context.destination;
    //this.source.connect(this.gainNode);
    this.source.connect(this.analyser);
    //this.gainNode.connect(this.destination);
    //this.analyser.connect(this.destination);
    this.analyser.connect(this.destination);

     */
    this.audioObject.load();
    this.audioObject.play();

    this.context.resume();

    // hack for now
    if (this.playerStateCallback !== undefined) {
      this.playerStateCallback("playing");
    }
  }

  playSoundBuffer(buffer) {
    // create buffer source object
    this.source = this.context.createBufferSource();
    this.source.buffer = buffer;
    this.playing=true;
    let source = this.source;
    this.source.onended = () => this.playbackStopped(source);
    this.source.start();
    this.destination = this.context.destination;
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.gainNode.connect(this.destination);
    this.context.resume();

  }

  stop() {
    if (this.source !== undefined) {
      if (this.audioObject === null) {
        this.source.stop();
      }
      else {
        this.audioObject.src = null;
        this.audioObject.pause();
      }
      //this.source.disconnect(this.analyser);
      if (this.audioObject === null) {
        this.source = undefined;
      }

      this.frequencyData = undefined;
    }
  }

  playSong(url,audioElementRef)  {
    if (this.firstLaunch) {
      this.init();
    }
    if (url === this.currentSongURL && this.paused) {
      /*
      if (!this.paused) {
        if (this.playerStateCallback !== undefined) {
          this.playerStateCallback("playing");
        }
        this.playSoundBuffer(this.decodedBuffer);
      }
      else {
       */
        this.context.resume();
      /*
      }
       */
    }
    else {
      this.stop();
      this.context.suspend();
      this.currentSongURL = url;

      if (this.activeRequest !== undefined) {
        this.activeRequest.abort();
        this.activeRequest = undefined;
      }

      if (audioElementRef === null) {
        this.activeRequest = new XMLHttpRequest();
        this.activeRequest.open('GET', url, true);
        this.activeRequest.responseType = 'arraybuffer';
        this.activeRequest.onload = () => {
          console.log("onload");
          this.context.decodeAudioData(this.activeRequest.response, (buffer) => {
            console.log(buffer);
            if (this.playerStateCallback !== undefined) {
              this.playerStateCallback("playing");
            }
            this.decodedBuffer = buffer;
            this.playSoundBuffer(this.decodedBuffer);
          });
        };
        this.activeRequest.send();
      }
      else {
        this.playAudioElementSource(url);
      }
    }
    this.paused = false;
  }

  pauseSong() {
    if (this.playing) {
      this.paused = true;
      this.context.suspend();
      if (this.playerStateCallback !== undefined) {
        this.playerStateCallback("paused");
      }
    }
  }

  resumeSong() {
    if (this.playing) {
      this.paused = false;
      this.context.resume();
      if (this.playerStateCallback !== undefined) {
        this.playerStateCallback("playing");
      }
    }
  }

  isPaused(){
    return this.playing && this.paused;
  }

  isPlaying(){
    return this.playing && !this.paused;
  }
}

export class Scene {

    constructor(player,visualization,canvasRef,minWidth) {
      this.canvasRef = canvasRef;
      this.player = player;
      this.padding = 30;
      this.minSize = minWidth;
      this.optimiseHeight = 800;
      this._inProcess =  false;
      this.scaleCoef = 0.5; //Math.max(0.5, 740 / this.optimiseHeight);



      this.initHandlers();
      this.visualization = visualization;

      this.visualization.init(this);
      //Tracker.init(this);
      //Controls.init(this);

      this.startRender();
    }

    canvasConfigure() {
      this.canvas = this.canvasRef.current;
      this.context = this.canvas.getContext('2d');
      this.context.strokeStyle = '#FE4365';
      this.calculateSize();
    }

    calculateSize() {

      let size = this.minSize;
      this.canvas.setAttribute('width', size);
      this.canvas.setAttribute('height', size);
      //this.canvas.style.marginTop = -size / 2 + 'px';
      //this.canvas.style.marginLeft = -size / 2 + 'px';

      this.width = size;
      this.height = size;

      //this.radius = (size - this.padding * 2) / 4;
      this.radius = 38;
      //this.cx = this.radius + this.padding;
      //this.cy = this.radius + this.padding;
      this.cx = size/2;
      this.cy = size/2;
      this.coord = this.canvas.getBoundingClientRect();
    }

    initHandlers() {
      window.onresize = ()=> {
        this.render();
      };
    }

    render() {
      requestAnimationFrame(() => {
        if (this.canvasRef.current !== null) {
          this.canvasConfigure();
          this.clear();
          this.draw();
        }
        if (this._inProcess) {
          this.render();
        }
      });
    }

    clear() {
      this.context.save();
      this.context.fillStyle = 'blue';
      //this.context.fillRect(0, 0, this.width, this.height);
      this.context.clearRect(0, 0, this.width, this.height);
      this.context.restore();
    }

    draw() {
      this.visualization.draw(this.context);
      //Tracker.draw();
      //Controls.draw();
    }

    startRender() {
      this._inProcess = true;
      this.render();
    }

    stopRender() {
      this._inProcess = false;
    }

    inProcess() {
      return this._inProcess;
    }
}

class Tracker {

  constructor() {
    this.innerDelta = 20;
    this.lineWidth =  7;
    this.prevAngle = 0.5;
    this.angle = 0;
    this.animationCount = 10;
    this.pressButton = false;
  }

  init(scene) {
    this.scene = scene;
    this.context = undefined;
    this.initHandlers();
  }

  initHandlers() {
    /*
    this.scene.canvas.addEventListener('mousedown', (e) => {
      if (this.isInsideOfSmallCircle(e) || this.isOusideOfBigCircle(e)) {
        return;
      }
      this.prevAngle = this.angle;
      this.pressButton = true;
      this.stopAnimation();
      this.calculateAngle(e, true);
    });
     */

    window.addEventListener('mouseup', () => {
      if (!this.pressButton) {
        return;
      }
      var id = setInterval(() => {
        if (!this.animatedInProgress) {
          this.pressButton = false;
          //Player.context.currentTime = this.angle / (2 * Math.PI) * Player.source.buffer.duration;
          clearInterval(id);
        }
      }, 100);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.animatedInProgress) {
        return;
      }
      if (this.pressButton && this.scene.inProcess()) {
        this.calculateAngle(e);
      }
    });
  }

  isInsideOfSmallCircle(e) {
    var x = Math.abs(e.pageX - this.scene.cx - this.scene.coord.left);
    var y = Math.abs(e.pageY - this.scene.cy - this.scene.coord.top);
    return Math.sqrt(x * x + y * y) < this.scene.radius - 3 * this.innerDelta;
  }

  isOusideOfBigCircle(e) {
    return Math.abs(e.pageX - this.scene.cx - this.scene.coord.left) > this.scene.radius ||
      Math.abs(e.pageY - this.scene.cy - this.scene.coord.top) > this.scene.radius;
  }

  draw() {
    /*
    if (!Player.source.buffer) {
      return;
    }
    */
    /*
    TODO:FIX THIS
    if (!this.pressButton) {
      this.angle = Player.context.currentTime / Player.source.buffer.duration * 2 * Math.PI || 0;
    }

    */
    this.drawArc();
  }

  drawArc() {
    this.context.save();
    this.context.strokeStyle = 'rgba(254, 67, 101, 0.8)';
    this.context.beginPath();
    this.context.lineWidth = this.lineWidth;

    this.r = this.scene.radius - (this.innerDelta + this.lineWidth / 2);
    this.context.arc(
      this.scene.radius + this.scene.padding,
      this.scene.radius + this.scene.padding,
      this.r, 0, this.angle, false
    );
    this.context.stroke();
    this.context.restore();
  }

  calculateAngle(e, animatedInProgress) {
    this.animatedInProgress = animatedInProgress;
    this.mx = e.pageX;
    this.my = e.pageY;
    this.angle = Math.atan((this.my - this.scene.cy - this.scene.coord.top) / (this.mx - this.scene.cx - this.scene.coord.left));
    if (this.mx < this.scene.cx + this.scene.coord.left) {
      this.angle = Math.PI + this.angle;
    }
    if (this.angle < 0) {
      this.angle += 2 * Math.PI;
    }
    if (animatedInProgress) {
      this.startAnimation();
    } else {
      this.prevAngle = this.angle;
    }
  }

  startAnimation() {
    let angle = this.angle;
    let l = Math.abs(this.angle) - Math.abs(this.prevAngle);
    let step = l / this.animationCount, i = 0;
    let f = () => {
      this.angle += step;
      if (++i === this.animationCount) {
        this.angle = angle;
        this.prevAngle = angle;
        this.animatedInProgress = false;
      } else {
        this.animateId = setTimeout(f, 20);
      }
    };

    this.angle = this.prevAngle;
    this.animateId = setTimeout(f, 20);
  }

  stopAnimation () {
    clearTimeout(this.animateId);
    this.animatedInProgress = false;
  }
}

export class CircleViz {
  constructor() {
    this.tracker = new Tracker();
    this.countTicks = 360;
    this.tickSize = 2;
    this.PI = 360;
    this.index = 0;
    this.loadingAngle = 0;
  }

  init(scene) {
    this.tracker.init(scene);
    this.scene = scene;
    this.configure();
   }

  configure() {
    //this.maxTickSize = this.tickSize * 9 * this.scene.scaleCoef;
    this.maxTickSize = 10;
    this.countTicks = 360 * this.scene.scaleCoef;
  }

  draw(context) {
    this.context = context;
    this.drawTicks();
    //this.drawEdging();
  }

  drawTicks() {
    this.context.save();
    this.context.beginPath();
    this.context.lineWidth = 1;
    this.ticks = this.getTicks(this.countTicks, this.tickSize, [0, 90]);
    for (var i = 0, len = this.ticks.length; i < len; ++i) {
      var tick = this.ticks[i];
      if (tick.x1 !== undefined) {
        this.drawTick(tick.x1, tick.y1, tick.x2, tick.y2);
      }
    }
    this.context.restore();
  }

  drawTick(x1, y1, x2, y2) {
    var dx1 = parseInt(this.scene.cx + x1);
    var dy1 = parseInt(this.scene.cy + y1);

    var dx2 = parseInt(this.scene.cx + x2);
    var dy2 = parseInt(this.scene.cy + y2);

    var gradient = this.context.createLinearGradient(dx1, dy1, dx2, dy2);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.6, '#9e00b7');
    gradient.addColorStop(1, '#F5F5F5');
    this.context.beginPath();
    this.context.strokeStyle = gradient;
    this.context.lineWidth = 2;
    this.context.moveTo(this.scene.cx + x1, this.scene.cx + y1);
    this.context.lineTo(this.scene.cx + x2, this.scene.cx + y2);
    this.context.stroke();
  }

  setLoadingPercent(percent) {
    this.loadingAngle = percent * 2 * Math.PI;
  }

  drawEdging() {
    this.context.save();
    this.context.beginPath();
    this.context.strokeStyle = 'rgba(254, 67, 101, 0.5)';
    this.context.lineWidth = 1;

    var offset = this.tracker.lineWidth / 2;
    this.context.moveTo(this.scene.padding + 2 * this.scene.radius - this.tracker.innerDelta - offset, this.scene.padding + this.scene.radius);
    this.context.arc(this.scene.cx, this.scene.cy, this.scene.radius - this.tracker.innerDelta - offset, 0, this.loadingAngle, false);

    this.context.stroke();
    this.context.restore();
  }

  getFrequencyData() {
    if (this.scene !== undefined && this.scene.player !== undefined) {
      // return this.scene.player.frequencyData;
      return this.scene.player.getFrequencyData();
    }
    else {
      return undefined;
    }
  }
  getTicks(count, size, animationParams) {

    let ticks = this.getTickPoints(count);
    let x1, y1, x2, y2, m = [], tick, k;
    let lesser = 160;
    let allScales = [];
    let frequencyData = this.getFrequencyData();

    if (frequencyData !== undefined) {
      for (let i = 0, len = ticks.length; i < len; ++i) {
        // i is index
        // calculate coefficient used to position point at location based on i
        // so it is 1 - (fraction if i/2.5x len)
        var coef = 1 - i / (len * 2.5);
        // delta is
        var delta = ((frequencyData[i] || 0) - lesser * coef) * this.scene.scaleCoef;

        if (delta > 0) {

          if (delta < 0) {
            delta = 0;
          } else if (delta > 30) {
            delta = 30;
          }
          tick = ticks[i];
          /*
          if (animationParams[0] <= tick.angle && tick.angle <=  animationParams[1]) {
            k = this.scene.radius / (this.scene.radius - this.getSize(tick.angle, animationParams[0], animationParams[1]) - delta);
          } else
          {
          */
            // k is
            k = this.scene.radius / (this.scene.radius - (size + delta));
          /*
          }
           */
          x1 = tick.x * (this.scene.radius - size); // scale up point to (radius - tick size)
          y1 = tick.y * (this.scene.radius - size); // scale up point to (radius - tick size)
          x2 = x1 * k;
          y2 = y1 * k;
          m.push({ x1: x1, y1: y1, x2: x2, y2: y2 });
        } else {
          m.push({});
        }

        if (i < 20) {
          var scale = delta / 50;
          scale = scale < 1 ? 1 : scale;
          allScales.push(scale);
        }
      }
      /*
      var sum = allScales.reduce(function(pv, cv) {
        return pv + cv;
      }, 0) / allScales.length;
      this.canvas.style.transform = 'scale('+sum+')';
      */

    }
    return m;
  }

  getSize(angle, l, r) {
    var m = (r - l) / 2;
    var x = (angle - l);
    var h;

    if (x === m) {
      return this.maxTickSize;
    }
    var d = Math.abs(m - x);
    var v = 70 * Math.sqrt(1 / d);
    if (v > this.maxTickSize) {
      h = this.maxTickSize - d;
    } else {
      h = Math.max(this.tickSize, v);
    }

    if (this.index > this.count) {
      this.index = 0;
    }

    return h;
  }

  getTickPoints(count) {
    var coords = [], step = this.PI / count;
    for (var deg = 0; deg < this.PI; deg += step) {
      var rad = deg * Math.PI / (this.PI / 2);
      coords.push({ x: Math.cos(rad), y: -Math.sin(rad), angle: deg });
    }
    return coords;
  }
}