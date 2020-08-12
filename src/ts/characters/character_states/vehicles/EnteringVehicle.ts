import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { IControllable } from '../../../interfaces/IControllable';
import THREE = require('three');
import { Driving } from './Driving';
import { SeatPoint } from '../../../data/SeatPoint';
import { Side } from '../../../enums/Side';

export class EnteringVehicle extends CharacterStateBase
{
	private vehicle: IControllable;
	private seat: SeatPoint;
	private startPosition: THREE.Vector3 = new THREE.Vector3();
	private endPosition: THREE.Vector3 = new THREE.Vector3();
	private startRotation: THREE.Quaternion = new THREE.Quaternion();
	private endRotation: THREE.Quaternion = new THREE.Quaternion();

	constructor(character: Character, seat: SeatPoint)
	{
		super(character);

		this.canFindVehiclesToEnter = false;
		this.vehicle = seat.vehicle;
		this.seat = seat;

		this.animationLength = 1;
		if (seat.doorSide === Side.Left)
		{
			this.animationLength = this.character.setAnimation('sit_down_right', 0.1);
		}
		else if (seat.doorSide === Side.Right)
		{
			this.animationLength = this.character.setAnimation('sit_down_left', 0.1);
		}

		this.character.resetVelocity();
		this.character.rotateModel();
		this.character.setPhysicsEnabled(false);
		(this.seat.vehicle as unknown as THREE.Object3D).attach(this.character);

		this.startPosition.copy(this.character.position);
		this.endPosition.copy(seat.seatPoint.position);
		this.endPosition.y += 0.6;

		this.startRotation.copy(this.character.quaternion);
		this.endRotation.copy(this.seat.seatPoint.quaternion);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		if (this.timer > this.animationLength - timeStep)
		{
			this.character.setPosition(this.endPosition.x, this.endPosition.y, this.endPosition.z);
			this.character.startControllingVehicle(this.vehicle, this.seat);
			this.vehicle.onInputChange();

			this.character.setState(new Driving(this.character, this.seat));
		}

		let factor = this.timer / this.animationLength;
		let sineFactor = 1 - ((Math.cos(factor * Math.PI) * 0.5) + 0.5);

		let lerpPosition = new THREE.Vector3().lerpVectors(this.startPosition, this.endPosition, sineFactor);
		this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);

		THREE.Quaternion.slerp(this.startRotation, this.endRotation, this.character.quaternion, sineFactor);
	}
}