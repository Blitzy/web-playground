/**
 * For MindAR Three Image Tracking v1.1.0
 */

export interface MindARThreeParams {
  container: HTMLElement;
  imageTargetSrc: string;
  maxTrack?: number;
  captureRegion?: boolean;
  uiLoading?: 'yes' | 'no';
  uiScanning?: 'yes' | 'no';
  uiError?: 'yes' | 'no';
}

interface TargetFoundEvent {
  captureImage: any;
}

export interface Anchor {
  group: THREE.Group;
  targetIndex: number;
  onTargetFound: (event: TargetFoundEvent) => void;
  onTargetLost: () => void;
  css: boolean;
  visible: boolean;
}

export interface Controller {
  processingVideo: boolean;
}

export class MindARThree {

  container: HTMLElement;
  imageTargetSrc: string;
  maxTrack?: number;
  captureRegion?: boolean;
  ui: unknown;

  scene: THREE.Scene;
  cssScene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  cssRenderer: unknown;
  camera: THREE.PerspectiveCamera;
  anchors: Anchor[];
  controller?: Controller;

  constructor({}: MindARThreeParams);

  async start(): Promise<void>;

  stop(): void;

  addAnchor(targetIndex: number): Anchor;

  addCSSAnchor(targetIndex: number): Anchor;

  resize(): void;
}