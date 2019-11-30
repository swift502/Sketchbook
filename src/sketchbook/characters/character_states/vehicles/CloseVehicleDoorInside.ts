import
{
    CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { Seat } from '../../../vehicles/Seat';
import { Side } from '../../../enums/Side';
import { Sitting } from '../Sitting';

export class CloseVehicleDoorInside extends CharacterStateBase
{
    constructor(character: Character, seat: Seat)
    {
        super(character);

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

        if (this.timer > this.animationLength - timeStep)
        {
            this.character.setState(new Sitting(this.character));
        }
    }
}