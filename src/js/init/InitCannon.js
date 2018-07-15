// Cannon world
physicsWorld.gravity.set(0,-9.81,0);
physicsWorld.broadphase = new CANNON.NaiveBroadphase();
physicsWorld.solver.iterations = 10;

// Ground
addParallelBox(0, new CANNON.Vec3(0, -1, 0), new CANNON.Vec3(5,1,5), 0.3);

// Stuff
addParallelBox(10, new CANNON.Vec3(0, 2, 0), new CANNON.Vec3(1,1,1), 0.3);
addParallelBox(5, new CANNON.Vec3(3, 1, -3), new CANNON.Vec3(0.5,0.5,0.5), 0.3);
addParallelBox(3, new CANNON.Vec3(-2.5, 1, -2.5), new CANNON.Vec3(0.3,0.3,0.3), 0.3);

addParallelSphere(5, new CANNON.Vec3(1.5, 2, 1.5), 0.3, 0.3);
addParallelSphere(5, new CANNON.Vec3(1.5, 2, -1.5), 0.3, 0.3);
addParallelSphere(5, new CANNON.Vec3(-1.5, 2, -1.5), 0.3, 0.3);
addParallelSphere(5, new CANNON.Vec3(-1.5, 2, 1.5), 0.3, 0.3);
addParallelSphere(5, new CANNON.Vec3(0, 2, 1.5), 0.3, 0.3);
addParallelSphere(5, new CANNON.Vec3(0, 2, -1.5), 0.3, 0.3);
addParallelSphere(5, new CANNON.Vec3(1.5, 2, 0), 0.3, 0.3);
addParallelSphere(5, new CANNON.Vec3(-1.5, 2, 0), 0.3, 0.3);

// Update
var physicsFramerate = 1/60;
var physicsMaxPrediction = 100;
function updatePhysics(timeStep) {
    // Step the physics world
    physicsWorld.step(physicsFramerate, timeStep, physicsMaxPrediction);

    // Sync physics/visuals
    parallelPairs.forEach(pair => {

        if(pair.physical.position.y < -1) {	
            pair.physical.position.y = 10;
        }

        if(pair.physical.position.y > 10) {	
            pair.physical.position.y = -1;
        }

        if(pair.physical.position.x > 8) {	
            pair.physical.position.x = -8;
        }

        if(pair.physical.position.x < -8) {	
            pair.physical.position.x = 8;
        }

        if(pair.physical.position.z > 8) {	
            pair.physical.position.z = -8;
        }

        if(pair.physical.position.z < -8) {	
            pair.physical.position.z = 8;
        }

        pair.visual.position.copy(pair.physical.interpolatedPosition);
        pair.visual.quaternion.copy(pair.physical.interpolatedQuaternion);
    });
}	
