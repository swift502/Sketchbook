import
{
    CharacterStateBase,
    JumpIdle,
    Walk,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';

export class Idle extends CharacterStateBase implements ICharacterState
{
    constructor(character)
    {
        super(character);

        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;

        this.character.setArcadeVelocityTarget(0);
        this.character.setAnimation('idle', 0.1);
    }

    public update(timeStep): void
    {
        super.update(timeStep);

        this.character.update(timeStep);

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