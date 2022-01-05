import THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Sandbox from "../Sandbox";
import { MindARThree } from "../../typings/MindARThree";
import './MindARImageTracking.css';
import foxGlbUrl from './assets/fox.glb';

import markerMind from './assets/lego.mind';
import markerImg from './assets/lego.jpg';

interface MindARBundle {
  three: typeof THREE;
  MindARThree: typeof MindARThree;
}

enum MindARState {
  inactive,
  starting,
  active,
}

function loadMindARBundle(): Promise<MindARBundle> {
  return new Promise<MindARBundle>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mind-ar@1.1.0/dist/mindar-image-three.prod.js';

    script.onload = () => {
      resolve({
        three: (window as any).MINDAR.IMAGE.THREE as typeof THREE,
        MindARThree: (window as any).MINDAR.IMAGE.MindARThree
      })
    }

    script.onerror = (event) => {
      reject(event);
    }

    document.body.appendChild(script);
  });
}

export default class MindARImageTracking extends Sandbox {

  three: typeof THREE;
  mindarBundle: MindARBundle;
  mindarThree: MindARThree;
  mindarState: MindARState = MindARState.inactive;
  startControl: HTMLButtonElement;
  stopControl: HTMLButtonElement;
  foxMixer: THREE.AnimationMixer;
  prevTime: number = Date.now();
  
  loaded: boolean;
  
  async start(): Promise<void> {
    // Setup HTML elements for MindAR.
    const container = document.createElement('div');
    container.id = 'container';
    document.body.appendChild(container);

    const controlGroup = document.createElement('div');
    controlGroup.className = 'control-group';
    document.body.appendChild(controlGroup);

    this.startControl = document.createElement('button');
    this.startControl.textContent = 'START';
    this.startControl.className = 'control-button';
    this.onStartClick = this.onStartClick.bind(this);
    this.startControl.onclick = this.onStartClick;
    controlGroup.appendChild(this.startControl);

    this.stopControl = document.createElement('button');
    this.stopControl.textContent = 'STOP';
    this.stopControl.className = 'control-button';
    this.onStopClick = this.onStopClick.bind(this);
    this.stopControl.onclick = this.onStopClick; 
    controlGroup.appendChild(this.stopControl);

    const imageLink = document.createElement('a');
    imageLink.id = 'image-link';
    imageLink.href = markerImg;
    imageLink.text = 'View marker image';
    document.body.appendChild(imageLink);

    // Load MindAR bundle.
    this.mindarBundle = await loadMindARBundle();
    this.three = this.mindarBundle.three;

    // Initialize MindAR Three.
    this.mindarThree = new this.mindarBundle.MindARThree({
      container,
      imageTargetSrc: markerMind
    });

    // Add light to the scene.
    const skyLight = new this.three.HemisphereLight('#fff', '#444');
    this.mindarThree.scene.add(skyLight);

    // Add anchor object. This anchor object is what MindAR moves around and sets
    // visiblity off for tracked images.
    const anchor = this.mindarThree.addAnchor(0);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(foxGlbUrl, (gltf) => {
      const fox = gltf.scene.children[0];
      anchor.group.add(fox);
      fox.scale.setScalar(0.01);
      fox.rotation.y = Math.PI / 2;
      fox.rotation.z = Math.PI / 2;

      this.foxMixer = new this.three.AnimationMixer(fox);
      this.foxMixer.clipAction(gltf.animations[0]).play();
    });
    
    this.update = this.update.bind(this);
    this.update();

    this.loaded = true;
  }

  onStartClick(): void {
    if (!this.mindarThree) return;

    this.mindarState = MindARState.starting;
    this.mindarThree.start();
  }

  onStopClick(): void {
    if (!this.mindarThree) return;

    this.mindarState = MindARState.inactive;
    this.mindarThree.stop();
    this.mindarThree.renderer.clear();
  }

  update(): void {
    const time = Date.now();

    if (this.mindarThree) {
      // Update control button visiblity.
      const startVisible = (!this.mindarThree.controller || !this.mindarThree.controller.processingVideo) 
                            && this.mindarState === MindARState.inactive
      const stopVisible = this.mindarThree.controller && this.mindarThree.controller.processingVideo;
      this.startControl.hidden = !startVisible;
      this.stopControl.hidden = !stopVisible;

      if (this.mindarThree.controller && this.mindarThree.controller.processingVideo) {
        this.mindarState = MindARState.active;
      }

      // Three render loop.
      if (this.mindarState === MindARState.active) {
        if (this.foxMixer) {
          this.foxMixer.update((time - this.prevTime) * 0.001);
        }
        this.mindarThree.renderer.render(this.mindarThree.scene, this.mindarThree.camera);
      }
    }

    this.prevTime = time;
    requestAnimationFrame(this.update);
  }
}