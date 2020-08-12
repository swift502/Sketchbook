import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { Side } from '../../../enums/Side';
import { SeatPoint } from '../../../data/SeatPoint';
import { IControllable } from '../../../interfaces/IControllable';
import THREE = require('three');
import { Idle } from '../Idle';
import { CloseVehicleDoorOutside } from './CloseVehicleDoorOutside';
import { Vehicle } from 'src/ts/vehicles/Vehicle';
import { Falling } from '../Falling';

export class ExitingVehicle extends CharacterStateBase
{
	private vehicle: IControllable;
	private seat: SeatPoint;
	private startPosition: THREE.Vector3 = new THREE.Vector3();
	private endPosition: THREE.Vector3 = new THREE.Vector3();
	private startRotation: THREE.Quaternion = new THREE.Quaternion();
	private endRotation: THREE.Quaternion = new THREE.Quaternion();

	constructor(character: Character, vehicle: IControllable, seat: SeatPoint)
	{
		super(character);

		this.canFindVehiclesToEnter = false;
		this.vehicle = vehicle;
		this.seat = seat;

		this.seat.door?.open();

		this.startPosition.copy(this.character.position);
		this.endPosition.copy(seat.entryPoint.position);
		this.endPosition.y += 0.6;

		this.startRotation.copy(this.character.quaternion);
		this.endRotation.copy(seat.entryPoint.quaternion);

		if (seat.doorSide === Side.Left)
		{
			this.animationLength = this.character.setAnimation('stand_up_left', 0.1);
		}
		else if (seat.doorSide === Side.Right)
		{
			this.animationLength = this.character.setAnimation('stand_up_right', 0.1);
		}
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		if (this.timer > this.animationLength - timeStep)
		{
			this.character.controlledObject = undefined;
			this.character.controlledObjectSeat = undefined;
			this.vehicle.controllingCharacter = undefined;
			this.character.world.graphicsWorld.attach(this.character);
			this.character.resetVelocity();
			this.character.resetOrientation();
			this.character.setPhysicsEnabled(true);

			this.character.characterCapsule.body.velocity.copy((this.vehicle as Vehicle).rayCastVehicle.chassisBody.velocity);
			this.character.feetRaycast();

			if (!this.character.rayHasHit)
			{
				this.character.setState(new Falling(this.character));
			}
			else if (this.anyDirection() || this.seat.door === undefined)
			{
				this.character.setState(new Idle(this.character));
			}
			else
			{
				this.character.setState(new CloseVehicleDoorOutside(this.character, this.seat));
			}
		}
		else
		{
			let factor = this.timer / this.animationLength;
			let sineFactor = 1 - ((Math.cos(factor * Math.PI) * 0.5) + 0.5);
			let lerpPosition = new THREE.Vector3().lerpVectors(this.startPosition, this.endPosition, sineFactor);
			this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);

			THREE.Quaternion.slerp(this.startRotation, this.endRotation, this.character.quaternion, sineFactor);
		}
	}
}