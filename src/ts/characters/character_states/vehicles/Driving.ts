import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { SeatPoint } from 'src/ts/data/SeatPoint';
import { CloseVehicleDoorInside } from './CloseVehicleDoorInside';

export class Driving extends CharacterStateBase
{
	private seat: SeatPoint;

	constructor(character: Character, seat: SeatPoint)
	{
		super(character);

		this.seat = seat;
		this.character.setAnimation('driving', 0.1);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		if (!this.seat.door?.achievingTargetRotation && this.seat.door?.rotation > 0 && this.seat.vehicle.noDirectionPressed())
		{
			this.character.setState(new CloseVehicleDoorInside(this.character, this.seat));
		}
	}
}