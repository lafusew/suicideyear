import { Inputs } from './modules/inputs';

import './style/style.css';
import Core from './modules/core';

class Rytm {
  tool: Core;
  constructor() {
    this.tool = Core.instanciate(true);
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

new Rytm();

export default Rytm;