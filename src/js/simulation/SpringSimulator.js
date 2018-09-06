import { SimulatorBase, spring } from './SimulatorBase';
import { Math } from '../lib/core/three';

export class SpringSimulator extends SimulatorBase {

    constructor(fps, mass, damping) {
        
        // Construct base
        super(fps);

        // Simulated values
        this.position = 0;
        this.velocity = 0;
    
        // Simulation parameters
        this.target = 0;
        this.mass = mass;
        this.damping = damping;
    }

    /**
     * Advances the simulation by given time step
     * @param {number} timeStep 
     */
    simulate(timeStep) {
        
        if(timeStep == undefined) console.log('Pass the timeStep!');

        this.generateFrames(timeStep);
        
        // Return values interpolated between cached frames
        this.position = Math.lerp(this.cache[0].position, this.cache[1].position,  this.offset / this.frameTime);
        this.velocity = Math.lerp(this.cache[0].velocity, this.cache[1].velocity,  this.offset / this.frameTime);
    }

    /**
     * Generates frames between last simulation call and the current one
     * @param {timeStep} timeStep 
     */
    generateFrames(timeStep) {

        // Initialize cache by pushing two frames
        if(this.cache.length == 0) {
            for (let i = 0; i < 2; i++) {
                this.cache.push({
                    position: 0,
                    velocity: 0
                });
            }
        }

        // Update cache
        // Find out how many frames needs to be generated
        let totalTimeStep = this.offset + timeStep;
        let framesToGenerate = Math.floor(totalTimeStep / this.frameTime);
        this.offset = totalTimeStep % this.frameTime;

        // Generate simulation frames
        if(framesToGenerate > 0) {
            for (let i = 0; i < framesToGenerate; i++) {
                this.cache.push(this.getFrame());
            }
            this.cache = this.cache.slice(-2);
        }
    }

    /**
     * Gets another simulation frame
     */
    getFrame() {
        return spring(this.lastFrame().position, this.target, this.lastFrame().velocity, this.mass, this.damping);
    }
}