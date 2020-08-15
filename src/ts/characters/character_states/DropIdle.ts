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
		this.playAnimation('drop_idle', 0.1);

		if (this.anyDirection())
		{
			this.character.setState(new StartWalkForward(character));
		}
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);
		this.character.setCameraRelativeOrientationTarget();
		if (this.animationEnded(timeStep))
		{
			this.character.setState(new Idle(this.character));
		}
		this.fallInAir();
	}

	public onInputChange(): void
	{
		super.onInputChange();
		
		if (this.character.actions.jump.justPressed)
		{
			this.character.setState(new JumpIdle(this.character));
		}

		if (this.anyDirection())
		{
			this.character.setState(new StartWalkForward(this.character));
		}
	}
}