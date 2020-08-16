import * as THREE from 'three';
import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { Side } from '../../../enums/Side';
import { Idle } from '../Idle';
import { EnteringVehicle } from './EnteringVehicle';
import * as Utils from '../../../core/FunctionLibrary';

export class OpenVehicleDoor extends CharacterStateBase
{
	private seat: VehicleSeat;
	private entryPoint: THREE.Object3D;
	private hasOpenedDoor: boolean = false;

	constructor(character: Character, seat: VehicleSeat, entryPoint: THREE.Object3D)
	{
		super(character);

		this.canFindVehiclesToEnter = false;
		this.seat = seat;
		this.entryPoint = entryPoint;

		const side = Utils.detectRelativeSide(entryPoint, seat.seatPointObject);
		if (side === Side.Left)
		{
			this.playAnimation('open_door_standing_left', 0.1);
		}
		else if (side === Side.Right)
		{
			this.playAnimation('open_door_standing_right', 0.1);
		}

		this.character.resetVelocity();
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		const elements = this.entryPoint.matrixWorld.elements;
		let forward = new THREE.Vector3(elements[8], elements[9], elements[10]);
		this.character.setOrientation(forward);

		if (this.timer > 0.3 && !this.hasOpenedDoor)
		{
			this.hasOpenedDoor = true;
			this.seat.door?.open();   
		}

		if (this.animationEnded(timeStep))
		{
			if (this.anyDirection())
			{
				this.character.setState(new Idle(this.character));
			}
			else
			{
				this.character.setState(new EnteringVehicle(this.character, this.seat, this.entryPoint));
			}
		}
	}
}