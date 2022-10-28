class WaveformAnalyser {
  private static _: WaveformAnalyser;
  private data: Uint8Array;
  private analyser: AnalyserNode;

  private constructor(audioContext: AudioContext, src: MediaElementAudioSourceNode) {
    this.analyser = audioContext.createAnalyser();

    this.analyser.connect(audioContext.destination);
    src.connect(this.analyser);
    
    this.analyser.fftSize = 2048;
    
    this.data = new Uint8Array(this.analyser.frequencyBinCount);
  }

  public static instanciate(audioContext: AudioContext, src: MediaElementAudioSourceNode): WaveformAnalyser {
    if (!this._) {
      this._ = new WaveformAnalyser(audioContext, src);
    }

    return this._;
  }

  public getWaveform(): Uint8Array {
    this.analyser.getByteTimeDomainData(this.data);

    return this.data;
  }
}

export default WaveformAnalyser;