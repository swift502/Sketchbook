import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { SeatPoint } from '../../../data/SeatPoint';
import { Side } from '../../../enums/Side';
import { Idle } from '../Idle';
import { EnteringVehicle } from './EnteringVehicle';
import THREE = require('three');

export class OpenVehicleDoor extends CharacterStateBase
{
	private seat: SeatPoint;
	private hasOpenedDoor: boolean = false;

	constructor(character: Character, seat: SeatPoint)
	{
		super(character);

		this.canFindVehiclesToEnter = false;
		this.seat = seat;

		if (seat.doorSide === Side.Left)
		{
			this.animationLength = this.character.setAnimation('open_door_standing_right', 0.1);
		}
		else if (seat.doorSide === Side.Right)
		{
			this.animationLength = this.character.setAnimation('open_door_standing_left', 0.1);
		}

		this.character.resetVelocity();
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		const elements = this.seat.entryPoint.matrixWorld.elements;
		let forward = new THREE.Vector3(elements[8], elements[9], elements[10]);
		this.character.setOrientation(forward);

		if (this.timer > 0.3 && !this.hasOpenedDoor)
		{
			this.hasOpenedDoor = true;
			this.seat.door?.open();   
		}

		if (this.timer > this.animationLength - timeStep)
		{
			if (this.anyDirection())
			{
				this.character.setState(new Idle(this.character));
			}
			else
			{
				this.character.setState(new EnteringVehicle(this.character, this.seat));
			}
		}
	}
}