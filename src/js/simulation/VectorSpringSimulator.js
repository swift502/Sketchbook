import * as THREE from 'three';
import { SimulatorBase, springV } from './SimulatorBase';

export class VectorSpringSimulator extends SimulatorBase {

    constructor(fps, mass, damping) {

        //Construct base
        super(fps);

        // Simulated values
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();

        // Simulation parameters
        this.target = new THREE.Vector3();
        this.mass = mass;
        this.damping = damping;
    }
    
    /**
     * Advances the simulation by given time step
     * @param {number} timeStep 
     */
    simulate(timeStep) {
        
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
    generateFrames(timeStep) {

        // Initialize cache by pushing two frames
        if(this.cache.length == 0) {
            for (let i = 0; i < 2; i++) {
                this.cache.push({
                    position: new THREE.Vector3(),
                    velocity: new THREE.Vector3()
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
        // Deep clone data from previous frame
        let newSpring = {
            position: this.lastFrame().position.clone(),
            velocity: this.lastFrame().velocity.clone()
        };
        // Calculate new Spring
        springV(newSpring.position, this.target, newSpring.velocity, this.mass, this.damping);
        // Return new Spring
        return newSpring;
    }
}