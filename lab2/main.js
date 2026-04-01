import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

// #region Configurations
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(5, 7, 10);
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
// #endregion

// #region Scene objects
const axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

// const spotLight = new THREE.SpotLight(0xffffff, 1000, 20, Math.PI / 5);
// spotLight.position.set(-5, 10, 5);
// scene.add(spotLight);
// const SpotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(SpotLightHelper);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.5),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
);
scene.add(sphere);
sphere.rotation.order = "YXZ";

const arrowHelper = new THREE.ArrowHelper();
arrowHelper.setColor("red");
arrowHelper.scale.set(5, 1, 5);
sphere.add(arrowHelper);
// #endregion

// #region Options and GUI
const options = {
  isPlaying: false,
  direction: 1,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  horizontalSpeed: 1,
  verticalSpeed: 0,
  acceleration: 0,
  g: 9.8,
  time: 0,

  play() {
    this.isPlaying = !this.isPlaying;
    playBtn.name(options.isPlaying ? "Pause" : "Play");
  },
  reset() {
    sphere.position.set(0, 0, 0);
    sphere.rotation.set(0, 0, 0);
    controllerRotationX.reset();
    controllerRotationY.reset();
    controllerRotationZ.reset();
    this.horizontalSpeed = 1;
    this.verticalSpeed = 0;
    this.acceleration = 0;
    this.g = 9.8;
    this.time = 0;
    contollerTime.reset();

    trajectory = [];
    updateTrajectoryVisualization();
  },
};

const gui = new GUI();
gui.title("Options");
gui.add(sphere.position, "x", -10, 10).decimals(2).listen();
gui.add(sphere.position, "y", -10, 10).decimals(2).listen();
gui.add(sphere.position, "z", -10, 10).decimals(2).listen();
const controllerRotationX = gui
  .add(options, "rotationX", 0, 360)
  .decimals(2)
  .onChange((value) => {
    sphere.rotation.x = THREE.MathUtils.degToRad(value);
  })
  .name("rotation X");
const controllerRotationY = gui
  .add(options, "rotationY", 0, 360)
  .decimals(2)
  .onChange((value) => {
    sphere.rotation.y = THREE.MathUtils.degToRad(value);
  })
  .name("rotation Y");
const controllerRotationZ = gui
  .add(options, "rotationZ", 0, 360)
  .decimals(2)
  .onChange((value) => {
    sphere.rotation.z = THREE.MathUtils.degToRad(value);
  })
  .name("rotation Z");
gui
  .add(options, "horizontalSpeed", -10, 10)
  .name("horizontal speed")
  .decimals(2)
  .listen();
gui
  .add(options, "verticalSpeed", -10, 10)
  .name("vertical speed")
  .decimals(2)
  .listen();
gui.add(options, "acceleration", -10, 10).decimals(2).listen();
gui.add(options, "g", -15, 15).decimals(2).listen();
const contollerTime = gui.add(options, "time").listen().disable().decimals(2);

const playBtn = gui.add(options, "play").name("Play");
gui.add(options, "reset").name("Reset");
// #endregion

// #region Trajectory
let trajectory = [];
let trajectoryLine = null;

const updateTrajectoryVisualization = () => {
  if (trajectoryLine) {
    scene.remove(trajectoryLine);
    trajectoryLine.geometry.dispose();
    trajectoryLine.material.dispose();
  }

  if (trajectory.length > 1) {
    const points = trajectory.map(
      (pos) => new THREE.Vector3(pos.x, pos.y, pos.z),
    );

    trajectoryLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: "red",
        linewidth: 2,
      }),
    );
    scene.add(trajectoryLine);
  }
};
// #endregion

// #region Time loop
renderer.setAnimationLoop((time) => {
  timer.update(time);
  const delta = timer.getDelta();

  if (options.isPlaying) {
    trajectory.push(sphere.position.clone());
    if (trajectory.length % 10 === 0) updateTrajectoryVisualization();

    const direction = new THREE.Vector3();
    sphere.getWorldDirection(direction);
    direction.y = 0;
    // console.log(direction);

    options.horizontalSpeed += options.acceleration * delta;
    sphere.position.addScaledVector(direction, delta * options.horizontalSpeed);

    options.verticalSpeed -= options.g * delta;
    sphere.position.y += options.verticalSpeed * delta;

    options.time += delta;
  }
  renderer.render(scene, camera);
});
// #endregion
