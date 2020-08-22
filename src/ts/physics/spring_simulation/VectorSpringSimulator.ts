import * as THREE from 'three';
import { SimulatorBase } from './SimulatorBase';
import { SimulationFrameVector } from './SimulationFrameVector';
import { springV } from '../../core/FunctionLibrary';

export class VectorSpringSimulator extends SimulatorBase
{
	public position: THREE.Vector3;
	public velocity: THREE.Vector3;
	public target: THREE.Vector3;
	public cache: SimulationFrameVector[];
	
	constructor(fps: number, mass: number, damping: number)
	{
		// Construct base
		super(fps, mass, damping);

		this.init();
	}

	public init(): void
	{
		this.position = new THREE.Vector3();
		this.velocity = new THREE.Vector3();
		this.target = new THREE.Vector3();

		// Initialize cache by pushing two frames
		this.cache = [];
		for (let i = 0; i < 2; i++)
		{
			this.cache.push(
				new SimulationFrameVector(new THREE.Vector3(), new THREE.Vector3()),
			);
		}
	}

	/**
	 * Advances the simulation by given time step
	 * @param {number} timeStep 
	 */
	public simulate(timeStep: number): void
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
	public getFrame(isLastFrame: boolean): SimulationFrameVector
	{
		// Deep clone data from previous frame
		let newSpring = new SimulationFrameVector(this.lastFrame().position.clone(), this.lastFrame().velocity.clone());
		
		// Calculate new Spring
		springV(newSpring.position, this.target, newSpring.velocity, this.mass, this.damping);

		// Return new Spring
		return newSpring;
	}
}