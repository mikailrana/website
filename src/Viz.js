import React from 'react';
import {Scene,Tracker} from './Scene.js'

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
    let lesser = 190;
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