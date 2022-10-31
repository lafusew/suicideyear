import { LOGS, LOGS_COLORS } from '../constants/logs';
import { BpmAnalyser, WaveformAnalyser, VolumeAnalyser, FrequenciesAnalyser} from './audio';
import GUI from './gui';

class Core {
  private static _: Core;

  private source: MediaElementAudioSourceNode;
  private audioElement: HTMLAudioElement;
  private audioContext: AudioContext;

  private isPlaying = false;

  private time = 0;
  private deltaTime = 0;

  private bpmAnalyser: BpmAnalyser;
  private waveformAnalyser: WaveformAnalyser; 
  private volumeAnalyser: VolumeAnalyser;
  private frequenciesAnalyser: FrequenciesAnalyser;

  private Gui?: GUI;

  private constructor(props: {
    GUI?: boolean,
    audioSrc: string,
  }) {
    console.log(LOGS.CREATING_AUDIO_MODULE_INSTANCE, LOGS_COLORS.ORANGE);
    
    this.audioElement = this.getAudioElement(props.audioSrc);
    this.audioContext = new AudioContext();
    this.source = this.audioContext.createMediaElementSource(this.audioElement);
    
    this.bpmAnalyser = BpmAnalyser.instanciate(this.audioContext, this.source);
    this.waveformAnalyser = WaveformAnalyser.instanciate(this.audioContext, this.source);
    this.volumeAnalyser = VolumeAnalyser.instanciate(this.audioContext, this.source);
    this.frequenciesAnalyser = FrequenciesAnalyser.instanciate(this.audioContext, this.source);

    this.addEventListeners();

    if (props.GUI) {
      GUI.appendHTML();
      this.Gui = GUI.instanciate();
    }

    console.log(LOGS.AUDIO_MODULE_INSTANCE_CREATED, LOGS_COLORS.LIGHT_GREEN);
  }

  public getTime(): number {
    return this.audioElement.currentTime;
  }

  public getVolume(): number {
    return this.volumeAnalyser.getVolume();
  }

  public getWaveform(): Uint8Array {  
    return this.waveformAnalyser.getWaveform();
  }

  public getBpm(): number {
    return this.bpmAnalyser.getBpm();
  }

  public getFrequencies(): Uint8Array{
    return this.frequenciesAnalyser.getFrequencies();
  }

  public onFrame(): void {
    requestAnimationFrame(this.onFrame.bind(this));

    const currentTime = this.getTime();

    this.deltaTime = currentTime - this.time;
    this.time = currentTime;
    
    if (this.deltaTime < 0.016) {
      return;
    }

    this.Gui?.render({
      time: this.getTime(),
      volume: this.getVolume(),
      waveform: this.getWaveform(),
      bpm: this.getBpm(),
      frequencies: this.getFrequencies(),
    });
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
  }

  private getAudioElement(src: string): HTMLAudioElement {
    // const audio = document.createElement('audio');
    // audio.id = 'rytm-audio';
    // audio.src = src;

    // document.body.append(audio);
    const audio = document.querySelector('#rytm-audio') as HTMLAudioElement;
  
    return audio;
  }

  public static instanciate(audioSrc: string, GUI?: boolean,): Core {
    if (!this._) {
      this._ = new Core({GUI, audioSrc});
    }

    return this._;
  }
}

export default Core;