import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

// Configurations
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(1, 1, 2);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
const timer = new THREE.Timer();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.addEventListener(
  "visibilitychange",
  () => !document.hidden && timer.reset(),
);

// Objects
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

const spotLight = new THREE.SpotLight(0xffffff, 1000, 20, Math.PI / 5);
spotLight.position.set(-5, 10, 5);
scene.add(spotLight);
const SpotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(SpotLightHelper);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshPhongMaterial({
    color: "#ffffff",
  }),
);
scene.add(cube);

// GUI and options
const options = {
  isPlaying: false,
  direction: 1,

  play() {
    this.isPlaying = !this.isPlaying;
    playBtn.name(options.isPlaying ? "Pause" : "Play");
  },
  reset() {
    cube.position.set(0, 0, 0);
  },
};

const gui = new GUI();
gui.title("Options");
const playBtn = gui.add(options, "play").name("Play");
gui.add(options, "reset").name("Reset");

// Time loop
renderer.setAnimationLoop((time) => {
  timer.update(time);

  if (options.isPlaying) {
    cube.position.x += timer.getDelta() * options.direction;

    if (cube.position.x > 3) options.direction = -1;
    if (cube.position.x < -3) options.direction = 1;
  }

  renderer.render(scene, camera);
});
