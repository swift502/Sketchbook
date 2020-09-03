import * as CANNON from 'cannon';

import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { KeyBinding } from '../core/KeyBinding';
import * as THREE from 'three';
import * as Utils from '../core/FunctionLibrary';
import { SpringSimulator } from '../physics/spring_simulation/SpringSimulator';
import { World } from '../world/World';
import { EntityType } from '../enums/EntityType';

export class Car extends Vehicle implements IControllable
{
	public entityType: EntityType = EntityType.Car;
	public drive: string = 'awd';
	get speed(): number {
		return this._speed;
	}
	private _speed: number = 0;

	// private wheelsDebug: THREE.Mesh[] = [];
	private steeringWheel: THREE.Object3D;
	private airSpinTimer: number = 0;

	private steeringSimulator: SpringSimulator;
	private gear: number = 1;

	// Transmission
	private shiftTimer: number;
	private timeToShift: number = 0.2;

	private canTiltForwards: boolean = false;
	private characterWantsToExit: boolean = false;

	constructor(gltf: any)
	{
		super(gltf, {
			radius: 0.25,
			suspensionStiffness: 20,
			suspensionRestLength: 0.35,
			maxSuspensionTravel: 1,
			frictionSlip: 0.8,
			dampingRelaxation: 2,
			dampingCompression: 2,
			rollInfluence: 0.8
		});

		this.readCarData(gltf);

		this.collision.preStep = (body: CANNON.Body) => { this.physicsPreStep(body, this); };

		this.actions = {
			'throttle': new KeyBinding('KeyW'),
			'reverse': new KeyBinding('KeyS'),
			'brake': new KeyBinding('Space'),
			'left': new KeyBinding('KeyA'),
			'right': new KeyBinding('KeyD'),
			'exitVehicle': new KeyBinding('KeyF'),
			'seat_switch': new KeyBinding('KeyX'),
			'view': new KeyBinding('KeyV'),
		};

		this.steeringSimulator = new SpringSimulator(60, 10, 0.6);
	}

	public noDirectionPressed(): boolean
	{
		let result = 
		!this.actions.throttle.isPressed &&
		!this.actions.reverse.isPressed &&
		!this.actions.left.isPressed &&
		!this.actions.right.isPressed;

		return result;
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		const tiresHaveContact = this.rayCastVehicle.numWheelsOnGround > 0;

		// Air spin
		if (!tiresHaveContact)
		{
			// Timer grows when car is off ground, resets once you touch the ground again
			this.airSpinTimer += timeStep;
			if (!this.actions.throttle.isPressed) this.canTiltForwards = true;
		}
		else
		{
			this.canTiltForwards = false;
			this.airSpinTimer = 0;
		}

		// Engine
		const engineForce = 500;
		const maxGears = 5;
		const gearsMaxSpeeds = {
			'R': -4,
			'0': 0,
			'1': 5,
			'2': 9,
			'3': 13,
			'4': 17,
			'5': 22,
		};

		if (this.shiftTimer > 0)
		{
			this.shiftTimer -= timeStep;
			if (this.shiftTimer < 0) this.shiftTimer = 0;
		}
		else
		{
			// Transmission 
			if (this.actions.reverse.isPressed)
			{
				const powerFactor = (gearsMaxSpeeds['R'] - this.speed) / Math.abs(gearsMaxSpeeds['R']);
				const force = (engineForce / this.gear) * (Math.abs(powerFactor) ** 1);

				this.applyEngineForce(force);
			}
			else
			{
				const powerFactor = (gearsMaxSpeeds[this.gear] - this.speed) / (gearsMaxSpeeds[this.gear] - gearsMaxSpeeds[this.gear - 1]);

				if (powerFactor < 0.1 && this.gear < maxGears) this.shiftUp();
				else if (this.gear > 1 && powerFactor > 1.2) this.shiftDown();
				else if (this.actions.throttle.isPressed)
				{
					const force = (engineForce / this.gear) * (powerFactor ** 1);
					this.applyEngineForce(-force);
				}
			}
		}

		// Steering
		this.steeringSimulator.simulate(timeStep);
		this.setSteeringValue(this.steeringSimulator.position);
		if (this.steeringWheel !== undefined) this.steeringWheel.rotation.z = -this.steeringSimulator.position * 2;

		if (this.rayCastVehicle.numWheelsOnGround < 3 && Math.abs(this.collision.velocity.length()) < 0.5)	
		{	
			this.collision.quaternion.copy(this.collision.initQuaternion);	
		}

		// Getting out
		if (this.characterWantsToExit && this.controllingCharacter !== undefined && this.controllingCharacter.charState.canLeaveVehicles)
		{
			let speed = this.collision.velocity.length();

			if (speed > 0.1 && speed < 4)
			{
				this.triggerAction('brake', true);
			}
			else
			{
				this.forceCharacterOut();
			}
		}
	}

	public shiftUp(): void
	{
		this.gear++;
		this.shiftTimer = this.timeToShift;

		this.applyEngineForce(0);
	}

	public shiftDown(): void
	{
		this.gear--;
		this.shiftTimer = this.timeToShift;

		this.applyEngineForce(0);
	}

	public physicsPreStep(body: CANNON.Body, car: Car): void
	{
		// Constants
		const quat = Utils.threeQuat(body.quaternion);
		const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
		const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
		const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);

