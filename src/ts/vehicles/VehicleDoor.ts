import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Vehicle } from './Vehicle';
import * as Utils from '../core/HelperFunctions';

export class VehicleDoor
{
	public vehicle: Vehicle;
	public doorObject: THREE.Object3D;
	public doorVelocity: number = 0;
	public doorWorldPos: THREE.Vector3 = new THREE.Vector3();
	public lastTrailerPos: THREE.Vector3 = new THREE.Vector3();
	public lastTrailerVel: THREE.Vector3 = new THREE.Vector3();

	public rotation: number = 0;
	public achievingTargetRotation: boolean = false;
	public physicsEnabled: boolean = false;
	public targetRotation: number = 0;
	public rotationSpeed: number = 5;

	public lastVehicleVel: THREE.Vector3 = new THREE.Vector3();
	public lastVehiclePos: THREE.Vector3 = new THREE.Vector3();

	constructor(vehicle: Vehicle, object: THREE.Object3D)
	{
		this.vehicle = vehicle;
		this.doorObject = object;
	}

	public update(timestep: number): void
	{
		if (this.achievingTargetRotation)
		{
			if (this.rotation < this.targetRotation)
			{
				this.rotation += timestep * this.rotationSpeed;
	
				if (this.rotation > this.targetRotation)
				{
					this.rotation = this.targetRotation;
					this.achievingTargetRotation = false;
					// this.doorVelocity = 0;
					this.physicsEnabled = this.rotation > 0;
				}
			}
			else if (this.rotation > this.targetRotation)
			{
				this.rotation -= timestep * this.rotationSpeed;
	
				if (this.rotation < this.targetRotation)
				{
					this.rotation = this.targetRotation;
					this.achievingTargetRotation = false;
					// this.doorVelocity = 0;
					this.physicsEnabled = this.rotation > 0;
				}
			}
		}

		this.doorObject.setRotationFromEuler(new THREE.Euler(0, -this.rotation, 0));
	}

	public preStepCallback(): void
	{
		if (this.physicsEnabled && !this.achievingTargetRotation)
		{
			// Door world position
			this.doorObject.getWorldPosition(this.doorWorldPos);

			// Get acceleration
			let vehicleVel = Utils.threeVector(this.vehicle.rayCastVehicle.chassisBody.velocity);
			let vehicleVelDiff = vehicleVel.clone().sub(this.lastVehicleVel);

			// Get vectors
			const quat = Utils.threeQuat(this.vehicle.rayCastVehicle.chassisBody.quaternion);
			const back = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
			const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);

			// Get imaginary positions
			let trailerPos = back.clone().applyAxisAngle(up, -this.rotation).add(this.doorWorldPos);
			let trailerPushedPos = trailerPos.clone().sub(vehicleVelDiff);

			// Update last values
			this.lastVehicleVel.copy(vehicleVel);
			this.lastTrailerPos.copy(trailerPos);

			// Measure angle difference
			let v1 = trailerPos.clone().sub(this.doorWorldPos).normalize();
			let v2 = trailerPushedPos.clone().sub(this.doorWorldPos).normalize();
			let angle = Utils.getSignedAngleBetweenVectors(v1, v2, up);

			// Apply door velocity
			this.doorVelocity -= angle * 0.05;
			this.rotation += this.doorVelocity;

			// Bounce door when it reaches rotation limit
			if (this.rotation < 0)
			{
				this.rotation = 0;
				this.doorVelocity = -this.doorVelocity;
			}
			if (this.rotation > 1)
			{
				this.rotation = 1;
				this.doorVelocity = -this.doorVelocity;
			}

			// Damping
			this.doorVelocity = this.doorVelocity * 0.98;
		}
	}

	public open(): void
	{
		this.achievingTargetRotation = true;
		this.targetRotation = 1;
	}

	public close(): void
	{
		this.achievingTargetRotation = true;
		this.targetRotation = 0;
	}
}