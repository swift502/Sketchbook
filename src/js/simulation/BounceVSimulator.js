function BounceVSimulator(fps, mass, damping) {

    SimulatorBase.call(this, fps);

    // Simulated values
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();

    // Simulation parameters
    this.target = new THREE.Vector3();
    this.mass = mass;
    this.damping = damping;
}

BounceVSimulator.prototype = Object.create(SimulatorBase.prototype);

/**
 * Advances the simulation by given time step
 * @param {number} timeStep 
 */
BounceVSimulator.prototype.simulate = function(timeStep) {
    
    if(timeStep == undefined) console.log('Pass the timeStep!');

    // Generate new frames
    this.generateFrames(timeStep);

    // Return interpolation
    this.position.lerpVectors(this.cache[0].position, this.cache[1].position, this.offset / this.frameTime); 
    this.velocity.lerpVectors(this.cache[0].velocity, this.cache[1].velocity, this.offset / this.frameTime);
}

/**
 * Generates frames between last simulation call and the current one
 * @param {timeStep} timeStep 
 */
BounceVSimulator.prototype.generateFrames = function(timeStep) {

    // Initialize cache by pushing two frames
    if(this.cache.length == 0) {
        for (var i = 0; i < 2; i++) {
            this.cache.push({
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3()
            });
        }
    }

    // Update cache
    // Find out how many frames needs to be generated
    var totalTimeStep = this.offset + timeStep;
    var framesToGenerate = Math.floor(totalTimeStep / this.frameTime);
    this.offset = totalTimeStep % this.frameTime;

    // Generate simulation frames
    if(framesToGenerate > 0) {
        for (var i = 0; i < framesToGenerate; i++) {
            this.cache.push(this.getFrame());
        }
        this.cache = this.cache.slice(-2);
    }
}

/**
 * Gets another simulation frame
 */
BounceVSimulator.prototype.getFrame = function() {
    // Deep clone data from previous frame
    var newBounce = {
        position: this.lastFrame().position.clone(),
        velocity: this.lastFrame().velocity.clone()
    }
    // Calculate new bounce
    bounceV(newBounce.position, this.target, newBounce.velocity, this.mass, this.damping);
    // Return new bounce
    return newBounce;
}