import * as THREE from 'three';
import { SimulatorBase, spring } from './SimulatorBase';

export class RelativeSpringSimulator extends SimulatorBase
{
    constructor(fps, mass, damping, startPosition = 0, startVelocity = 0)
    {
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

        //SpringR lerping
        // Lerp from 0 to next frame
        let lerp = THREE.Math.lerp(0, this.cache[1].position, this.offset / this.frameTime);

        // Substract last lerp from current to make output relative
        this.position = (lerp - this.lastLerp);
        this.lastLerp = lerp;

        this.velocity = THREE.Math.lerp(this.cache[0].velocity, this.cache[1].velocity, this.offset / this.frameTime);
    }

    /**
     * Gets another simulation frame
     */
    getFrame(isLastFrame)
    {
        let newFrame = Object.assign({}, this.lastFrame());

        if (isLastFrame)
        {
            // Reset position
            newFrame.position = 0;
            // Transition to next frame
            this.lastLerp = this.lastLerp - this.lastFrame().position;
        }

        return spring(newFrame.position, this.target, newFrame.velocity, this.mass, this.damping);
    }
}