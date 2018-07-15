function SpringRSimulator(fps, mass, damping) {

    SimulatorBase.call(this, fps);

    // Simulated values
    this.position = 0;
    this.velocity = 0;

    // Simulation parameters
    this.target = 0;
    this.mass = mass;
    this.damping = damping;

    // Last lerped position for relative output
    this.lastLerp = 0;
}

SpringRSimulator.prototype = Object.create(SimulatorBase.prototype);

/**
 * Advances the simulation by given time step
 * @param {number} timeStep 
 */
SpringRSimulator.prototype.simulate = function(timeStep) {
    
    if(timeStep == undefined) console.log('Pass the timeStep!');

    this.generateFrames(timeStep);
    
    //SpringR lerping
    // Lerp from 0 to next frame
    var lerp = THREE.Math.lerp(0, this.cache[1].position, this.offset / this.frameTime);
    // Substract last lerp from current to make output relative
    this.position = (lerp - this.lastLerp);
    this.lastLerp = lerp;
    
    this.velocity = THREE.Math.lerp(this.cache[0].velocity, this.cache[1].velocity,  this.offset / this.frameTime);
}

/**
 * Generates frames between last simulation call and the current one
 * @param {timeStep} timeStep 
 */
SpringRSimulator.prototype.generateFrames = function(timeStep) {

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
            this.cache.push(this.getFrame(i + 1 == framesToGenerate));
        }
        this.cache = this.cache.slice(-2);
    }
}

/**
 * Gets another simulation frame
 */
SpringRSimulator.prototype.getFrame = function(lastFrame) {

    var newFrame = Object.assign({}, this.lastFrame());

    if(lastFrame) {
        // Reset position
        newFrame.position = 0;
        // Transition to next frame
        this.lastLerp = this.lastLerp - this.lastFrame().position;
    }

    return spring(newFrame.position, this.target, newFrame.velocity, this.mass, this.damping);
}