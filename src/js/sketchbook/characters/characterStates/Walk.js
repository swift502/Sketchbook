import
{
    CharacterStateBase,
    Idle,
    EndWalk,
    Sprint,
    JumpRunning
} from './_stateLibrary';

export class Walk extends CharacterStateBase
{
    constructor(character)
    {
        super(character);

        this.character.setArcadeVelocityTarget(0.8);
        this.character.setAnimation('run', 0.1);

        if (this.noDirection())
        {
            this.character.setState(EndWalk);
        }
    }

    update(timeStep)
    {
        super.update(timeStep);

        this.character.setCameraRelativeOrientationTarget();
        this.character.update(timeStep);

        this.fallInAir();

        if (this.isPressed(this.character.controls.run))
        {
            this.character.setState(Sprint);
        }
    }

    changeState()
    {
        if (this.justPressed(this.character.controls.jump))
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