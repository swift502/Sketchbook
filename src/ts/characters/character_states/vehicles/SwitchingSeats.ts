import * as THREE from 'three';
import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { Side } from '../../../enums/Side';
import { SeatType } from '../../../enums/SeatType';
import { Driving } from './Driving';
import { Sitting } from './Sitting';
import * as Utils from '../../../core/FunctionLibrary';
import { Space } from '../../../enums/Space';

export class SwitchingSeats extends CharacterStateBase
{
	private toSeat: VehicleSeat;

	private startPosition: THREE.Vector3 = new THREE.Vector3();
	private endPosition: THREE.Vector3 = new THREE.Vector3();
	private startRotation: THREE.Quaternion = new THREE.Quaternion();
	private endRotation: THREE.Quaternion = new THREE.Quaternion();

	constructor(character: Character, fromSeat: VehicleSeat, toSeat: VehicleSeat)
	{
		super(character);

		this.toSeat = toSeat;
		this.canFindVehiclesToEnter = false;
		this.canLeaveVehicles = false;

		character.leaveSeat();
		this.character.occupySeat(toSeat);

		const right = Utils.getRight(fromSeat.seatPointObject, Space.Local);
		const viewVector = toSeat.seatPointObject.position.clone().sub(fromSeat.seatPointObject.position).normalize();
		const side = right.dot(viewVector) > 0 ? Side.Left : Side.Right;

		if (side === Side.Left)
		{
			this.playAnimation('sitting_shift_left', 0.1);
		}
		else if (side === Side.Right)
		{
			this.playAnimation('sitting_shift_right', 0.1);
		}

		this.startPosition.copy(fromSeat.seatPointObject.position);
		this.startPosition.y += 0.6;
		this.endPosition.copy(toSeat.seatPointObject.position);
		this.endPosition.y += 0.6;

		this.startRotation.copy(fromSeat.seatPointObject.quaternion);
		this.endRotation.copy(toSeat.seatPointObject.quaternion);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		if (this.animationEnded(timeStep))
		{
			if (this.toSeat.type === SeatType.Driver)
			{
				this.character.setState(new Driving(this.character, this.toSeat));
			}
			else if (this.toSeat.type === SeatType.Passenger)
			{
				this.character.setState(new Sitting(this.character, this.toSeat));
			}
		}
		else
		{
			let factor = this.timer / this.animationLength;
			let sineFactor = Utils.easeInOutSine(factor);
	
			let lerpPosition = new THREE.Vector3().lerpVectors(this.startPosition, this.endPosition, sineFactor);
			this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);
	
			THREE.Quaternion.slerp(this.startRotation, this.endRotation, this.character.quaternion, sineFactor);
		}
	}
}