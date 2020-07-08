import
{
    CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from 'src/ts/vehicles/VehicleSeat';
import { CloseVehicleDoorInside } from './CloseVehicleDoorInside';
import { Vehicle } from 'src/ts/vehicles/Vehicle';

export class Driving extends CharacterStateBase
{
    private seat: VehicleSeat;

    constructor(character: Character, seat: VehicleSeat)
    {
        super(character);

        this.seat = seat;
        this.character.setAnimation('driving', 0.1);
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);

        if (this.seat.door.isOpen() && this.seat.vehicle.noDirectionPressed())
        {
            this.character.setState(new CloseVehicleDoorInside(this.character, this.seat));
        }
    }
}