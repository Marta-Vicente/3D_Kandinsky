/*global THREE, requestAnimationFrame, console*/
var scene, camera, cameraFrontal, cameraTop, cameraLateral, renderer, cil1, cil2;
var stop = false;
const red = 0xff0000;
const green = 0x00ff00;
const blue = 0x0000ff;
const purple = 0x800080;
const white = 0xffffff;
const pink = 0xff006f;
const cyan = 0x00ffef;
const yellow = 0xffff00;
const orange = 0xff6f00;
const grey = 0xc0c0c0;
const lightspeed = 0xa8e6ff;

var rotate_cube_tie = 0, rotate_ball_tie = 0, rotate_things_tie = 0;
var last_state_space = false;
var last_state_4 = false;
var last_state_5 = false;
var keys_pressed = {};
var colorize = false; var already_col = false;
var axis = false;

class CustomCurve extends THREE.Curve {

	constructor( scale = 1 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {

		const tx = 0;
		const ty = t * 0.2 - 1.5;
		const tz = 0;

		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );

	}

}

function createBall(obj, x, y, z, c, b1, b2, b3, name, nei) {

    'use strict';
    
    obj = new THREE.Object3D();
    obj.userData = { jumping: true, step: 0 };
    
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true });
    var geometry = new THREE.SphereGeometry(b1, b2, b3);
    var mesh = new THREE.Mesh(geometry, material);
    
    obj.add(mesh);
    obj.position.set(x, y, z);
    obj.name = name;
    nei.add(obj);
    return obj;
}

function createHalfSphere(obj, x, y, z, c, radius, widthSeg, heightSeg, phiStart, phiLength, name, nei, rotation) {
    'use strict';

    obj = new THREE.Object3D();
    
    var material = new THREE.MeshBasicMaterial({color : c, wireframe: true, opacity: 0.5, transparent: true});
    var geometry = new THREE.SphereGeometry(radius, widthSeg, heightSeg, phiStart, phiLength, 0, 0.5);
    var mesh = new THREE.Mesh(geometry, material);

    obj.add(mesh);
    obj.position.set(x, y, z);
    obj.name = name;
    obj.rotation.z = rotation;
    obj.rotation.x = (3*Math.PI)/2;
    nei.add(obj);
}

function createCone(obj, x, y, z, c, radius, height, radialSegments, heightSegments, rotation, nei) {

    'use strict';
    obj = new THREE.Object3D();
    var geometry = new THREE.ConeGeometry(radius, height, radialSegments, heightSegments);
    //obj.userData = { jumping: true, step: 0 };
    
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true });
    var mesh = new THREE.Mesh(geometry, material);

    obj.position.set(x, y, z);
    obj.add(mesh);
    obj.rotation.x = rotation;
    //mesh sentido??
    nei.add(obj);
}

function createCylinder(obj, x, y, z, c, sizeBASE, sizeTOP, length, desenty, name, nei) {

    'use strict';
    obj = new THREE.Object3D();
    var geometry = new THREE.CylinderGeometry( sizeBASE, sizeTOP, length, desenty);
    obj.userData = { mov: true, step: 0 };
    
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true});
    material.side = THREE.DoubleSide;
    var mesh = new THREE.Mesh(geometry, material);
    
    
    obj.add(mesh);
    obj.position.set(x, y, z);
    obj.name = name;
    nei.add(obj);
    return obj;
}

function createDonnut(obj, x, y, z, c, radius, tube, radialSegments, tubularSegments, vector, name, nei) {

    'use strict';
    obj = new THREE.Object3D();
    var geometry = new THREE.TorusGeometry( radius, tube, radialSegments, tubularSegments);
    //obj.userData = { jumping: true, step: 0 };
    
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.lookAt(vector);
    obj.add(mesh);
    obj.position.set(x, y, z);
    obj.name = name;
    //mesh sentido
    nei.add(obj);
}

function createBox(obj, x, y, z, c, width, height, depth, name, nei, rotation) {

    'use strict';
    obj = new THREE.Object3D();
    var geometry = new THREE.BoxGeometry(width, height, depth);
    //obj.userData = { jumping: true, step: 0 };
    
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true });
    var mesh = new THREE.Mesh(geometry, material);
    obj.add(mesh);
    obj.rotation.y += rotation;
    obj.position.set(x, y, z);
    obj.name = name;
    //mesh sentido??
    nei.add(obj);
    console.log("BOX :");
    console.log(obj);
    return obj;
}

function createTube(obj, x, y, z, c, path, segments, radius, radialSegments, nei) {

    'use strict';
    obj = new THREE.Object3D();
    var geometry = new THREE.TubeGeometry(path, segments, radius, radialSegments, false);
    //obj.userData = { jumping: true, step: 0 };
    
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true, side: THREE.DoubleSide });
    var mesh = new THREE.Mesh(geometry, material);
    
    obj.add(mesh);
    obj.position.set(x, y, z);
    //mesh sentido??
    nei.add(obj);
}

