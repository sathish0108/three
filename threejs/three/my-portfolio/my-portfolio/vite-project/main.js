import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#canvas");
const leftZoomBtn = document.querySelector(".left-box-btn");
const originalBtn = document.querySelector(".original-btn");
const rightZoomBtn = document.querySelector(".right-box-btn");

let scene, camera, renderer;

let rotateAroundGroup = true;

scene = new THREE.Scene();
scene.background = new THREE.Color("#2f2f2f");

// const axesHelper = new THREE.AxesHelper(3);
// scene.add(axesHelper);

camera = new THREE.PerspectiveCamera(
	45,
	canvas.clientWidth / canvas.clientHeight,
	0.1,
	100
);
camera.position.set(0, 0, 15);

const light = new THREE.HemisphereLight(0xffffff, "cornflowerblue", 1);
scene.add(light);

const group = new THREE.Group();

const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial();

const box = new THREE.Mesh(geometry, material);
box.position.set(-4, -1, 2);
group.add(box);

const box2 = new THREE.Mesh(geometry, material);
box2.position.set(4, 3.5, -2);
group.add(box2);

const sphere = new THREE.Mesh(
	new THREE.SphereBufferGeometry(1, 2, 2),
	new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
);
group.add(sphere);

scene.add(group);

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
canvas.appendChild(renderer.domElement);

const zoomInTimeline = (x, y, z, zoomOutFactor = 0) => {
	let tl = gsap
		.timeline({ defaults: { duration: 1.5, ease: "expo.out" } })
		.to(controls.target, { x, y, z })
		.to(camera.position, { x, y, z: z + zoomOutFactor }, 0)
		.to(group.rotation, { x: 0, y: 0 }, 0);
};

leftZoomBtn.addEventListener("click", () => {
	zoomInTimeline(box.position.x, box.position.y, box.position.z, 5);
	rotateAroundGroup = false;
});

originalBtn.addEventListener("click", () => {
	zoomInTimeline(0, 0, 0, 15);
	rotateAroundGroup = true;
});

rightZoomBtn.addEventListener("click", () => {
	zoomInTimeline(box2.position.x, box2.position.y, box2.position.z, 5);
	rotateAroundGroup = false;
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;

const onWindowResize = () => {
	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(canvas.clientWidth, canvas.clientHeight);
};

window.addEventListener("resize", onWindowResize, false);

const clock = new THREE.Clock();

const animate = () => {
	const elapsedTime = clock.getElapsedTime();

	box.rotation.x = elapsedTime;
	box.rotation.y = elapsedTime;
	box.scale.x = Math.sin(elapsedTime) + 2;
	box.scale.y = Math.cos(elapsedTime) + 2;

	box2.rotation.x = elapsedTime * 2;
	box2.rotation.y = elapsedTime * 2;

	if (rotateAroundGroup) {
		group.rotation.y = Math.cos(elapsedTime) * 0.75;
		group.rotation.x = Math.sin(elapsedTime) * 0.5;
	}

	renderer.render(scene, camera);
	requestAnimationFrame(animate);
};

animate();