		// Measure speed
		this._speed = this.collision.velocity.dot(Utils.cannonVector(forward));

		// Air spin
		// It takes 2 seconds until you have max spin air control since you leave the ground
		let airSpinInfluence = THREE.MathUtils.clamp(this.airSpinTimer / 2, 0, 1);
		airSpinInfluence *= THREE.MathUtils.clamp(this.speed, 0, 1);
		
		const flipSpeedFactor = THREE.MathUtils.clamp(1 - this.speed, 0, 1);
		const upFactor = (up.dot(new THREE.Vector3(0, -1, 0)) / 2) + 0.5;
		const flipOverInfluence = flipSpeedFactor * upFactor * 3;

		const maxAirSpinMagnitude = 2.0;
		const airSpinAcceleration = 0.15;
		const angVel = this.collision.angularVelocity;

		const spinVectorForward = Utils.cannonVector(forward.clone());
		const spinVectorRight = Utils.cannonVector(right.clone());

		const effectiveSpinVectorForward = Utils.cannonVector(forward.clone().multiplyScalar(airSpinAcceleration * (airSpinInfluence + flipOverInfluence)));
		const effectiveSpinVectorRight = Utils.cannonVector(right.clone().multiplyScalar(airSpinAcceleration * (airSpinInfluence)));

		// Right
		if (this.actions.right.isPressed && !this.actions.left.isPressed) {
			if (angVel.dot(spinVectorForward) < maxAirSpinMagnitude) {
				angVel.vadd(effectiveSpinVectorForward, angVel);
			}
		} else
		// Left
		if (this.actions.left.isPressed && !this.actions.right.isPressed) {
			if (angVel.dot(spinVectorForward) > -maxAirSpinMagnitude) {
				angVel.vsub(effectiveSpinVectorForward, angVel);
			}
		}

		// Forwards
		if (this.canTiltForwards && this.actions.throttle.isPressed && !this.actions.reverse.isPressed) {
			if (angVel.dot(spinVectorRight) < maxAirSpinMagnitude) {
				angVel.vadd(effectiveSpinVectorRight, angVel);
			}
		} else
		// Backwards
		if (this.actions.reverse.isPressed && !this.actions.throttle.isPressed) {
			if (angVel.dot(spinVectorRight) > -maxAirSpinMagnitude) {
				angVel.vsub(effectiveSpinVectorRight, angVel);
			}
		}

		// Steering
		const velocity = new CANNON.Vec3().copy(this.collision.velocity);
		velocity.normalize();
		let driftCorrection = Utils.getSignedAngleBetweenVectors(Utils.threeVector(velocity), forward);

		const maxSteerVal = 0.8;
		let speedFactor = THREE.MathUtils.clamp(this.speed * 0.3, 1, Number.MAX_VALUE);

		if (this.actions.right.isPressed)
		{
			let steering = Math.min(-maxSteerVal / speedFactor, -driftCorrection);
			this.steeringSimulator.target = THREE.MathUtils.clamp(steering, -maxSteerVal, maxSteerVal);
		}
		else if (this.actions.left.isPressed)
		{
			let steering = Math.max(maxSteerVal / speedFactor, -driftCorrection);
			this.steeringSimulator.target = THREE.MathUtils.clamp(steering, -maxSteerVal, maxSteerVal);
		}
		else this.steeringSimulator.target = 0;

		// Update doors
		this.seats.forEach((seat) => {
			seat.door?.preStepCallback();
		});
	}

	public onInputChange(): void {
		super.onInputChange();

		const brakeForce = 1000000;

		if (this.actions.exitVehicle.justPressed)
		{
			this.characterWantsToExit = true;
		}
		if (this.actions.exitVehicle.justReleased)
		{
			this.characterWantsToExit = false;
			this.triggerAction('brake', false);
		}
		if (this.actions.throttle.justReleased || this.actions.reverse.justReleased)
		{
			this.applyEngineForce(0);
		}
		if (this.actions.brake.justPressed)
		{
			this.setBrake(brakeForce, 'rwd');
		}
		if (this.actions.brake.justReleased)
		{
			this.setBrake(0, 'rwd');
		}
		if (this.actions.view.justPressed)
		{
			this.toggleFirstPersonView();
		}
	}

	public inputReceiverInit(): void
	{
		super.inputReceiverInit();

		this.world.updateControls([
			{
				keys: ['W', 'S'],
				desc: 'Accelerate, Brake / Reverse'
			},
			{
				keys: ['A', 'D'],
				desc: 'Steering'
			},
			{
				keys: ['Space'],
				desc: 'Handbrake'
			},
			{
				keys: ['V'],
				desc: 'View select'
			},
			{
				keys: ['F'],
				desc: 'Exit vehicle'
			},
			{
				keys: ['Shift', '+', 'R'],
				desc: 'Respawn'
			},
			{
				keys: ['Shift', '+', 'C'],
				desc: 'Free camera'
			},
		]);
	}

	public readCarData(gltf: any): void
	{
		gltf.scene.traverse((child: THREE.Object3D) => {
			if (child.hasOwnProperty('userData'))
			{
				if (child.userData.hasOwnProperty('data'))
				{
					if (child.userData.data === 'steering_wheel')
					{
						this.steeringWheel = child;
					}
				}
			}
		});
	}
}