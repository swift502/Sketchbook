import
{
    CharacterStateBase,
    EndWalk,
    Walk,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';

export class DropRolling extends CharacterStateBase implements ICharacterState
{
    constructor(character)
    {
        super(character);

        this.character.velocitySimulator.mass = 1;
        this.character.velocitySimulator.damping = 0.6;

        this.character.setArcadeVelocityTarget(0.8);
        this.animationLength = this.character.setAnimation('drop_running_roll', 0.03);
    }

    public update(timeStep): void
    {
        super.update(timeStep);

        this.character.setCameraRelativeOrientationTarget();
        this.character.update(timeStep);

        if (this.animationEnded(timeStep))
        {
            if (this.anyDirection())
            {
                this.character.setState(Walk);
            }
            else
            {
                this.character.setState(EndWalk);
            }
        }
    }
}