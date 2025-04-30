import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
// import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { ShaderPass } from 'three/examples/jsm/Addons.js';
import { RGBShiftShader } from 'three/examples/jsm/Addons.js';
import { gsap } from 'gsap/gsap-core';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z=3.5;

// const loader = new GLTFLoader();
// loader.load('public/DamagedHelmet.gltf', (gltf) => {
//   scene.add(gltf.scene);
// }, undefined, (error) => {
//   console.error('An error occured whie loading the GLTF model:', error)
// })

const renderer = new THREE.WebGLRenderer({
  canvas : document.querySelector("#canvas"),
  antialias: true,
  alpha: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.outputEncoding = THREE.sRGBEncoding

const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.uniforms['amount'].value = 0.001
composer.addPass(rgbShiftPass)

const pmremGenerator = new THREE.PMREMGenerator(renderer)
pmremGenerator.compileEquirectangularShader();

// const controls = new OrbitControls(camera, renderer.domElement)
// controls.enableDamping=true

let model;

new RGBELoader()
.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/pond_bridge_night_4k.hdr', function(texture){
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  // scene.background = envMap;
  scene.environment = envMap;  
  texture.dispose()
  pmremGenerator.dispose() 

  const loader = new GLTFLoader()
  loader.load('./DamagedHelmet.gltf', gltf => {
    model = gltf.scene
    scene.add(model)
  }, undefined, (error) => {
    console.error('An error occured while loading the GLTF model:', error);
  });
});
// const light = new THREE.DirectionalLight(0xffffff, 2);
// light.position.set(50, 50, 50);
// scene.add(light);

window.addEventListener("mousemove", (e) => {
  if(model) {
    const rotationX = (e.clientX / window.innerWidth - .5) * Math.PI;
    const rotationY = (e.clientY / window.innerHeight  - .5) * Math.PI;
    gsap.to(model.rotation, {
      y : rotationX,
      x : rotationY ,
      duration : 0.9,
      ease : "power2.out"                        
    })
  }
})

window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
})

function animate(){
    window.requestAnimationFrame(animate)
    // controls.update();
    // renderer.render(scene, camera);
    composer.render()
}  
animate();