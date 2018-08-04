

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


//
//
// Cloth debug
//
//

var clothMesh;
var chains = 10;
var chainLength = 2;
var clothNodes = [];
var restDistance = 0.3;

loader.load(AP_MODELS + 'SkirtTest.fbx', function ( object ) {

    var particles = createArray(chains, chainLength);
    var nodes = createArray(chains, chainLength);

    object.translateZ(2);
    object.translateX(-0.5);
    object.rotateY(0.5);

    object.traverse( function ( child ) {
        
        for(var i = 0; i < chains; i++) {
            for(var j = 0; j < chainLength; j++) {
                if ( child.name == "Bone_"+i+"_"+j ) {
                    console.log(child);
                    var node = addClothNode(child);
                    nodes[i][j] = node;
                    particles[i][j] = node.particle;
                }
                if ( child.name == "Bone_"+i+"_"+(chainLength-1)+"_end" ) {
                    
                    // THREE.SceneUtils.detach( child, child.parent, scene );
                    // particles[i][chainLength] = createClothParticle(child.position, 0xcc0000);
                }
            }
        }
    } );

    for(var i = 0; i < chains - 1; i++) {
        for(var j = 0; j < chainLength + 1; j++) {
            var p1 = particles[i][j];
            var p2 = particles[i+1][j];

            var distance = p1.position.distanceTo(p2.position);
            physicsWorld.addConstraint(new CANNON.DistanceConstraint(p1, p2, distance));
        }
    }
    
    for(var i = 0; i < chains - 1; i++) {
        for(var j = 0; j < chainLength; j++) {
            nodes[i][j].lookParticle = particles[i][j+1];
        }
    }

    console.log(particles);

    scene.add( object );
    clothMesh = object;
});


function addClothNode(bone) {

    // var worldPos = new THREE.Vector3();
    // bone.getWorldPosition(worldPos);
    // var particle = createClothParticle(worldPos);
    
    // var secondBone = bone.clone();
    // console.log(bone.parent);
    var group = new THREE.Group();
    // group.parent = bone;
    
    // THREE.SceneUtils.detach( group, bone.parent, scene );
    group.applyMatrix(bone.matrixWorld);
    // group.applyMatrix(bone.parent.matrixWorld);
    // console.log(bone);
    // group.position.copy(group.position);

    
    var particle = createClothParticle(group.position, 0x66ff33);
    
    var node = new ClothBone(particle, bone);
    node.originalPosition.copy(bone.position);
    node.originalQuaternion.copy(bone.quaternion);
    clothNodes.push(node);

    return node;
}

function createClothParticle(position, color) {

    var particle = new CANNON.Body({
        mass: 1
    });
    particle.addShape(new CANNON.Particle());
    particle.linearDamping = 0.5;

    particle.position.set(
        position.x,
        position.y,
        position.z
    );

    particle.preStep = function() {
        
    }

    physicsWorld.addBody(particle);
    
    // Add visual sphere
    var geometry = new THREE.SphereGeometry(0.02);
    var material = new THREE.MeshLambertMaterial( { color: color } );
    var visualSphere = new THREE.Mesh( geometry, material );
    scene.add( visualSphere );

    var pair = {
        physical: particle,
        visual: visualSphere
    };
  
    parallelPairs.push(pair);

    return particle;
}

function ClothBone(particle, bone) {
    this.particle = particle;
    this.bone = bone;
    this.parent = bone.parent;
    this.lookParticle = null;
    this.originalPosition = new THREE.Vector3();
    this.originalQuaternion = new THREE.Quaternion();
    this.physicsEffect = 1;
}

ClothBone.prototype.update = function() {

    // if(this.bone != undefined) {


        
        this.bone.position.copy(this.particle.position);
    
    // }
}

// Cloth
// var particles = [];

//     // Materials
//     var clothMaterial = new CANNON.Material();
//     // Create cannon particles
//     for ( var i = 0; i < chains; i++ ) {
//         particles.push([]);
//         for ( var j = 0; j < chainLength + 1; j++ ) {
//             var idx = j*(Nx+1) + i;
//             var p = clothFunction(i/(Nx+1), j/(Ny+1));
//             var particle = new CANNON.Body({
//                 mass: j==Ny ? 0 : mass
//             });
//             particle.addShape(new CANNON.Particle());
//             particle.linearDamping = 0.5;
//             particle.position.set(
//                 p.x,
//                 p.y-Ny * 0.9 * restDistance,
//                 p.z
//             );
//             particles[i].push(particle);
//             world.addBody(particle);
//             particle.velocity.set(0,0,-0.1*(Ny-j));
//         }
//     }
//     function connect(i1,j1,i2,j2){
//         world.addConstraint( new CANNON.DistanceConstraint(particles[i1][j1],particles[i2][j2],restDistance) );
//     }
//     for(var i=0; i<Nx+1; i++){
//         for(var j=0; j<Ny+1; j++){
//             if(i<Nx) connect(i,j,i+1,j);
//             if(j<Ny) connect(i,j,i,j+1);
//         }
//     }