function createIcosahedron(obj, x, y, z, c, radius, vector, name, nei){

    obj = new THREE.Object3D();
    obj.userData = {step: 0, mov:true};
    var geometry = new THREE.IcosahedronGeometry(radius);
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true });
    var mesh = new THREE.Mesh(geometry, material);

    mesh.lookAt(vector);
    obj.add(mesh);
    obj.position.set(x, y, z);
    obj.name = name;
    nei.add(obj);
}

function createSim(obj, name) {
    'use strict';

    obj = new THREE.Object3D();
    var cube, tor2, tor3, cone, cone2, tube;
    const vec_donut = new THREE.Vector3(0, 10, 0);
    obj.userData = {step: 0, mov: true };

    createBox(cube, 0, 0, 0, cyan, 10, 10, 10, "cubito", obj, 0);
    
    createDonnut(tor2, 0, 5, 0, pink, 10, 1, 20, 20, vec_donut, "", obj);
    createDonnut(tor3, 0, -5, 0, pink, 10, 1, 20, 20, vec_donut, "", obj);
    const path = new CustomCurve( 10 );
    createTube(tube, 0, 14, 0, pink, path, 20, 10, 20, obj);
    createCone(cone, 0, 15, 0, purple, 8, 13, 20, 20, 0, obj);
    createCone(cone2, 0, -15, 0, purple, 8, 13, 20, 20, Math.PI, obj);

    obj.name = name;

    scene.add(obj);
    obj.position.set(0, 70, 0);
    obj.rotation.x = Math.PI/4;
    
}

function createTieFighter(obj, name){

    obj = new THREE.Object3D();
    var esf, box1, box2, window;
    
    esf = createBall(esf,0,0,0, grey, 4, 10, 10,"ball", obj);
    window = createHalfSphere(window, 0,0,0, red, 4.1, 20, 20, 0, (2*Math.PI), "window", obj, Math.PI);
    cil1 = createCylinder(cil1, 4.5,0,0, grey, 1, 1, 2, 10, "cil1", esf);
    cil2 = createCylinder(cil2,-4.5, 0, 0, grey, 1, 1, 2, 10, "cil2", esf);
    cil1.rotation.z += Math.PI/2;
    cil2.rotation.z += Math.PI/2;
    box1 = createBox(box1, 0, -1, 0, grey,15, 15, 1, "box1", cil1, Math.PI/2);
    box1.rotation.y += Math.PI/2;
    box1.rotation.x += Math.PI/2;
    box2 = createBox(box2, 0, 1, 0, grey,15, 15, 1, "box2", cil2, Math.PI/2);
    box2.rotation.y += Math.PI/2;
    box2.rotation.x += Math.PI/2;

    scene.add(obj);
    obj.name = name;
    obj.position.set(80, 40, 0);
}

function createStars(){

    for(var i = 0; i < 100; i++){
        var geometry = new THREE.SphereGeometry(3,30,30);
        var material = new THREE.MeshBasicMaterial({color:white});    
        var mesh  = new THREE.Mesh(geometry, material);
        var newX = Math.floor(Math.random() * 1000) - Math.floor(Math.random()*1000);
        var newY = Math.floor(Math.random() * 1000) - Math.floor(Math.random()*1000);
        var newZ = Math.floor(Math.random() * 1000) - Math.floor(Math.random()*1000);
        mesh.position.x = newX;
        mesh.position.y = newY;
        mesh.position.z = newZ;
        scene.add(mesh);
    };
}

function createLines(){
    for(var i = 0; i < 100; i++){
        var geometry = new THREE.CylinderGeometry(0.3,0.3,10, 20);
        var material = new THREE.MeshBasicMaterial({color:lightspeed});    
        var mesh  = new THREE.Mesh(geometry, material);
        var newX = Math.floor(Math.random() * 1000) - Math.floor(Math.random()*1000);
        var newY = Math.floor(Math.random() * 1000) - Math.floor(Math.random()*1000);
        var newZ = Math.floor(Math.random() * 1000) - Math.floor(Math.random()*1000);
        mesh.position.x = newX;
        mesh.position.y = newY;
        mesh.position.z = newZ;
        Math.floor(Math.random() * 6) + 1
        var angX = Math.floor(Math.floor(Math.random() * Math.PI/2) + 1);
        mesh.rotation.x = angX;
        scene.add(mesh);
    };
}

function createCameraFrontal() {

    'use strict';
    cameraFrontal = new THREE.PerspectiveCamera(70,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);
    cameraFrontal.position.x = 100;
    cameraFrontal.position.y = 100;
    cameraFrontal.position.z = 100;
    cameraFrontal.lookAt(scene.position);
}

