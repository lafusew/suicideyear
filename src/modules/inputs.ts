import { LOGS, LOGS_COLORS } from '../constants/logs';

export class Inputs {
  private static _: Inputs;
  
  private draggableElement: HTMLElement;
  private draggableHandler: HTMLElement;
  
  private draggableElementBody: HTMLElement;

  private hidderElement: HTMLElement;
  private isHidden: boolean;
  private playToggle = false;

  private constructor() {
    console.log(LOGS.CREATING_INPUTS_MODULE_INSTANCE, LOGS_COLORS.ORANGE);
    
    this.draggableElement = document.querySelector('#rytmTool') as HTMLElement;
    this.draggableHandler = document.querySelector('#rytmTool .rytmHeader') as HTMLElement;
    this.draggableElementBody = document.querySelector('#rytmTool .rytmBody') as HTMLElement;
    this.hidderElement = document.querySelector('#rytmTool #rytmHidderBtn') as HTMLElement;

    this.isHidden = false;

    this.makeItDraggable();
    this.setupListenners();

    console.log(LOGS.INPUTS_MODULE_INSTANCE_CREATED, LOGS_COLORS.LIGHT_GREEN);
  }

  private makeItDraggable(): void {
    const dragMouseDown = (e: MouseEvent) => {
      e = e || window.event;
      e.preventDefault();

      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;

      document.onmousemove = elementDrag;
    };
  
    const elementDrag = (e: MouseEvent) => {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      this.draggableElement.style.top = (this.draggableElement.offsetTop - pos2) + 'px';
      this.draggableElement.style.left = (this.draggableElement.offsetLeft - pos1) + 'px';
    };
  
    const closeDragElement = () => {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    };
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    this.draggableHandler.onmousedown = dragMouseDown;
  }

  private setupListenners(): void {
    const startButton = document.querySelector('#rytmStart');
    if (!startButton) {
      throw new Error('No start button found');
    }

    startButton.addEventListener('click', () => {
      const startEvent = new Event('start');
      window.dispatchEvent(startEvent);
      this.playToggle = !this.playToggle;
      startButton.innerHTML = this.playToggle ? 'Stop' : 'Play';
    });

    const resetButton = document.querySelector('#rytmReset');
    if (!resetButton) {
      throw new Error('No reset button found');
    }

    resetButton.addEventListener('click', () => {
      const resetEvent = new Event('reset');
      window.dispatchEvent(resetEvent);
    });

    this.hidderElement.addEventListener('click', () => {
      this.isHidden = !this.isHidden;
      this.draggableElementBody.classList.toggle('hidden');

      this.hidderElement.innerHTML = this.isHidden ? '++' : '--';
    });

    const select = document.querySelector('select');
    if (!select) {
      throw new Error('No select button found');
    }

    select.addEventListener('change', (e) => {
      const selectEvent = new CustomEvent('selectFreq', { detail: (e.target as HTMLSelectElement).value });
      window.dispatchEvent(selectEvent);
    });
  }

  public static instanciate(): Inputs {
    if (!this._) {
      this._ = new Inputs();
    }

    return this._;
  }
}