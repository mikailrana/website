import React from 'react';
import {AudioPlayer} from './Player';


export class Scene {

  constructor(player,visualization,canvasRef,minWidth) {
    this.canvasRef = canvasRef;
    this.player = player;
    this.padding = 30;
    this.minSize = minWidth;
    this.optimiseHeight = 800;
    this._inProcess =  false;
    this.scaleCoef = 0.5; //Math.max(0.5, 740 / this.optimiseHeight);
    this.loadingProgress = 0.0;

    this.initHandlers();
    this.visualization = visualization;

    this.visualization.init(this);
    //Tracker.init(this);
    //Controls.init(this);
    player.setScene(this);

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
    this.radius = 33;
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
    if (this.player.currentSongURL === undefined || this.player.paused) {
      setTimeout(() => {
        this.render();
      },1000);
    }
    else {
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
  }

  clear() {
    this.context.save();
    this.context.fillStyle = 'blue';
    //this.context.fillRect(0, 0, this.width, this.height);
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.restore();
  }

  static accelerateInterpolator(x) {
    return x * x;
  }

  static  decelerateInterpolator(x) {
    return 1 - ((1 - x) * (1 - x));
  }


  drawCircle(circle, progress) {
    let ctx = this.context;
    ctx.beginPath();
    var start = Scene.accelerateInterpolator(progress) * circle.speed;
    var end = Scene.decelerateInterpolator(progress) * circle.speed;
    ctx.arc(circle.center.x, circle.center.y, circle.radius, (start - 0.5) * Math.PI, (end - 0.5) * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    //ctx.fill();
    ctx.stroke();
  }

  drawLoadingVisualization() {

    let bigCircle = {
      center: {
        x: this.width/2,
        y: this.width/2
      },
      radius: 50,
      speed: 4
    }

    let smallCirlce = {
      center: {
        x: this.width/2,
        y: this.width/2
      },
      radius: 30,
      speed: 2
    }

    this.drawCircle(bigCircle, this.loadingProgress);
    this.drawCircle(smallCirlce, this.loadingProgress);
    this.loadingProgress += 0.02;
    if (this.loadingProgress > 1) {
      this.loadingProgress = 0.0;
    }
  }

  draw() {

    if (this.player.loading) {
      this.drawLoadingVisualization();
    }
    else if (this.player.playing) {
      this.loadingProgress = 0.0;
      this.visualization.draw(this.context);
    }
    else {

    }

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

export class Tracker {

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