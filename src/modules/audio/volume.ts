class VolumeAnalyser {
  private static _: VolumeAnalyser;
  private data: Uint8Array;
  private analyser: AnalyserNode;

  private constructor(audioContext: AudioContext, src: MediaElementAudioSourceNode) {
    this.analyser = audioContext.createAnalyser();

    this.analyser.connect(audioContext.destination);
    src.connect(this.analyser);

    this.analyser.fftSize = 1024;
    
    this.data = new Uint8Array(this.analyser.frequencyBinCount);
  }

  public static instanciate(audioContext: AudioContext, src: MediaElementAudioSourceNode): VolumeAnalyser {
    if (!this._) {
      this._ = new VolumeAnalyser(audioContext, src);
    }

    return this._;
  }

  public getVolume(): number {
    this.analyser.getByteFrequencyData(this.data);

    let sum = 0;
    for (const amplitude of this.data) {
      sum += amplitude * amplitude;
    }

    return Math.sqrt(sum / this.data.length);
  }
}

export default VolumeAnalyser;