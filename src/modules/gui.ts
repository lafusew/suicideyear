import { LOGS, LOGS_COLORS } from '../constants/logs';
import { Frequencies } from '../types';
import { lerp } from '../utils/math';

const CANVAS_HEIGHT = 255;
const CANVAS_WIDTH = 600;
const HEADER_CANVAS_HEIGHT = 30;
const HEADER_CANVAS_WIDTH = 400;

class GUI {
  private static _: GUI;

  private timingElement: HTMLSpanElement;
  private bpmElement: HTMLSpanElement;

  private mainCanvas: HTMLCanvasElement;
  private mainCtx: CanvasRenderingContext2D;

  private headerCanvas: HTMLCanvasElement;
  private headerCtx: CanvasRenderingContext2D;

  private constructor() {
    console.log(LOGS.CREATING_RENDER_MODULE_INSTANCE, LOGS_COLORS.ORANGE);

    this.timingElement = this.getTimingElement();
    this.bpmElement = this.getBpmElement();

    this.mainCanvas = this.getCanvas('#rytmMainCanvas');
    this.mainCtx = this.mainCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.mainCanvas.width = CANVAS_WIDTH;
    this.mainCanvas.height = CANVAS_HEIGHT;

    this.headerCanvas = this.getCanvas('#rytmHeaderCanvas');
    this.headerCtx = this.headerCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.headerCanvas.width = HEADER_CANVAS_WIDTH;
    this.headerCanvas.height = HEADER_CANVAS_HEIGHT;

    this.drawCenterLine();
    this.addEventListeners();

    console.log(LOGS.RENDER_MODULE_INSTANCE_CREATED, LOGS_COLORS.LIGHT_GREEN);
  }

  public static instanciate(): GUI {
    if (!this._) {
      this._ = new GUI();
    }

    return this._;
  }

  public render(props: {
    time: number;
    bpm: number;
    volume: number;
    frequencies: Uint8Array;
    waveform: Uint8Array;
  }) {
    this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    this.headerCtx.clearRect(0, 0, this.headerCanvas.width, this.headerCanvas.height);

    this.drawTime(props.time);
    this.drawBpm(props.bpm);

    this.drawVolume(props.volume);
    this.drawFrequencies(props.frequencies);
    this.drawWaveform(props.waveform);
  }

  private drawTime(time: number) {
    this.timingElement.innerHTML = this.formatTime(time);
  }

  private drawBpm(bpm: number) {
    if (bpm) {
      this.bpmElement.innerHTML = `${bpm} [${bpm * 2}] BPM`;
    } else {
      this.bpmElement.innerHTML = '... [...] BPM';
    }
  }

  volumeWidth = 0;
  lerpVolumeWidth = 0;
  isVolumeGoingUp = false;
  volumeWidthNoLerp = 0;
  private drawVolume(volume: number) {
    volume = volume * .8;

    this.volumeWidthNoLerp = volume * this.headerCanvas.width / 255 * 2;

    this.isVolumeGoingUp = this.volumeWidthNoLerp > this.volumeWidth;

    this.volumeWidth = lerp(this.volumeWidth, this.volumeWidthNoLerp, 0.5);
    
    this.lerpVolumeWidth = (this.isVolumeGoingUp && this.volumeWidth > this.lerpVolumeWidth) ?
      this.volumeWidth :
      lerp(this.lerpVolumeWidth, this.volumeWidth, 0.2);

    this.headerCtx.fillStyle = 'rgb(79, 0, 168)';
    this.headerCtx.fillRect(0, 0, this.lerpVolumeWidth, 30);

    this.headerCtx.fillStyle = 'rgb(116, 0, 249)';
    this.headerCtx.fillRect(0, 0, this.volumeWidth, 30);
  }

  private drawFrequencies(frequencies: Uint8Array) {
    const barWidth = this.mainCanvas.width / frequencies.length * 1.4;

    for (let i = 0; i < frequencies.length; i++) {
      const barHeight = frequencies[i] * .8;
      const x = barWidth * i;
      const y = (this.mainCanvas.height / 2) - .5 * barHeight;

      const light = Math.floor(barHeight * 100 / 255) * 1.4;

      this.mainCtx.fillStyle = `hsl(268, 100%, ${light > 30 ? light : 30}%)`;

      this.mainCtx.fillRect(x, y, barWidth, barHeight);
    }

    this.drawCenterLine();
  }

