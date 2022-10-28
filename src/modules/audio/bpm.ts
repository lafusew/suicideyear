import { RealTimeBPMAnalyzer } from 'realtime-bpm-analyzer';

type RealTimeBPMAnalyzerType = typeof RealTimeBPMAnalyzer;

class BpmAnalyser {
  private static _: BpmAnalyser;

  private audioContext: AudioContext;
  private audioWorkletNode: ScriptProcessorNode;
  private audioProcess: RealTimeBPMAnalyzerType;

  private bpm = 0;

  private constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;

    this.audioWorkletNode = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.audioWorkletNode.connect(this.audioContext.destination);

    this.audioProcess = new RealTimeBPMAnalyzer({
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

    this.audioWorkletNode.onaudioprocess = (e) => this.audioProcess.analyze(e);
  }

  public getBpm(): number {
    return this.bpm;
  }

  public static instanciate(audioContext: AudioContext, src: MediaElementAudioSourceNode): BpmAnalyser {
    if (!this._) {
      this._ = new BpmAnalyser(audioContext);
      src.connect(this._.audioWorkletNode);
    }

    return this._;
  }
}

export default BpmAnalyser;