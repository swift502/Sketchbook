import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { SeatPoint } from '../../../data/SeatPoint';
import { Side } from '../../../enums/Side';
import { Driving } from './Driving';

export class CloseVehicleDoorInside extends CharacterStateBase
{
	private seat: SeatPoint;
	private hasClosedDoor: boolean = false;

	constructor(character: Character, seat: SeatPoint)
	{
		super(character);

		this.seat = seat;
		this.canFindVehiclesToEnter = false;
		this.canLeaveVehicles = false;

		if (seat.doorSide === Side.Left)
		{
			this.animationLength = this.character.setAnimation('close_door_sitting_left', 0.1);
		}
		else if (seat.doorSide === Side.Right)
		{
			this.animationLength = this.character.setAnimation('close_door_sitting_right', 0.1);
		}
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		if (this.timer > 0.3 && !this.hasClosedDoor)
		{
			this.hasClosedDoor = true;
			this.seat.door?.close();
		}

		if (this.timer > this.animationLength - timeStep)
		{
			this.character.setState(new Driving(this.character, this.seat));
		}
	}
}