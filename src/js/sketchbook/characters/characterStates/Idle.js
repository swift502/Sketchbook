import { CharacterStateBase } from './CharacterStateBase';
import {JumpIdle} from './JumpIdle';
import {Walk} from './Walk';

export class Idle extends CharacterStateBase
{
    constructor(character)
    {
        super(character);

        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;

        this.character.setArcadeVelocityTarget(0);
        this.character.setAnimation('idle', 0.1);
    }

    update(timeStep)
    {
        super.update(timeStep);

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