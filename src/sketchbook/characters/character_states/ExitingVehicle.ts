import
{
    CharacterStateBase,
    EndWalk,
    Idle,
    JumpRunning,
    Sprint,
} from './_stateLibrary';
import { Character } from '../Character';

export class EnteringVehicle extends CharacterStateBase
{
    constructor(character: Character)
    {
        super(character);
        this.character.setAnimation('idle', 0.1);
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);
        this.character.setCameraRelativeOrientationTarget();
        this.fallInAir();
    }
}