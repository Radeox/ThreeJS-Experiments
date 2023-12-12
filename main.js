import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
const clock = new THREE.Clock();
const camera = new THREE.PerspectiveCamera(
  75, // FOV
  window.innerWidth / window.innerHeight, // Aspect
  0.1, // Near clipping plane
  1000, // Far clipping plane
);

const renderer = new THREE.WebGLRenderer();

// Set render size
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add soft white light
const light = new THREE.AmbientLight(0x404040, 40);
scene.add(light);

// Add controls
new OrbitControls(camera, renderer.domElement);

// Set background color
scene.background = new THREE.Color(0xf9f9f9);

// Set camera position
camera.position.z = 40;
camera.position.y = 6;

class Animation {
  constructor(scene, animations) {
    this.scene = scene;
    this.animations = animations;
    this.mixer = new THREE.AnimationMixer(scene);
  }

  playAnimation(clip) {
    this.action = this.mixer.clipAction(clip);
    this.action.timeScale = 1;
    this.action.clampWhenFinished = true;
    this.action.setLoop(THREE.LoopOnce);
    this.action.play();
  }

  playAnimationReverse(clip) {
    this.action = this.mixer.clipAction(clip);
    this.action.paused = false;
    this.action.timeScale = -1;
    this.action.setLoop(THREE.LoopOnce);
    this.action.play();
  }

  // Call update in loop
  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}

// Load model
let model;
const loader = new GLTFLoader();

loader.load(
  "public/scene.gltf",
  function (gltf) {
    model = new Animation(gltf.scene, gltf.animations);
    scene.add(gltf.scene);

    model.animations.forEach((clip) => {
      // Create buttons
      const button = document.createElement("button");
      button.textContent = "Explode";
      button.onclick = function () {
        model.playAnimation(clip);
      };

      const buttonReverse = document.createElement("button");
      buttonReverse.textContent = "Collapse";
      buttonReverse.onclick = function () {
        model.playAnimationReverse(clip);
      };

      // Add buttons to ".buttons"
      document.querySelector(".buttons").appendChild(button);
      document.querySelector(".buttons").appendChild(buttonReverse);
    });
  },
  undefined,
  function (error) {
    console.error(error);
  },
);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Make floaty camera effect
  camera.position.y += Math.sin(Date.now() * 0.0005) * 0.01;
  camera.position.x += Math.sin(Date.now() * 0.0005) * 0.01;

  // Update time
  var delta = clock.getDelta();

  // Update model
  if (model) {
    model.update(delta);
  }

  // Render scene
  renderer.render(scene, camera);
}
animate();
