physicsWorld = new CANNON.World();
physicsWorld.gravity.set(0,-9.81,0);
physicsWorld.broadphase = new CANNON.NaiveBroadphase();
physicsWorld.solver.iterations = 10;

//Pairs of physical/visual objects
var playerCapsule;
var parallelPairs = [];

function addParallelBox(mass, position, size, friction) {

    var mat = new CANNON.Material();
    mat.friction = friction;

    var shape = new CANNON.Box(size);
    shape.material = mat;

    // Add phys sphere
    physBox = new CANNON.Body({
        mass: mass,
        position: position,
        shape: shape
        });

    physBox.material = mat;
    physicsWorld.addBody(physBox);
    
    // Add visual box
    var geometry = new THREE.BoxGeometry( size.x*2, size.y*2, size.z*2 );
    var material = new THREE.MeshLambertMaterial( { color: 0xcccccc } );
    var visualBox = new THREE.Mesh( geometry, material );
    scene.add( visualBox );

    var pair = {
        physical: physBox,
        visual: visualBox
    };
  
    parallelPairs.push(pair);
    return pair;
}

function addParallelSphere(mass, position, radius, friction) {

    var mat = new CANNON.Material();
    mat.friction = friction;

    var shape = new CANNON.Sphere(radius);
    shape.material = mat;

    // Add phys sphere
    var physSphere = new CANNON.Body({
        mass: mass, // kg
        position: position, // m
        shape: shape
    });
    physSphere.material = mat;
    physicsWorld.addBody(physSphere);
    
    // Add visual sphere
    var geometry2 = new THREE.SphereGeometry(radius);
    var material2 = new THREE.MeshLambertMaterial( { color: 0xcccccc } );
    var visualSphere = new THREE.Mesh( geometry2, material2 );
    scene.add( visualSphere );

    var pair = {
      physical: physSphere,
      visual: visualSphere
    };

    parallelPairs.push(pair);
    return pair;
}

function addParallelCapsule(mass, position, height, radius, segments, friction) {

    var mat = new CANNON.Material();
    mat.friction = friction;

    var physicalCapsule = new CANNON.Body({
        mass: mass,
        position: position
    });

    physicalCapsule.material = mat;
    // Compound shape
    var sphereShape = new CANNON.Sphere(radius);
    var cylinderShape = new CANNON.Cylinder(radius, radius, height / 2, segments);
    cylinderShape.transformAllPoints(new CANNON.Vec3(), new CANNON.Quaternion(0.707,0,0,0.707));

    sphereShape.material = mat;
    cylinderShape.material = mat;

    physicalCapsule.addShape(sphereShape, new CANNON.Vec3( 0, height / 2, 0));
    physicalCapsule.addShape(sphereShape, new CANNON.Vec3( 0, -height / 2, 0));
    physicalCapsule.addShape(cylinderShape, new CANNON.Vec3( 0, 0, 0));
    physicsWorld.addBody(physicalCapsule);

    var visualCapsule = new THREE.Mesh(
        CapsuleGeometry(radius, height, segments).rotateX(Math.PI/2),
        new THREE.MeshLambertMaterial( { color: 0xcccccc, wireframe: true} )
    );
    scene.add(visualCapsule);

    var pair = {
        physical: physicalCapsule,
        visual: visualCapsule
      };

    parallelPairs.push(pair);
    return pair;
}

// Ground
addParallelBox(0, new CANNON.Vec3(0, -1, 0), new CANNON.Vec3(5,1,5), 0.3);

// Stuff
addParallelBox(1, new CANNON.Vec3(0, 6, 0), new CANNON.Vec3(1,1,1), 0.3);
addParallelSphere(5, new CANNON.Vec3(0, 2, 0.1), 0.3, 0.3);

// Player Capsule
var playerMass = 1;
var playerHeight = 0.5;
var playerRadius = 0.25;
var playerSegments = 12;
var playerFriction = 0;
var playerCollisionGroup = 2;
playerCapsule = addParallelCapsule(playerMass, new CANNON.Vec3(1, 1, 1), playerHeight, playerRadius, playerSegments, playerFriction);
playerCapsule.physical.collisionFilterGroup = playerCollisionGroup;
// Fix rotation
playerCapsule.physical.fixedRotation = true;
playerCapsule.physical.updateMassProperties();

var slipperyMaterial = new CANNON.Material();
slipperyMaterial.friction = 0;

playerCapsule.physical.material = slipperyMaterial;
playerCapsule.physical.shapes[0].material = slipperyMaterial;
playerCapsule.physical.shapes[1].material = slipperyMaterial;
playerCapsule.physical.shapes[2].material = slipperyMaterial;
// playerCapsule.physical.linearDamping = 0;


// Add phys ground

// var groundMat = new CANNON.Material();
// groundMat.friction = 0.3;

// groundShape = new CANNON.Plane();
// groundShape.material = groundMat;
// var groundbBody = new CANNON.Body({
//     mass: 0, // mass == 0 makes the body static
//     shape: groundShape
// });
// groundbBody.material = groundMat;
// // groundbBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
// physicsWorld.addBody(groundbBody);

// console.log(playerCapsule);
// console.log(groundbBody);

function updatePhysics(timeStep) {
    // Step the physics world
    physicsWorld.step(1.0/60.0, timeStep, 100);

    parallelPairs.forEach(pair => {
        pair.visual.position.copy(pair.physical.interpolatedPosition);
        pair.visual.quaternion.copy(pair.physical.interpolatedQuaternion);
    });
}