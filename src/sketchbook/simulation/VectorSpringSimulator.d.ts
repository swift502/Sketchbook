import * as THREE from 'three';
import { SimulatorBase } from './SimulatorBase';
import { SimulationFrameVector } from './SimulationFrameVector';
export declare class VectorSpringSimulator extends SimulatorBase {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    target: THREE.Vector3;
    cache: SimulationFrameVector[];
    constructor(fps: number, mass: number, damping: number, startPosition?: THREE.Vector3, startVelocity?: THREE.Vector3);
    /**
     * Advances the simulation by given time step
     * @param {number} timeStep
     */
    simulate(timeStep: number): void;
    /**
     * Gets another simulation frame
     */
    getFrame(isLastFrame: boolean): SimulationFrameVector;
}
