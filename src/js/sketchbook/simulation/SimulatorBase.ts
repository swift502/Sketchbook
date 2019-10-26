import * as THREE from 'three';
import { SimulationFrame } from './SimulationFrame';

export class SimulatorBase
{
    public mass: any;
    public damping: any;
    public frameTime: number;
    public offset: number;
    public cache: any[];
    
    constructor(fps: number, mass: number, damping: number)
    {
        this.mass = mass;
        this.damping = damping;
        this.frameTime = 1 / fps;
        this.offset = 0;
    }

    public setFPS(value: number): void
    {
        this.frameTime = 1 / value;
    }

    public lastFrame(): any
    {
        return this.cache[this.cache.length - 1];
    }

    /**
     * Generates frames between last simulation call and the current one
     * @param {timeStep} timeStep 
     */
    public generateFrames(timeStep: number): void
    {
        // Update cache
        // Find out how many frames needs to be generated
        let totalTimeStep = this.offset + timeStep;
        let framesToGenerate = Math.floor(totalTimeStep / this.frameTime);
        this.offset = totalTimeStep % this.frameTime;

        // Generate simulation frames
        if (framesToGenerate > 0)
        {
            for (let i = 0; i < framesToGenerate; i++)
            {
                this.cache.push(this.getFrame(i + 1 === framesToGenerate));
            }
            this.cache = this.cache.slice(-2);
        }
    }

    public getFrame(isLastFrame: boolean): any
    {
        throw new Error("Method not implemented.");
    }
}

export function spring(source, dest, velocity, mass, damping): SimulationFrame
{
    let acceleration = dest - source;
    acceleration /= mass;
    velocity += acceleration;
    velocity *= damping;

    let position = source += velocity;

    return new SimulationFrame(position, velocity);
}

export function springV(source, dest, velocity, mass, damping): void
{
    let acceleration = new THREE.Vector3().subVectors(dest, source);
    acceleration.divideScalar(mass);
    velocity.add(acceleration);
    velocity.multiplyScalar(damping);
    source.add(velocity);
}