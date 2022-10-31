import { Inputs } from './modules/inputs';

import './style/style.css';
import Core from './modules/core';

interface Config {
  useGUI?: boolean;
  audioSource: string;
}

class Rytm {
  tool: Core;
  constructor(options: Config) {
    const { useGUI = true, audioSource} = options;

    this.tool = Core.instanciate(audioSource, useGUI);
    this.tool.onFrame();

    Inputs.instanciate();
  }

  public getVolume(): number {
    return this.tool.getVolume();
  }

  public getWaveform(): Uint8Array {
    return this.tool.getWaveform();
  }

  public getBpm(): number {
    return this.tool.getBpm();
  }

  public getFrequencies(): Uint8Array {
    return this.tool.getFrequencies();
  }

  public getTime(): number {
    return this.tool.getTime();
  }
}

new Rytm({
  audioSource: 'src/music/midnight.mp3',
});

export default Rytm;