function createCameraTop() {

    'use strict';
    cameraTop = new THREE.PerspectiveCamera(70,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);
    cameraTop.position.x = 0;
    cameraTop.position.y = 150;
    cameraTop.position.z = 0;
    cameraTop.lookAt(scene.position);
}

function createCameraLateral() {

    'use strict';
    cameraLateral = new THREE.PerspectiveCamera(70,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);
    cameraLateral.position.x = 150;
    cameraLateral.position.y = 0;
    cameraLateral.position.z = 0;
    cameraLateral.lookAt(scene.position);
}


function createScene() {

    'use strict';
    
    scene = new THREE.Scene();
    
    scene.add(new THREE.AxisHelper(50));

    var ball, donnut, donnut2, box1, box2, box3, box4, iso, iso2, iso3, iso4, cil, sim;
    var cone, cone2, cone3, cone4, cone5, cone6, cone7, cone8, tie_figther;

    createBall(ball, 0, 0, 0, yellow, 20, 30, 30, "ball", scene);

    ball = scene.getObjectByName("ball");
    const vec_donut = new THREE.Vector3(0, 10, 0);
    createDonnut(donnut, 0, 8, 0, orange, 20, 1, 30, 30, vec_donut, "don1", ball);
    donnut = ball.getObjectByName("don1");
    createDonnut(donnut2, 0, -16, 0, orange, 20, 1, 30, 30, vec_donut, "do2", donnut);

    createBox(box1, 40, 0, 0, cyan, 10, 10, 10, "", scene, 0);
    createBox(box2, -40, 0, 0, cyan, 10, 10, 10, "", scene, 0);
    createBox(box3, 0, 0, 40, cyan, 10, 10, 10, "", scene, 0);
    createBox(box4, 0, 0, -40, cyan, 10, 10, 10, "", scene, 0);
    createIcosahedron(iso, 0, 40, 0, pink, 10, vec_donut, "iso", scene);
    createIcosahedron(iso2, 0, -40, 0, pink, 10, vec_donut, "iso_inv", scene);
    createIcosahedron(iso3, 40, 0, 0, pink, 10, vec_donut, "iso2", scene);
    createIcosahedron(iso4, -40, 0, 0, pink, 10, vec_donut, "iso2_inv", scene);
    createCylinder(cil, 0, -70, 0, white, 70, 70, 1, 100, "portal", scene);

    createCone(cone, 40, 10, 0, blue, 10, 10, 15, 15, 0, scene);
    createCone(cone2, 40, -10, 0, blue, 10, 10, 15, 15, Math.PI, scene);

    createCone(cone3, -40, 10, 0, blue, 10, 10, 15, 15, 0, scene);
    createCone(cone4, -40, -10, 0, blue, 10, 10, 15, 15, Math.PI, scene);

    createCone(cone5, 0, 10, 40, blue, 10, 10, 15, 15, 0, scene);
    createCone(cone6, 0, -10, 40, blue, 10, 10, 15, 15, Math.PI, scene);

    createCone(cone7, 0, 10, -40, blue, 10, 10, 15, 15, 0, scene);
    createCone(cone8, 0, -10, -40, blue, 10, 10, 15, 15, Math.PI, scene);

    createSim(sim, "sim");

    createTieFighter(tie_figther, "tie");

    createStars();
    createLines();

}

