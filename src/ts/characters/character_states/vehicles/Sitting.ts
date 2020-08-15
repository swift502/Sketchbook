import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { SeatPoint } from 'src/ts/data/SeatPoint';
import { CloseVehicleDoorInside } from './CloseVehicleDoorInside';
import { SeatType } from '../../../enums/SeatType';
import { SwitchingSeats } from './SwitchingSeats';

export class Sitting extends CharacterStateBase
{
	private seat: SeatPoint;

	constructor(character: Character, seat: SeatPoint)
	{
		super(character);

		this.seat = seat;
		this.canFindVehiclesToEnter = false;
		
		this.playAnimation('sitting', 0.1);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		console.log("hello 4");

		if (!this.seat.door?.achievingTargetRotation && this.seat.door?.rotation > 0 && this.noDirection())
		{
			console.log("hello 5");
			this.character.setState(new CloseVehicleDoorInside(this.character, this.seat));
		}
		else if (this.character.vehicleEntryInstance !== null)
		{
			console.log("hello 1");
			if (this.character.vehicleEntryInstance.wantsToDrive)
			{
				console.log("hello 2");
				for (const possibleDriverSeat of this.seat.connectedSeats)
				{
					if (possibleDriverSeat.type === SeatType.Driver)
					{
						console.log("hello 3");
						this.character.setState(new SwitchingSeats(this.character, this.seat, possibleDriverSeat));
						break;
					}
				}
			}
		}
	}
}