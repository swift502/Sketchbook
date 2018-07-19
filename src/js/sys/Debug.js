

//Simulator debug
// var material = new THREE.LineDashedMaterial({
//     color: 0x000000,
//     dashSize: 0.05,
//     gapSize: 0.01,
// });
// var vertices = [
//     new THREE.Vector3( 0, 0, 0 ),
//     new THREE.Vector3( 0, 1, 0)
// ];
// var lineGeo = new THREE.Geometry().setFromPoints( vertices );
// var line = new THREE.Line( lineGeo, material );
// line.computeLineDistances();
// var Lines = [line, line.clone()];
// scene.add(Lines[0]);
// scene.add(Lines[1]);

// Spring debugs
var sphereGeo = new THREE.SphereGeometry(0.3, 32, 32);
var sphereMat = new THREE.MeshLambertMaterial({
    color: 0xff0000
});
var sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.castShadow = true;
sphere.receiveShadow = true;
sphere.visible = false;
scene.add(sphere);

var sphereGeo2 = new THREE.SphereGeometry(0.3, 32, 32);
var sphereMat2 = new THREE.MeshLambertMaterial({
    color: 0x00ff00
});
var sphere2 = new THREE.Mesh(sphereGeo2, sphereMat2);
sphere2.castShadow = true;
sphere2.receiveShadow = true;
sphere2.visible = false;
scene.add(sphere2);

var sphereGeo3 = new THREE.SphereGeometry(0.3, 32, 32);
var sphereMat3 = new THREE.MeshLambertMaterial({
    color: 0x0000ff
});
var sphere3 = new THREE.Mesh(sphereGeo3, sphereMat3);
sphere3.castShadow = true;
sphere3.receiveShadow = true;
sphere3.visible = false;
scene.add(sphere3);

//ray cast debug
var boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
var boxMat = new THREE.MeshLambertMaterial({
    color: 0xff0000
});
var raycastBox = new THREE.Mesh(boxGeo, boxMat);
raycastBox.castShadow = true;
raycastBox.receiveShadow = true;
raycastBox.visible = false;
scene.add(raycastBox);

bV = new SpringVSimulator(60, 20, 0.98);
bV.target = player.position;

bvx = new SpringSimulator(60, 30, 0.98);
bvz = new SpringSimulator(60, 30, 0.98);

function debugUpdate(timeStep) {

        //SpringV debug
        bV.simulate(timeStep);
        sphere2.position.copy(bV.position);
    
        //Spring debug
        bvx.target = player.position.x;
        bvz.target = player.position.z;
        bvx.simulate(timeStep);
        bvz.simulate(timeStep);
        sphere.position.set(bvx.position, 0, bvz.position);
}