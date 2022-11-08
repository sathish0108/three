import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls.js'
import {Octree} from 'three/examples/jsm/math/Octree.js'
import {Capsule} from 'three/examples/jsm/math/Capsule.js'

console.log(THREE)

const scene = new THREE.Scene()

//geometry
var mesh = new THREE.Mesh();

//light
const ambientLight = new THREE.AmbientLight(0XFAFAD2, 1)
scene.add(ambientLight)

//sizes
const sizes = {

  width: window.innerWidth,
  height: window.innerHeight

}

window.addEventListener('resize',()=>{

  //update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  //update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  //update render
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

})

//renderer
const renderer = new THREE.WebGLRenderer({
  antialias:true
})

document.body.appendChild(renderer.domElement)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

//camera

const camera  = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1 , 100)
camera.rotation.order = 'YXZ'
camera.rotation.set(0,0,0)
//camera.position.set(0,2,2)
scene.add(camera)

//controls
const orbitControl = new OrbitControls(camera, renderer.domElement)
orbitControl.enableDamping = true


//collider
const GRAVITY = 0
let STEPS_PER_FRAME = 5
const worldOctree = new Octree();

			const playerCollider = new Capsule( new THREE.Vector3( 0, 0.35, 0 ), new THREE.Vector3( 0,1.2,0 ), 0.35 );

			const playerVelocity = new THREE.Vector3();
			const playerDirection = new THREE.Vector3();

			let playerOnFloor = false;
			let mouseTime = 0;

			const keyStates = {};

			const vector1 = new THREE.Vector3();
			const vector2 = new THREE.Vector3();
			const vector3 = new THREE.Vector3();

			document.addEventListener( 'keydown', ( event ) => {

				keyStates[ event.code ] = true;

			} );

			document.addEventListener( 'keyup', ( event ) => {

				keyStates[ event.code ] = false;

			} );
      function playerCollisions() {

				const result = worldOctree.capsuleIntersect( playerCollider );

				playerOnFloor = false;

				if ( result ) {

					playerOnFloor = result.normal.y > 0;

					if ( ! playerOnFloor ) {

						playerVelocity.addScaledVector( result.normal, - result.normal.dot( playerVelocity ) );

					}

					playerCollider.translate( result.normal.multiplyScalar( result.depth ) );

				}

			}
      function updateCameraColider( deltaTime ) {

				let damping = Math.exp( - 4 * deltaTime ) - 1;

				if ( ! playerOnFloor ) {

					playerVelocity.y -= GRAVITY * deltaTime;

					// small air resistance
					damping *= 0.1;

				}

				playerVelocity.addScaledVector( playerVelocity, damping );

				const deltaPosition = playerVelocity.clone().multiplyScalar( deltaTime );
				playerCollider.translate( deltaPosition );

				playerCollisions();

				camera.position.copy( playerCollider.end );

			}

			function getForwardVector() {

				camera.getWorldDirection( playerDirection );
				playerDirection.y = 0;
				playerDirection.normalize();

				return playerDirection;

			}

			function getSideVector() {

				camera.getWorldDirection( playerDirection );
				playerDirection.y = 0;
				playerDirection.normalize();
				playerDirection.cross( camera.up );

				return playerDirection;

			}

			function controls( deltaTime ) {

				// gives a bit of air control
				const speedDelta = deltaTime * ( playerOnFloor ? 25 : 8 );

				if ( keyStates[ 'KeyW' ] ) {

					playerVelocity.add( getForwardVector().multiplyScalar( speedDelta ) );

				}

				if ( keyStates[ 'KeyS' ] ) {

					playerVelocity.add( getForwardVector().multiplyScalar( - speedDelta ) );

				}

				if ( keyStates[ 'KeyA' ] ) {

					playerVelocity.add( getSideVector().multiplyScalar( - speedDelta ) );

				}

				if ( keyStates[ 'KeyD' ] ) {

					playerVelocity.add( getSideVector().multiplyScalar( speedDelta ) );

				}

				if ( playerOnFloor ) {

					// if ( keyStates[ 'Space' ] ) {

					// 	playerVelocity.y = 15;

					// }

				}

			}

      function teleportPlayerIfOob() {

				if ( camera.position.y <= - 25 ) {

					playerCollider.start.set( 0, 0.35, 0 );
					playerCollider.end.set( 0, 1, 0 );
					playerCollider.radius = 0.35;
					camera.position.copy( playerCollider.end );
					camera.rotation.set( 0, 0, 0 );

				}

			}