  private drawCenterLine(canvas = this.mainCanvas, ctx = this.mainCtx, dashed = true) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();

    if (dashed) {
      ctx.setLineDash([5, 5]);
    }

    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  private drawWaveform(waveform: Uint8Array) {
    const WAVE_FORM_HEIGHT = 30;

    const sliceWidth = this.headerCanvas.width / waveform.length;
    let x = 0;

    this.headerCtx.lineWidth = 1;
    this.headerCtx.strokeStyle = 'rgb(255, 255, 255)';
    this.headerCtx.beginPath();

    for (let i = 0; i < waveform.length; i++) {
      const v = waveform[i] / 128.0;
      const y = v * (WAVE_FORM_HEIGHT / 2);
    
      if (i === 0) {
        this.headerCtx.moveTo(x, y);
      } else {
        this.headerCtx.lineTo(x, y);
      }
    
      x += sliceWidth;
    }

    this.headerCtx.lineTo(this.headerCanvas.width, WAVE_FORM_HEIGHT / 2);
    this.headerCtx.stroke();
  }    

  private formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);
    const milliseconds = Math.floor((time - minutes * 60 - seconds) * 100);

    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
    const millisecondsStr = milliseconds < 10 ? `0${milliseconds}` : milliseconds;

    return `${minutesStr}:${secondsStr}:${millisecondsStr}`; 
  }

  private getTimingElement() {
    if (this.timingElement) {
      return this.timingElement;
    }

    const timingEl = document.querySelector('#rytmTiming');
    if (!timingEl) {
      throw new Error('No timing element found');
    }

    return timingEl as HTMLSpanElement;
  }

  private getBpmElement() {
    const bpmEl = document.querySelector('#rytmBpm');
    if (!bpmEl) {
      throw new Error('No bpm element found');
    }

    return bpmEl as HTMLSpanElement;
  }

  private getCanvas(selector: string) {
    let canvas = document.querySelector(selector) as HTMLCanvasElement | null;
    if (!canvas) {
      canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
    }

    return canvas as HTMLCanvasElement;
  }

  private addEventListeners() {
    window.addEventListener('reset', this.resetGUI.bind(this));
  }

  private resetGUI() {
    this.timingElement.innerHTML = '00:00:00';
    this.bpmElement.innerHTML = '';
    this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
    this.headerCtx.clearRect(0, 0, this.headerCanvas.width, this.headerCanvas.height);
    this.drawCenterLine(this.mainCanvas, this.mainCtx, true);
    this.drawCenterLine(this.headerCanvas, this.headerCtx, false);
  }

  public static appendHTML() {
    const html = `
    <div id="rytmTool">
      <div class="rytmHeader">
        <span>RYTM</span>
        <canvas id="rytmHeaderCanvas" style="width: 400px; height: 30px;"></canvas>
        <span id="rytmHidderBtn">--</span>
      </div>
      <div class="rytmBody">
        <div class="rytmBodyHeader">
          <div class="rytmBtnContainer">
            <button id="rytmStart">Play</button>
            <button id="rytmReset">Reset</button>
            <select selected="ALL">
              <option value="${Frequencies.ALL}">${Frequencies.ALL}</option>
              <option value="${Frequencies.LOW}">${Frequencies.LOW}</option>
              <option value="${Frequencies.MID}">${Frequencies.MID}</option>
              <option value="${Frequencies.HIGH}">${Frequencies.HIGH}</option>
            </select>
          </div>
          <span id="rytmBpm">BPM</span>
          <span id="rytmTiming">00:00:00</span>
        </div>
        <canvas id="rytmMainCanvas" style="width:600px; height: 255px"></canvas>
      </div>
    </div>
    `;

    document.body.innerHTML += html;
  }
}

export default GUI;