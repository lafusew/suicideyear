import { Inputs } from './modules/inputs';
import { GUI } from './modules/gui';
import './style/style.css';
import { Frequencies } from './types';
import * as THREE from 'three';

class Rytm {
  tool: GUI;
  constructor() {
    GUI.appendHTML();

    GUI.instanciate()
      .onFrame();

    Inputs.instanciate();

    this.tool = GUI.instanciate();
  }

  public getData() {
    return {
      lows: this.tool.getFrequencyRange(Frequencies.BASS),
      mids: this.tool.getFrequencyRange(Frequencies.MID),
      highs: this.tool.getFrequencyRange(Frequencies.HIGH),
      volume: this.tool.getVolume(),
      bpm: this.tool.getBpm(),
    };
  }
}

const rytm = new Rytm();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial( { color: 0x000000, side: THREE.DoubleSide, wireframe: true } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const animate = function () {
  requestAnimationFrame( animate );
  
  const data = rytm.getData();

  cube.rotation.z += data.volume / 1000;
  cube.rotation.x += data.volume / 1000;

  cube.scale.x = data.lows.reduce((prev, cur) => prev + cur) / 2000;
  cube.scale.y = data.mids.reduce((prev, cur) => prev + cur) / 10000;

  renderer.render( scene, camera );
  // change background color when volume is high with volume between 0 and 255
  renderer.setClearColor(0x000000 + data.volume * 0x10000); 

  
};

animate();


export default Rytm;