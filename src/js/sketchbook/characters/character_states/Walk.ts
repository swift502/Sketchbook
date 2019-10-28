import
{
    CharacterStateBase,
    EndWalk,
    Idle,
    JumpRunning,
    Sprint,
} from './_stateLibrary';
import { Character } from '../Character';

export class Walk extends CharacterStateBase
{
    constructor(character: Character)
    {
        super(character);

        this.character.setArcadeVelocityTarget(0.8);
        this.character.setAnimation('run', 0.1);

        if (this.noDirection())
        {
            this.character.setState(EndWalk);
        }
        if (this.isPressed(this.character.actions.run))
        {
            this.character.setState(Sprint);
        }
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);

        this.character.setCameraRelativeOrientationTarget();

        this.fallInAir();
    }

    public onInputChange(): void
    {
        if (this.justPressed(this.character.actions.run))
        {
            this.character.setState(Sprint);
        }

        if (this.justPressed(this.character.actions.jump))
        {
            this.character.setState(JumpRunning);
        }

        if (this.noDirection())
        {
            if (this.character.velocity.length() > 1)
            {
                this.character.setState(EndWalk);
            }
            else
            {
                this.character.setState(Idle);
            }
        }
    }
}