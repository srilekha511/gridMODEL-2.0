import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const socket = io();
const scene = new THREE.Scene();
const PI = 3.14159265

const renderer = new THREE.WebGLRenderer();
document.body.appendChild( renderer.domElement );

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);

var width  = window.innerWidth,
	height = window.innerHeight;

var radius  = 0.5,
  segments = 64,
	rotation = 6;  

var date=0;
socket.emit("timeQuery", {date: date});

document.getElementById("submit").onclick = formSubmit;

function formSubmit(){
  date = document.getElementById("days").value;
  if(isNaN(parseInt(date))){
    window.alert("Please input a number")
  }else if(parseInt(date)<0 || parseInt(date)>366){
    window.alert("Please input a day within the next year")
  }else{
    socket.emit("timeQuery", {date: date});
  }
}

var anomalies=[];

var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
camera.position.z = 1.5;

var light = new THREE.AmbientLight(0xffffff, 1);
light.position.set(5,3,5);
scene.add(light);

var sphere;

var clouds = createClouds(radius, segments);
clouds.rotation.y = rotation;
scene.add(clouds)

var colors = createColors(radius, segments);
scene.add(colors)

var stars = createStars(90, 64);
scene.add(stars);

const controls = new THREE.TrackballControls(camera, renderer.domElement)

const raycaster = new THREE.Raycaster();
var intersects;

var longs = []
for(let i=0; i<35; i++){
  longs.push(-82.5+5*i)
}

function getRange(i){
  for(let x=0; x<35; x++){
    if(longs[x]>i){
      return x-1;
    }
  }
  return 34;
}

document.addEventListener( 'click', function () {
  const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  }
  raycaster.setFromCamera( mouse, camera ); 
  intersects = raycaster.intersectObject(sphere);
  if(intersects.length>0){
    let temp = intersects[0].point
    temp.multiplyScalar(2)
    const xz = new THREE.Vector2(temp.x,temp.z);
    xz.normalize();
    let lat = 360*Math.atan(xz.x/xz.y)/(2*PI)
    let long = 360*Math.asin(temp.y)/(2*PI)
    let r = getRange(long);
    window.alert("Latitude: " + lat + ", Longitude: " + long + ", Anomaly: " + anomalies[r])
  }
});

socket.on("timeResponse", (data) => {
  anomalies = data.anomalies
});

function update() {
  colors.material.opacity=(date/1000);
  // console.log(colors);
  sphere.rotation.y = 0;
	colors.rotation.y = sphere.rotation.y;		
  clouds.rotation.y += 0.0002;
  clouds.rotation.x += 0.0001;
  clouds.rotation.z += 0.0003;
  controls.update();
  renderer.render( scene, camera );
  // console.log(anomalies)
  requestAnimationFrame(update);
}

sphere = createSphere(radius, segments);
sphere.rotation.y = rotation; 
scene.add(sphere)
window.requestAnimationFrame(update)

function createSphere(radius, segments) {
	return new THREE.Mesh(
		new THREE.SphereGeometry(radius, segments, segments),
		new THREE.MeshPhongMaterial({
			map: new THREE.TextureLoader().load( "images/2_no_clouds_4k.png"),
			bumpMap: new THREE.TextureLoader().load( 'images/elev_bump_4k.jpg'),
			bumpScale: 0.005,
			specularMap: new THREE.TextureLoader().load('images/water_4k.png'),
			specular: new THREE.Color('grey')								
		})
	);
}

function createClouds(radius, segments) {
	return new THREE.Mesh(
		new THREE.SphereGeometry(radius + 0.003, segments, segments),			
		new THREE.MeshPhongMaterial({
			map: new THREE.TextureLoader().load( 'images/fair_clouds_4k.png'),
			transparent: true
		})
	);		
}

function createColors(radius, segments) {
	return new THREE.Mesh(
		new THREE.SphereGeometry(radius + 0.005, segments, segments),			
		new THREE.MeshPhongMaterial({
			map: new THREE.TextureLoader().load( 'images/colorGradient.png'),
			transparent: true,
		})
	);
}


function createStars(radius, segments) {
	return new THREE.Mesh(
		new THREE.SphereGeometry(radius, segments, segments), 
		new THREE.MeshBasicMaterial({
			map: new THREE.TextureLoader().load( 'images/galaxy_starfield.png'), 
			side: THREE.BackSide
		})
	);
}