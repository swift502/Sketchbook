import
{
    CharacterStateBase,
    EndWalk,
    JumpRunning,
    Sprint,
    Walk,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';

export class DropRunning extends CharacterStateBase implements ICharacterState
{
    constructor(character)
    {
        super(character);

        this.character.setArcadeVelocityTarget(0.8);
        this.animationLength = this.character.setAnimation('drop_running', 0.1);
    }

    public update(timeStep): void
    {
        super.update(timeStep);

        this.character.setCameraRelativeOrientationTarget();
        this.character.update(timeStep);

        if (this.animationEnded(timeStep))
        {
            this.character.setState(Walk);
        }
    }

    public changeState(): void
    {
        if (this.noDirection())
        {
            this.character.setState(EndWalk);
        }

        if (this.anyDirection() && this.justPressed(this.character.controls.run))
        {
            this.character.setState(Sprint);
        }

        if (this.justPressed(this.character.controls.jump))
        {
            this.character.setState(JumpRunning);
        }
    }
}