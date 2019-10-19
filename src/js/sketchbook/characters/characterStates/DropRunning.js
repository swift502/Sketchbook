import
{
    CharacterStateBase,
    Walk,
    EndWalk,
    Sprint,
    JumpRunning
} from './_stateLibrary';

export class DropRunning extends CharacterStateBase
{
    constructor(character)
    {
        super(character);

        this.character.setArcadeVelocityTarget(0.8);
        this.animationLength = this.character.setAnimation('drop_running', 0.1);
    }

    update(timeStep)
    {
        super.update(timeStep);

        this.character.setCameraRelativeOrientationTarget();
        this.character.update(timeStep);

        if (this.animationEnded(timeStep))
        {
            this.character.setState(Walk);
        }
    }

    changeState()
    {
        if (this.noDirection(this.character.controls.jump))
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