import React from 'react';

export class AudioPlayer  {

  static AudioPlayerId="AudioPlayer_AudioObject";

  constructor(props) {
    this.props = (props !== undefined) ? props : {};
    this.enableAudioContext = (this.props.enableAudioContext !== undefined && this.props.enableAudioContext)
    this.decodeAudioBroken = (this.props.decodeAudioBroken !== undefined && this.props.decodeAudioBroken)
    this.audioObjectRef = React.createRef();
    this.context=undefined;
    this.scriptNode=undefined;
    this.analyser=undefined;
    this.source=undefined;
    this.bufferLength=undefined;
    this.dataArray=undefined;
    this.firstLaunch=true;
    this.decodedBuffer=undefined;
    this.currentSongURL=undefined;
    this.loading=false;
    this.paused=false;
    this.playing=false;
    this.activeRequest=undefined;
    this.playerStateCallback = undefined;
    this.frequencyData = undefined;
    this.scene = undefined;
    this.audioPlaysCounter = 0;
  }

  init() {

    if (!this.enableAudioContext || this.decodeAudioBroken) {
      this.initAudioObject();
    }
    if (this.enableAudioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      // create audio context ... has to be via onclick event
      this.context = new AudioContext({ latencyHint: "playback" });
      this.context.resume();
      //create analyser node
      this.analyser = this.context.createAnalyser();
      this.gainNode = this.context.createGain();


      // create buffer source object
      if (this.decodeAudioBroken) {
        if (this.audioObject !== null) {
          this.source = this.context.createMediaElementSource(this.audioObjectRef.current);
          //create analyser node
          this.analyser = this.context.createAnalyser();
          // connect source to analyzer
          this.source.connect(this.analyser);
          this.source.connect(this.gainNode);
          this.gainNode.connect(this.analyser);
          // connect analyser to output
          this.gainNode.connect(this.context.destination);
        }
      }
    }
    this.firstLaunch = false;
  }

  initAudioObject() {
    let audio = this.audioObjectRef.current;
    // When enough of the file has downloaded to start playing
    audio.addEventListener('canplay', (e) => {
      console.log('canplay');
      this.loading = false;
      this.playing = true;
      if (this.playerStateCallback !== undefined) {
        this.playerStateCallback("playing",this.currentSongURL);
      }
      this.props.onCanPlay && this.props.onCanPlay(e)
    })
    // When enough of the file has downloaded to play the entire file
    audio.addEventListener('canplaythrough', (e) => {
      console.log('canplaythrough');
      this.props.onCanPlayThrough && this.props.onCanPlayThrough(e)
    })
    // When audio play starts
    audio.addEventListener('play', this.handlePlay)

    // When unloading the audio player (switching to another src)
    audio.addEventListener('abort', this.handleAbort)

    // When the file has finished playing to the end
    audio.addEventListener('ended', this.handleEnded)

    // When the media has enough data to start playing, after the play event, but also when recovering from being
    // stalled, when looping media restarts, and after seeked, if it was playing before seeking.
    audio.addEventListener('playing', (e) => {
      this.props.onPlaying && this.props.onPlaying(e)
    })

    // When a seek operation begins
    audio.addEventListener('seeking', (e) => {
      this.props.onSeeking && this.props.onSeeking(e)
    })

    // when a seek operation completes
    audio.addEventListener('seeked', (e) => {
      this.props.onSeeked && this.props.onSeeked(e)
    })
    // when the requested operation (such as playback) is delayed pending the completion of another operation (such as
    // a seek).
    audio.addEventListener('waiting', (e) => {
      this.props.onWaiting && this.props.onWaiting(e)
    })

    // The media has become empty; for example, this event is sent if the media has already been loaded (or partially
    // loaded), and the load() method is called to reload it.
    audio.addEventListener('emptied', (e) => {
      this.props.onEmptied && this.props.onEmptied(e)
    })

    // when the user agent is trying to fetch media data, but data is unexpectedly not forthcoming
    audio.addEventListener('stalled', (e) => {
      this.props.onStalled && this.props.onStalled(e)
    })

    // when loading of the media is suspended; this may happen either because the download has completed or because it
    // has been paused for any other reason
    audio.addEventListener('suspend', (e) => {
      this.props.onSuspend && this.props.onSuspend(e)
    })

    //  when loading of the media begins
    audio.addEventListener('loadstart', (e) => {
      if (this.playerStateCallback !== undefined) {
        this.playerStateCallback("loading",this.currentSongURL);
      }

      this.props.onLoadStart && this.props.onLoadStart(e)
    })

    // when media's metadata has finished loading; all attributes now contain as much useful information as they're
    // going to
    audio.addEventListener('loadedmetadata', (e) => {
      this.props.onLoadedMetaData && this.props.onLoadedMetaData(e)
    })

    // when the first frame of the media has finished loading.
    audio.addEventListener('loadeddata', (e) => {
      this.props.onLoadedData && this.props.onLoadedData(e)
    })

    // When the user pauses playback
    audio.addEventListener('pause', this.handlePause)

    let listenerInterval = (this.props.listenInterval !== undefined)?this.props.listenInterval:1000;
    audio.addEventListener(
      'timeupdate',
      this.throttle((e) => {
        this.props.onListen && this.props.onListen(e)
      }, listenerInterval )
    )

    audio.addEventListener('volumechange', (e) => {
      this.props.onVolumeChange && this.props.onVolumeChange(e)
    })
  }

  setScene(scene) {
    this.scene = scene;
  }

