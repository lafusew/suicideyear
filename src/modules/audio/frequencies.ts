import { Frequencies } from '../../types';

class FrequenciesAnalyser {
  private static _: FrequenciesAnalyser;
  private analyser: AnalyserNode;
  private data: Uint8Array;
  private selectedFrequencies: Frequencies = Frequencies.ALL;

  private constructor (audioContext: AudioContext, src: MediaElementAudioSourceNode) {
    this.analyser = audioContext.createAnalyser();

    this.analyser.connect(audioContext.destination);
    src.connect(this.analyser);
    
    this.analyser.fftSize = 4096;
    
    this.data = new Uint8Array(this.analyser.frequencyBinCount);

    window.addEventListener('selectFreq', ((evt: CustomEvent) => {
      this.selectedFrequencies = evt.detail;
    }) as EventListener );
  }

  public static instanciate (audioContext: AudioContext, src: MediaElementAudioSourceNode): FrequenciesAnalyser {
    if (!this._) {
      this._ = new FrequenciesAnalyser(audioContext, src);
    }

    return this._;
  }

  private updateFrequencyData (): void {
    this.analyser.getByteFrequencyData(this.data);
  }

  public getFrequencies (): Uint8Array {
    this.updateFrequencyData();

    switch (this.selectedFrequencies) {
    case Frequencies.LOW:
      return this.data.slice(0, 60);
    case Frequencies.MID:
      return this.data.slice(60, 250);
    case Frequencies.HIGH:
      return this.data.slice(250, this.data.length);
    default:
      return this.data;
    }
  }
}

export default FrequenciesAnalyser;