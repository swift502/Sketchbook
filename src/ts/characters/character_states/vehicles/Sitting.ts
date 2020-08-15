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

		if (!this.seat.door?.achievingTargetRotation && this.seat.door?.rotation > 0 && this.noDirection())
		{
			this.character.setState(new CloseVehicleDoorInside(this.character, this.seat));
		}
		else if (this.character.vehicleEntryInstance !== null)
		{
			if (this.character.vehicleEntryInstance.wantsToDrive)
			{
				for (const possibleDriverSeat of this.seat.connectedSeats)
				{
					if (possibleDriverSeat.type === SeatType.Driver)
					{
						this.character.setState(new SwitchingSeats(this.character, this.seat, possibleDriverSeat));
						break;
					}
				}
			}
		}
	}

	public onInputChange(): void
	{
		if (this.character.actions.seat_switch.justPressed && this.seat.connectedSeats.length > 0)
		{
			this.character.setState(new SwitchingSeats(this.character, this.seat, this.seat.connectedSeats[0]));
		}

		if (this.character.actions.enter.justPressed || this.character.actions.enter_passenger.justPressed)
		{
			this.character.exitVehicle();
		}
	}
}