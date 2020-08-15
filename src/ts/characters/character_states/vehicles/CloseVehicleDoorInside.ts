import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { SeatPoint } from '../../../data/SeatPoint';
import { Side } from '../../../enums/Side';
import { Driving } from './Driving';
import { SeatType } from '../../../enums/SeatType';
import { Sitting } from './Sitting';

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
			this.playAnimation('close_door_sitting_left', 0.1);
		}
		else if (seat.doorSide === Side.Right)
		{
			this.playAnimation('close_door_sitting_right', 0.1);
		}
		
		this.seat.door?.open();
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		if (this.timer > 0.4 && !this.hasClosedDoor)
		{
			this.hasClosedDoor = true;
			this.seat.door?.close();
		}

		if (this.animationEnded(timeStep))
		{
			if (this.seat.type === SeatType.Driver)
			{
				this.character.setState(new Driving(this.character, this.seat));
			}
			else if (this.seat.type === SeatType.Passenger)
			{
				this.character.setState(new Sitting(this.character, this.seat));
			}
		}
	}
}