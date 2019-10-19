import { CharacterStateBase } from './CharacterStateBase';
import {Walk} from './Walk';
import {JumpRunning} from './JumpRunning';
import {EndWalk} from './EndWalk';

export class Sprint extends CharacterStateBase
{
    constructor(character)
    {
        super(character);

        this.character.velocitySimulator.mass = 10;
        this.character.rotationSimulator.damping = 0.8;
        this.character.rotationSimulator.mass = 50;

        this.character.setArcadeVelocityTarget(1.4);
        this.character.setAnimation('sprint', 0.1);
    }

    update(timeStep)
    {
        super.update(timeStep);

        this.character.setCameraRelativeOrientationTarget();
        this.character.update(timeStep);

        this.fallInAir();
    }

    changeState()
    {
        if (this.justReleased(this.character.controls.run))
        {
            this.character.setState(Walk);
        }

        if (this.justPressed(this.character.controls.jump))
        {
            this.character.setState(JumpRunning);
        }

        if (this.noDirection())
        {
            this.character.setState(EndWalk);
        }
    }
}