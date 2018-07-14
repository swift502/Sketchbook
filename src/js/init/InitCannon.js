// Cannon world
physicsWorld.gravity.set(0,-9.81,0);
physicsWorld.broadphase = new CANNON.NaiveBroadphase();
physicsWorld.solver.iterations = 10;

// Ground
addParallelBox(0, new CANNON.Vec3(0, -1, 0), new CANNON.Vec3(5,1,5), 0.3);

// Stuff
addParallelBox(10, new CANNON.Vec3(0, 6, 0), new CANNON.Vec3(1,1,1), 0.3);
addParallelSphere(5, new CANNON.Vec3(0, 2, 0.1), 0.3, 0.3);

// Update
var physicsFramerate = 1/60;
var physicsMaxPrediction = 100;
function updatePhysics(timeStep) {
    // Step the physics world
    physicsWorld.step(physicsFramerate, timeStep, physicsMaxPrediction);

    // Sync physics/visuals
    parallelPairs.forEach(pair => {
        pair.visual.position.copy(pair.physical.interpolatedPosition);
        pair.visual.quaternion.copy(pair.physical.interpolatedQuaternion);
    });
}
