import * as Utils from '../../core/FunctionLibrary';
import
{
	CharacterStateBase,
	Idle,
	IdleRotateLeft,
	IdleRotateRight,
	JumpRunning,
	Sprint,
	Walk,
} from './_stateLibrary';
import { Character } from '../Character';

export class StartWalkBase extends CharacterStateBase
{
	constructor(character: Character)
	{
		super(character);

		this.canEnterVehicles = true;
		this.character.rotationSimulator.mass = 20;
		this.character.rotationSimulator.damping = 0.7;

		this.character.setArcadeVelocityTarget(0.8);
		// this.character.velocitySimulator.damping = 0.5;
		// this.character.velocitySimulator.mass = 1;
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		if (this.animationEnded(timeStep))
		{
			this.character.setState(new Walk(this.character));
		}

		this.character.setCameraRelativeOrientationTarget();

		//
		// Different velocity treating experiments
		//

		// let matrix = new THREE.Matrix3();
		// let o =  new THREE.Vector3().copy(this.character.orientation);
		// matrix.set(
		//     o.z,  0,  o.x,
		//     0,    1,  0,
		//     -o.x, 0,  o.z);
		// let inverse = new THREE.Matrix3().getInverse(matrix);
		// let directionVector = this.character.getCameraRelativeMovementVector();
		// directionVector = directionVector.applyMatrix3(inverse);
		// directionVector.normalize();

		// this.character.setArcadeVelocity(directionVector.z * 0.8, directionVector.x * 0.8);

		this.fallInAir();
	}

	public onInputChange(): void
	{
		super.onInputChange();
		
		if (this.character.actions.jump.justPressed)
		{
			this.character.setState(new JumpRunning(this.character));
		}

		if (this.noDirection())
		{
			if (this.timer < 0.1)
			{
				let angle = Utils.getSignedAngleBetweenVectors(this.character.orientation, this.character.orientationTarget);

				if (angle > Math.PI * 0.4)
				{
					this.character.setState(new IdleRotateLeft(this.character));
				}
				else if (angle < -Math.PI * 0.4)
				{
					this.character.setState(new IdleRotateRight(this.character));
				}
				else
				{
					this.character.setState(new Idle(this.character));
				}
			}
			else
			{
				this.character.setState(new Idle(this.character));
			}
		}

		if (this.character.actions.run.justPressed)
		{
			this.character.setState(new Sprint(this.character));
		}
	}
}