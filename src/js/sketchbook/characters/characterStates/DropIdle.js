import { CharacterStateBase } from './CharacterStateBase';
import {StartWalkForward} from './StartWalkForward';
import {Idle} from './Idle';
import {JumpIdle} from './JumpIdle';

export class DropIdle extends CharacterStateBase
{
    constructor(character)
    {
        super(character);

        this.character.velocitySimulator.damping = 0.5;
        this.character.velocitySimulator.mass = 7;

        this.character.setArcadeVelocityTarget(0);
        this.animationLength = this.character.setAnimation('drop_idle', 0.1);

        if (this.anyDirection())
        {
            this.character.setState(StartWalkForward);
        }
    }

    update(timeStep)
    {

        super.update(timeStep);

        this.character.setCameraRelativeOrientationTarget();
        this.character.update(timeStep);

        if (this.animationEnded(timeStep))
        {
            this.character.setState(Idle);
        }

        this.fallInAir();
    }

    changeState()
    {

        if (this.justPressed(this.character.controls.jump))
        {
            this.character.setState(JumpIdle);
        }

        if (this.anyDirection())
        {
            this.character.setState(StartWalkForward);
        }
    }
}