function SpringSimulator(fps, mass, damping) {

    SimulatorBase.call(this, fps);

    // Simulated values
    this.position = 0;
    this.velocity = 0;

    // Simulation parameters
    this.target = 0;
    this.mass = mass;
    this.damping = damping;
}

SpringSimulator.prototype = Object.create(SimulatorBase.prototype);

/**
 * Advances the simulation by given time step
 * @param {number} timeStep 
 */
SpringSimulator.prototype.simulate = function(timeStep) {
    
    if(timeStep == undefined) console.log('Pass the timeStep!');

    this.generateFrames(timeStep);
    
    // Return values interpolated between cached frames
    this.position = THREE.Math.lerp(this.cache[0].position, this.cache[1].position,  this.offset / this.frameTime);
    this.velocity = THREE.Math.lerp(this.cache[0].velocity, this.cache[1].velocity,  this.offset / this.frameTime);
}

/**
 * Generates frames between last simulation call and the current one
 * @param {timeStep} timeStep 
 */
SpringSimulator.prototype.generateFrames = function(timeStep) {

    // Initialize cache by pushing two frames
    if(this.cache.length == 0) {
        for (var i = 0; i < 2; i++) {
            this.cache.push({
                position: 0,
                velocity: 0
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
SpringSimulator.prototype.getFrame = function() {
    return spring(this.lastFrame().position, this.target, this.lastFrame().velocity, this.mass, this.damping);
}