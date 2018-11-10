import * as THREE from 'three';
import { SimulatorBase, springV } from './SimulatorBase';

export class VectorSpringSimulator extends SimulatorBase
{
    constructor(fps, mass, damping, startPosition = new THREE.Vector3(), startVelocity = new THREE.Vector3())
    {
        //Construct base
        super(fps);

        // Simulated values
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();

        // Simulation parameters
        this.target = new THREE.Vector3();
        this.mass = mass;
        this.damping = damping;

        // Initialize cache by pushing two frames
        for (let i = 0; i < 2; i++)
        {
            this.cache.push({
                position: startPosition,
                velocity: startVelocity
            });
        }
    }

    /**
     * Advances the simulation by given time step
     * @param {number} timeStep 
     */
    simulate(timeStep)
    {
        // Generate new frames
        this.generateFrames(timeStep);

        // Return interpolation
        this.position.lerpVectors(this.cache[0].position, this.cache[1].position, this.offset / this.frameTime);
        this.velocity.lerpVectors(this.cache[0].velocity, this.cache[1].velocity, this.offset / this.frameTime);
    }

    /**
     * Gets another simulation frame
     */
    getFrame(isLastFrame)
    {
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