//====================================================
//Keyboard control


//asset loader

const loader = new GLTFLoader();

loader.load('/icons/WCL_1.glb', function(glb){
  const model = glb.scene
  scene.add(model)

  // worldOctree.fromGraphNode(model)

  // model.traverse(child=>{

  //   if(child.material.map){
  //     child.material.map.anisotropy = 4
  //   }
  // })


})


//clock
const clock = new THREE.Clock()


//======================================================================
//Joystick

let fwdValue = 0;
let bkdValue = 0;
let rgtValue = 0;
let lftValue = 0;
let tempVector = new THREE.Vector3();
let upVector = new THREE.Vector3(0, 1, 0);
let joyManager;

function updatePlayer() {
  // move the player
  const angle = orbitControl.getAzimuthalAngle();
  // console.log(`the current azimuth angle is ${angle}`);

  if (fwdValue > 0) {
    tempVector.set(0, 0, -fwdValue).applyAxisAngle(upVector, angle);
    mesh.position.addScaledVector(tempVector, 2);
  }

  if (bkdValue > 0) {
    tempVector.set(0, 0, bkdValue).applyAxisAngle(upVector, angle);
    mesh.position.addScaledVector(tempVector, 1);
  }

  if (lftValue > 0) {
    tempVector.set(-lftValue, 0, 0).applyAxisAngle(upVector, angle);
    mesh.position.addScaledVector(tempVector, 1);
  }

  if (rgtValue > 0) {
    tempVector.set(rgtValue, 0, 0).applyAxisAngle(upVector, angle);
    mesh.position.addScaledVector(tempVector, 1);
  }

  mesh.updateMatrixWorld();

  // controls.target.set(mesh.position.x, mesh.position.y, mesh.position.z);
  // reposition camera
  camera.position.sub(orbitControl.target);
  orbitControl.target.copy(mesh.position);
  // console.log(mesh.position);
  camera.position.add(mesh.position.sub(new THREE.Vector3(0, 0, 0)));
}


function addJoystick(){
  const options = {
       zone: document.getElementById('joystickWrapper1'),
       size: 120,
       multitouch: true,
       maxNumberOfNipples: 2,
       mode: 'static',
       restJoystick: true,
       shape: 'circle',
       // position: { top: 20, left: 20 },
       position: { bottom: '100px', left: '80px' },
       dynamicPage: true,
     }
  
  
 joyManager = nipplejs.create(options);
 
joyManager['0'].on('move', function (evt, data) {
       const forward = (data.vector.y)*0.05
       const turn = (data.vector.x)*0.05

       if (forward > 0) {
         fwdValue = Math.abs(forward)
         bkdValue = 0
       } else if (forward < 0) {
         fwdValue = 0
         bkdValue = Math.abs(forward)
       }

       if (turn > 0) {
         lftValue = 0
         rgtValue = Math.abs(turn)
       } else if (turn < 0) {
         lftValue = Math.abs(turn)
         rgtValue = 0
       }
     })

    joyManager['0'].on('end', function (evt) {
       bkdValue = 0
       fwdValue = 0
       lftValue = 0
       rgtValue = 0
     })
 
}
addJoystick()


const tick = ()=> {

  //clock
  const deltaTime = Math.min( 0.05, clock.getDelta() ) / STEPS_PER_FRAME;

  //first person control
  for (let i=0; i<STEPS_PER_FRAME; i++){
  controls(deltaTime)
  updateCameraColider( deltaTime )
  teleportPlayerIfOob();
  }

  //orbit controls
  orbitControl.update()

  //joystick
  updatePlayer(deltaTime)

  //render
  renderer.render(scene, camera)

  //calling tick again
  window.requestAnimationFrame(tick)
}

tick()

