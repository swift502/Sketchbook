import { CharacterStateBase } from './CharacterStateBase';
import {Falling} from './Falling';

export class JumpRunning extends CharacterStateBase
{
    constructor(character)
    {
        super(character);

        this.character.velocitySimulator.mass = 100;
        this.animationLength = this.character.setAnimation('jump_running', 0.1);
        this.alreadyJumped = false;
    }

    update(timeStep)
    {
        super.update(timeStep);

        this.character.setCameraRelativeOrientationTarget();

        // Move in air
        if (this.alreadyJumped)
        {
            this.character.setArcadeVelocityTarget(this.anyDirection() ? 0.8 : 0);
        }
        this.character.update(timeStep);

        //Physically jump
        if (this.timer > 0.14 && !this.alreadyJumped)
        {
            this.character.jump(4);
            this.alreadyJumped = true;

            this.character.rotationSimulator.damping = 0.3;
            this.character.arcadeVelocityIsAdditive = true;
            this.character.setArcadeVelocityInfluence(0.05, 0, 0.05);
        }
        else if (this.timer > 0.24 && this.character.rayHasHit)
        {
            this.setAppropriateDropState();
        }
        else if (this.timer > this.animationLength - timeStep)
        {
            this.character.setState(Falling);
        }
    }
}