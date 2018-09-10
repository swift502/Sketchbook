import * as THREE from 'three';
import { SimulatorBase, spring } from './SimulatorBase';

export class RelativeSpringSimulator extends SimulatorBase {

    constructor(fps, mass, damping) {

        //Construct base
        super(fps);

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

    /**
     * Advances the simulation by given time step
     * @param {number} timeStep 
     */
    simulate(timeStep) {
        
        if(timeStep == undefined) console.log('Pass the timeStep!');

        this.generateFrames(timeStep);
        
        //SpringR lerping
        // Lerp from 0 to next frame
        let lerp = THREE.Math.lerp(0, this.cache[1].position, this.offset / this.frameTime);

        // Substract last lerp from current to make output relative
        this.position = (lerp - this.lastLerp);
        this.lastLerp = lerp;
        
        this.velocity = THREE.Math.lerp(this.cache[0].velocity, this.cache[1].velocity,  this.offset / this.frameTime);
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
                this.cache.push(this.getFrame(i + 1 == framesToGenerate));
            }
            this.cache = this.cache.slice(-2);
        }
    }

    /**
     * Gets another simulation frame
     */
    getFrame(lastFrame) {

        let newFrame = Object.assign({}, this.lastFrame());

        if(lastFrame) {
            // Reset position
            newFrame.position = 0;
            // Transition to next frame
            this.lastLerp = this.lastLerp - this.lastFrame().position;
        }

        return spring(newFrame.position, this.target, newFrame.velocity, this.mass, this.damping);
    }
}