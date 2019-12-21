import
{
    CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { Side } from '../../../enums/Side';
import { Idle } from '../Idle';

export class CloseVehicleDoorOutside extends CharacterStateBase
{
    private seat: VehicleSeat;

    constructor(character: Character, seat: VehicleSeat)
    {
        super(character);

        this.seat = seat;
        this.canFindVehiclesToEnter = false;

        if (seat.doorSide === Side.Left)
        {
            this.animationLength = this.character.setAnimation('close_door_standing_right', 0.1);
        }
        else if (seat.doorSide === Side.Right)
        {
            this.animationLength = this.character.setAnimation('close_door_standing_left', 0.1);
        }
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);

        if (this.timer > 0.3)
        {
            this.seat.closeDoor();   
        }

        if (this.timer > this.animationLength - timeStep)
        {
            this.character.setState(new Idle(this.character));
        }
    }
}