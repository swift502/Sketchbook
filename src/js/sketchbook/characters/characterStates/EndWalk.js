import { CharacterStateBase } from './CharacterStateBase';
import {Idle} from './Idle';
import {JumpIdle} from './JumpIdle';
import {Walk} from './Walk';
import {Sprint} from './Sprint';

export class EndWalk extends CharacterStateBase
{
    constructor(character)
    {
        super(character);

        this.character.setArcadeVelocityTarget(0);
        this.animationLength = character.setAnimation('stop', 0.1);
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
            if (this.isPressed(this.character.controls.run))
            {
                this.character.setState(Sprint);
            }
            else
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
}