  handlePlay = (e) => {
    console.log('handlePlay');
    this.props.forceUpdate && this.props.forceUpdate();
    this.props.onPlay && this.props.onPlay(e)
  }

  handlePause = (e) => {
    console.log('handlePause');
    if (!this.audioObjectRef.current) return
    this.props.forceUpdate && this.props.forceUpdate();
    this.props.onPause && this.props.onPause(e)
  }

  handleEnded = (e) => {
    console.log('handleEnded');
    if (!this.audioObjectRef.current) return
    this.audioObjectRef.current.src = "";
    // Remove forceUpdate when stop supporting IE 11
    this.playbackStopped(undefined);
    this.props.forceUpdate && this.props.forceUpdate();
    this.props.onEnded && this.props.onEnded(e)
  }

  getFrequencyData() {
    if (this.enableAudioContext && this.frequencyData !== undefined) {
      this.analyser.getByteFrequencyData(this.frequencyData);
    }
    return this.frequencyData;
  }


  playbackStopped(source) {
    if (source === undefined || this.source === source) {
      console.log("playbackStopped:" + source);
      // reset visualization
      this.loading = false;
      this.playing = false;
      if (this.playerStateCallback !== undefined) {
        this.playerStateCallback("stopped",this.currentSongURL)
      }
      this.currentSongURL = undefined;
    }
    else {
      console.log({current:this.source, source})
    }
  }

  renderAudioElement() {
    if (!this.enableAudioContext || this.decodeAudioBroken) {
      return (
        <audio
          id = {this.audioPlaysCounter}
          src={this.currentSongURL}
          controls={false}
          loop={false}
          autoPlay={true}
          crossOrigin={"anonymous"}
          ref={this.audioObjectRef}
          preload={"auto"}
        > </audio>
      )
    }
    return null;
  }

  playAudioElementSource(url) {
    this.audioPlaysCounter++;
    this.audioObjectRef.current  && this.audioObjectRef.current.pause();

    // this.audioObject.src = url;

    //this.source.buffer = buffer;
    this.loading = true;

    // enable freqdata buffer
    if (this.enableAudioContext && this.decodeAudioBroken){
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    }
    if (this.enableAudioContext) {
      this.context.resume();
    }

    // hack for now
  }

  throttle(func, limit) {
    let inThrottle = false
    return (arg) => {
      if (!inThrottle) {
        func(arg)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }

  playSoundBuffer(buffer) {
    if (this.enableAudioContext) {
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      // create buffer source object
      this.source = this.context.createBufferSource();
      this.source.buffer = buffer;
      this.loading = false;
      this.playing = true;
      if (this.playerStateCallback !== undefined) {
        this.playerStateCallback("playing",this.currentSongURL);
      }
      let source = this.source;
      this.source.onended = () => this.playbackStopped(source);
      this.source.start();
      this.destination = this.context.destination;
      this.source.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.gainNode.connect(this.destination);
      this.context.resume();
    }
  }

  stop() {
    if (this.enableAudioContext && !this.decodeAudioBroken) {
      if (this.source !== undefined) {
        this.source.stop();
        this.source.disconnect(this.gainNode);
        this.source = undefined;
      }
      this.context.suspend();
      if (this.activeRequest !== undefined) {
        this.activeRequest.abort();
        this.activeRequest = undefined;
      }
      this.playing = false;
      this.loading = false;
      if (this.playerStateCallback !== undefined) {
        this.playerStateCallback("stopped",this.currentSongURL)
      }
    }
    else {
      if (this.audioObjectRef.current !== null) {
        this.audioObjectRef.current.pause();
      }
    }
    this.currentSongURL = undefined;
    this.frequencyData = undefined;
  }

  playSong(url,audioElementRef)  {
    if (this.firstLaunch) {
      this.init();
    }
    this.stop();

    this.currentSongURL = url;

    if (this.enableAudioContext && !this.decodeAudioBroken) {
      this.loading = true;
      if (this.playerStateCallback !== undefined) {
        this.playerStateCallback("loading",this.currentSongURL);
      }
      this.activeRequest = new XMLHttpRequest();
      this.activeRequest.open('GET', url, true);
      this.activeRequest.responseType = 'arraybuffer';
      this.activeRequest.onload = () => {
        console.log("onload");
        this.context.decodeAudioData(this.activeRequest.response, (buffer) => {
          this.decodedBuffer = buffer;
          this.playSoundBuffer(this.decodedBuffer);
        });
      };
      let request = this.activeRequest;
      this.activeRequest.onerror = () => {
        // If failed
        console.log(request);
        this.stop();
      }
      this.activeRequest.send();
    }
    else {
      this.playAudioElementSource(url);
    }
    this.paused = false;
  }

  pauseSong() {
    if (this.playing) {
      this.paused = true;
      if (this.audioObjectRef.current !== null ) {
        this.audioObjectRef.current.pause();
      }
      if (this.enableAudioContext && !this.decodeAudioBroken){
        this.context.suspend();
      }
      if (this.playerStateCallback !== undefined) {
        this.playerStateCallback("paused",this.currentSongURL);
      }
    }
  }

  resumeSong() {
    if (this.playing) {
      this.paused = false;
      if (this.audioObjectRef.current !== null) {
        this.audioObjectRef.current.play();
      }
      if (this.enableAudioContext) {
        this.context.resume();
      }
      if (this.playerStateCallback !== undefined) {
        this.playerStateCallback("playing",this.currentSongURL);
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