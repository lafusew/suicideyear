import { LOGS, LOGS_COLORS } from '../constants/logs';
import { Frequencies, FREQUENCIES } from '../types';
import { RealTimeBPMAnalyzer } from 'realtime-bpm-analyzer';

type RealTimeBPMAnalyzerType = typeof RealTimeBPMAnalyzer;

export class Audio {
  private static _: Audio;
  
  analyser: AnalyserNode;

  private track: MediaElementAudioSourceNode;
  private audioElement: HTMLAudioElement;
  
  private audioContext: AudioContext;
  private audioWorkletNode: ScriptProcessorNode;
  private onAudioProcess: RealTimeBPMAnalyzerType;

  private bpm = 0;
  private frequencies: Uint8Array;

  selectedFreq: FREQUENCIES = Frequencies.ALL;

  private isPlaying = false;

  private constructor() {
    console.log(LOGS.CREATING_AUDIO_MODULE_INSTANCE, LOGS_COLORS.ORANGE);
    
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();

    this.audioElement = this.getAudioElement();
    this.track = this.audioContext.createMediaElementSource(this.audioElement);

    this.audioWorkletNode = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    
    this.audioWorkletNode.connect(this.audioContext.destination);
    
    this.track.connect(this.analyser);
    this.track.connect(this.audioWorkletNode);
    
    this.analyser.connect(this.audioContext.destination);
    
    this.onAudioProcess = new RealTimeBPMAnalyzer({
      scriptNode: {
        bufferSize: 4096
      },
      pushTime: 2000,
      pushCallback: (_err: unknown, bpm?: Record<string, number>[]) => {
        if (bpm) {
          this.bpm = bpm[0].tempo;
        }
      }
    }); 
    
    this.frequencies = new Uint8Array(this.analyser.frequencyBinCount);

    this.addEventListeners();

    console.log(LOGS.AUDIO_MODULE_INSTANCE_CREATED, LOGS_COLORS.LIGHT_GREEN);
  }

  public getCurrentPlaybackState() {
    return {
      time: this.audioElement.currentTime,
      isPlaying: this.isPlaying,
    };
  }

  public getVolume(): number {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (const amplitude of dataArray) {
      sum += amplitude * amplitude;
    }
  
    const volume = Math.sqrt(sum / dataArray.length);

    return volume;
  }

  public getWaveform() {
    this.analyser.fftSize = 2048;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);
    
    return dataArray;
  }

  public getBpm() {
    return this.bpm;
  }

  public getFrequencies(type?: FREQUENCIES): Uint8Array{
    this.analyser.fftSize = 4096;

    this.frequencies = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(this.frequencies);

    switch (type || this.selectedFreq) {
    case Frequencies.BASS:
      return this.frequencies.slice(0, 60);
    case Frequencies.MID:
      return this.frequencies.slice(60, 250);
    case Frequencies.HIGH:
      return this.frequencies.slice(250, this.frequencies.length);
    default:
      return this.frequencies;
    }
  }

  private addEventListeners() {
    window.addEventListener('start', () => {
      if (this.isPlaying) {
        this.isPlaying = false;
        this.audioElement.pause();
      } else {
        this.isPlaying = true;
        this.audioElement.play();
      }
    });

    window.addEventListener('reset', () => {
      this.audioElement.currentTime = 0;
    });

    window.addEventListener('selectFreq', ((evt: CustomEvent) => {
      this.selectedFreq = evt.detail;
    }) as EventListener );

    this.audioWorkletNode.onaudioprocess = (e) => {
      this.onAudioProcess.analyze(e);
    };
  }

  private getAudioElement() {
    const audioEl = document.querySelector('audio');
    if (!audioEl) {
      throw new Error('No audio element found');
    }

    return audioEl;
  }

  public static getInstance(): Audio {
    if (!this._) {
      this._ = new Audio();
    }

    return this._;
  }

  public getLows() {
    return this.frequencies.slice(0, 60);
  }

  public getMids() {
    return this.frequencies.slice(60, 250);
  }

  public getHighs() {
    return this.frequencies.slice(250, this.frequencies.length);
  }

  public getAllFreqs() {
    return this.frequencies;
  }
}