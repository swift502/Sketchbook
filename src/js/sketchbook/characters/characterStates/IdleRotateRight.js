import { CharacterStateBase } from './CharacterStateBase';
import {Idle} from './Idle';
import {JumpIdle} from './JumpIdle';
import {Walk} from './Walk';

export class IdleRotateRight extends CharacterStateBase
{
    constructor(character)
    {
        super(character);

        this.character.rotationSimulator.mass = 30;
        this.character.rotationSimulator.damping = 0.6;

        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;

        this.character.setArcadeVelocityTarget(0);
        this.animationLength = this.character.setAnimation('rotate_right', 0.1);
    }

    update(timeStep)
    {
        super.update(timeStep);

        if (this.animationEnded(timeStep))
        {
            this.character.setState(Idle);
        }

        this.character.update(timeStep);

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
            if (this.character.velocity.length() > 0.5)
            {
                this.character.setState(Walk);
            }
            else
            {
                this.setAppropriateStartWalkState();
            }
        }
    }
}