function onKeyDown() {

    'use strict';

    if(keys_pressed[" "] === true && last_state_space === false){
        stop = !stop;
        last_state_space = true;
    }

    if(keys_pressed[" "] === false && last_state_space === true){
        last_state_space = false;
    }

    if(keys_pressed["1"] === true){
        camera = cameraFrontal;
    }
    if(keys_pressed["2"] === true){
        camera = cameraTop;
    }
    if(keys_pressed["3"] === true){
        camera = cameraLateral;
    }
    if(keys_pressed["4"] === true && last_state_4 === false){
        colorize = !colorize;
        last_state_4 = true;
    }
    if(keys_pressed["4"] === false && last_state_4 === true){
        last_state_4 = false;
    }
    if(keys_pressed["5"] === true && last_state_5 === false){
        axis = !axis;
        last_state_5 = true;
    }
    if(keys_pressed["5"] === false && last_state_5 === true){
        last_state_5 = false;
    }
    if(keys_pressed["arrowleft"] === true){
        var tie = scene.getObjectByName("tie");
        tie.position.x += -1;
    }
    if(keys_pressed["arrowright"] === true){
        var tie = scene.getObjectByName("tie");
        tie.position.x += 1;
    }
    if(keys_pressed["arrowup"] === true){
        var tie = scene.getObjectByName("tie");
        tie.position.y += 1;
    }
    if(keys_pressed["arrowdown"] === true){
        var tie = scene.getObjectByName("tie");
        tie.position.y += -1;
    }
    if(keys_pressed["d"] === true){
        var tie = scene.getObjectByName("tie");
        tie.position.z += 1;
    }
    if(keys_pressed["c"] === true){
        var tie = scene.getObjectByName("tie");
        tie.position.z += -1;
    }
    if (keys_pressed["q"] === true){
        var tie = scene.getObjectByName("tie");
        tie.rotation.y -= 0.1;
    }
    if (keys_pressed["w"] === true){
        var tie = scene.getObjectByName("tie");
        tie.rotation.y += 0.1;
    }
    if (keys_pressed["a"] === true){
        cil1.rotation.x += 0.1;
        cil2.rotation.x += 0.1;
    }
    if (keys_pressed["s"] === true){
        cil1.rotation.x -= 0.1;
        cil2.rotation.x -= 0.1;
    }
    if (keys_pressed["z"] === true){
        var b1 = cil1.getObjectByName("box1");
        b1.rotation.z += 0.1;
        var b2 = cil2.getObjectByName("box2");
        b2.rotation.z += 0.1;
    }
    if (keys_pressed["x"] === true){
        var b1 = cil1.getObjectByName("box1");
        b1.rotation.z -= 0.1;
        var b2 = cil2.getObjectByName("box2");
        b2.rotation.z -= 0.1;
    }
}
function placeKeyInList(e){
    keys_pressed[e.key.toLowerCase()] = e.type === "keydown";
}

function render() {

    'use strict';
    renderer.render(scene, camera);
}

function onResize() {

    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

}

function init() {

    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCameraFrontal();
    createCameraLateral();
    createCameraTop();
    camera = cameraFrontal;
    
    render();
    
    window.addEventListener("keydown", placeKeyInList);
    window.addEventListener("keyup", placeKeyInList);   
    window.addEventListener("resize", onResize(renderer));
}

function update(){

    onKeyDown();

    camera.lookAt(scene.position);

    if(!stop){
        var movingObj = scene.getObjectByName("iso");
        movingObj.userData.step += 0.02;
        movingObj.position.y = 60 * (Math.sin(movingObj.userData.step));
        movingObj.position.z = 60 * Math.cos(movingObj.userData.step);
        movingObj.rotation.y += 0.2;

        var movingObj2 = scene.getObjectByName("iso_inv");
        movingObj2.userData.step += 0.02;
        movingObj2.position.y = -60 * (Math.sin(movingObj.userData.step));
        movingObj2.position.z = -60 * Math.cos(movingObj.userData.step);
        movingObj2.rotation.y += 0.2;

        var movingObj3 = scene.getObjectByName("iso2");
        movingObj3.userData.step += 0.02;
        movingObj3.position.z = 60 * (Math.sin(movingObj.userData.step));
        movingObj3.position.x = 60 * Math.cos(movingObj.userData.step);
        movingObj3.rotation.y += 0.2;

        var movingObj4 = scene.getObjectByName("iso2_inv");
        movingObj4.userData.step += 0.02;
        movingObj4.position.z = -60 * (Math.sin(movingObj.userData.step));
        movingObj4.position.x = -60 * Math.cos(movingObj.userData.step);
        movingObj4.rotation.y += 0.2;

        var movingObj5 = scene.getObjectByName("portal");
        movingObj5.position.y = - 70 + 5 * (Math.cos(movingObj.userData.step));

        var sim = scene.getObjectByName("sim");
        sim.position.x = -60 * (Math.sin(movingObj.userData.step));
        sim.position.y = -60 * (Math.cos(movingObj.userData.step));
        sim.rotation.x = (Math.cos(movingObj.userData.step));
        sim.rotation.y = (Math.sin(movingObj.userData.step));
    }

    if(colorize){
        scene.traverse(function (node) {
            if (node instanceof THREE.Mesh) {
                node.material.wireframe = true;
            }
        });
    }
    if(!colorize){
        scene.traverse(function (node) {
            if (node instanceof THREE.Mesh) {
                node.material.wireframe = false;
            }
        });
    }
    if (axis) {
        scene.traverse(function (node) {
            if (node instanceof THREE.AxisHelper) {
                node.visible = true;
            }
        });
    }
    if (!axis) {
        scene.traverse(function (node) {
            if (node instanceof THREE.AxisHelper) {
                node.visible = false;
            }
        });
    }

    render();
    requestAnimationFrame(update);
}

function playAudio(){
    const btn = document.getElementById('btn');
    let audio = new Audio();
    audio.src = "Star Wars- Battle Over Coruscant Theme - EPIC VERSION.mp3";
    btn.addEventListener('click', function(){
        audio.play();
    });

}
