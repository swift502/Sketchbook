import * as THREE from 'three';
import { SimulatorBase, spring } from './SimulatorBase';

export class SpringSimulator extends SimulatorBase
{
    constructor(fps, mass, damping, startPosition = 0, startVelocity = 0)
    {
        // Construct base
        super(fps);

        // Simulated values
        this.position = 0;
        this.velocity = 0;

        // Simulation parameters
        this.target = 0;
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
        this.generateFrames(timeStep);

        // Return values interpolated between cached frames
        this.position = THREE.Math.lerp(this.cache[0].position, this.cache[1].position, this.offset / this.frameTime);
        this.velocity = THREE.Math.lerp(this.cache[0].velocity, this.cache[1].velocity, this.offset / this.frameTime);
    }

    /**
     * Gets another simulation frame
     */
    getFrame(isLastFrame)
    {
        return spring(this.lastFrame().position, this.target, this.lastFrame().velocity, this.mass, this.damping);
    }
}