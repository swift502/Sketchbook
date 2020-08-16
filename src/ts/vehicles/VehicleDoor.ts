import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Vehicle } from './Vehicle';
import * as Utils from '../core/FunctionLibrary';
import { VehicleSeat } from './VehicleSeat';
import { Side } from '../enums/Side';

export class VehicleDoor
{
	public vehicle: Vehicle;
	public seat: VehicleSeat;
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

	private sideMultiplier: number;

	constructor(seat: VehicleSeat, object: THREE.Object3D)
	{
		this.seat = seat;
		this.vehicle = seat.vehicle as unknown as Vehicle;
		this.doorObject = object;

		const side = Utils.detectRelativeSide(this.seat.seatPointObject, this.doorObject);
		if (side === Side.Left) this.sideMultiplier = -1;
		else if (side === Side.Right) this.sideMultiplier = 1;
		else this.sideMultiplier = 0;
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
					// this.resetPhysTrailer();
					this.achievingTargetRotation = false;
					this.physicsEnabled = true;
				}
			}
			else if (this.rotation > this.targetRotation)
			{
				this.rotation -= timestep * this.rotationSpeed;
	
				if (this.rotation < this.targetRotation)
				{
					this.rotation = this.targetRotation;
					// this.resetPhysTrailer();
					this.achievingTargetRotation = false;
					this.physicsEnabled = false;
				}
			}
		}

		this.doorObject.setRotationFromEuler(new THREE.Euler(0, this.sideMultiplier * this.rotation, 0));
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
			let trailerPos = back.clone().applyAxisAngle(up, this.sideMultiplier * this.rotation).add(this.doorWorldPos);
			let trailerPushedPos = trailerPos.clone().sub(vehicleVelDiff);

			// Update last values
			this.lastVehicleVel.copy(vehicleVel);
			this.lastTrailerPos.copy(trailerPos);

			// Measure angle difference
			let v1 = trailerPos.clone().sub(this.doorWorldPos).normalize();
			let v2 = trailerPushedPos.clone().sub(this.doorWorldPos).normalize();
			let angle = Utils.getSignedAngleBetweenVectors(v1, v2, up);

			// Apply door velocity
			this.doorVelocity += this.sideMultiplier * angle * 0.05;
			this.rotation += this.doorVelocity;

			// Bounce door when it reaches rotation limit
			if (this.rotation < 0)
			{
				this.rotation = 0;

				if (this.doorVelocity < -0.08)
				{
					this.close();
					this.doorVelocity = 0;
				}
				else
				{
					this.doorVelocity = -this.doorVelocity / 2;
				}
			}
			if (this.rotation > 1)
			{
				this.rotation = 1;
				this.doorVelocity = -this.doorVelocity / 2;
			}

			// Damping
			this.doorVelocity = this.doorVelocity * 0.98;
		}
	}

	public open(): void
	{
		// this.resetPhysTrailer();
		this.achievingTargetRotation = true;
		this.targetRotation = 1;
	}

	public close(): void
	{
		this.achievingTargetRotation = true;
		this.targetRotation = 0;
	}

	public resetPhysTrailer(): void
	{
		// Door world position
		this.doorObject.getWorldPosition(this.doorWorldPos);

		// Get acceleration
		this.lastVehicleVel = new THREE.Vector3();

		// Get vectors
		const quat = Utils.threeQuat(this.vehicle.rayCastVehicle.chassisBody.quaternion);
		const back = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
		this.lastTrailerPos.copy(back.add(this.doorWorldPos));
	}
}