import { CharacterStateBase } from './CharacterStateBase';
import {Walk} from './Walk';
import {EndWalk} from './EndWalk';

export class DropRolling extends CharacterStateBase
{
    constructor(character)
    {
        super(character);

        this.character.velocitySimulator.mass = 1;
        this.character.velocitySimulator.damping = 0.6;

        this.character.setArcadeVelocityTarget(0.8);
        this.animationLength = this.character.setAnimation('drop_running_roll', 0.03);
    }

    update(timeStep)
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