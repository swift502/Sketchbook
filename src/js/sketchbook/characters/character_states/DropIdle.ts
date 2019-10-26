import {
    CharacterStateBase,
    Idle,
    JumpIdle,
    StartWalkForward,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';

export class DropIdle extends CharacterStateBase implements ICharacterState
{
    constructor(character: Character)
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

    public update(timeStep): void
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

    public changeState(): void
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