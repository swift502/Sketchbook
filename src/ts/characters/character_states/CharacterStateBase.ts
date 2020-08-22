import * as THREE from 'three';
import * as Utils from '../../core/FunctionLibrary';
import {
	DropIdle,
	DropRolling,
	DropRunning,
	Falling,
	Sprint,
	StartWalkBackLeft,
	StartWalkBackRight,
	StartWalkForward,
	StartWalkLeft,
	StartWalkRight,
	Walk,
} from './_stateLibrary';
import { Character } from '../Character';
import { ICharacterState } from '../../interfaces/ICharacterState';

export abstract class CharacterStateBase implements ICharacterState
{
	public character: Character;
	public timer: number;
	public animationLength: any;

	public canFindVehiclesToEnter: boolean;
	public canEnterVehicles: boolean;
	public canLeaveVehicles: boolean;

	constructor(character: Character)
	{
		this.character = character;

		this.character.velocitySimulator.damping = this.character.defaultVelocitySimulatorDamping;
		this.character.velocitySimulator.mass = this.character.defaultVelocitySimulatorMass;

		this.character.rotationSimulator.damping = this.character.defaultRotationSimulatorDamping;
		this.character.rotationSimulator.mass = this.character.defaultRotationSimulatorMass;

		this.character.arcadeVelocityIsAdditive = false;
		this.character.setArcadeVelocityInfluence(1, 0, 1);

		this.canFindVehiclesToEnter = true;
		this.canEnterVehicles = false;
		this.canLeaveVehicles = true;

		this.timer = 0;
	}

	public update(timeStep: number): void
	{
		this.timer += timeStep;
	}

	public onInputChange(): void
	{
		if (this.canFindVehiclesToEnter && this.character.actions.enter.justPressed)
		{
			this.character.findVehicleToEnter(true);
		}
		else if (this.canFindVehiclesToEnter && this.character.actions.enter_passenger.justPressed)
		{
			this.character.findVehicleToEnter(false);
		}
		else if (this.canEnterVehicles && this.character.vehicleEntryInstance !== null)
		{
			if (this.character.actions.up.justPressed ||
				this.character.actions.down.justPressed ||
				this.character.actions.left.justPressed ||
				this.character.actions.right.justPressed)
				{
					this.character.vehicleEntryInstance = null;
					this.character.actions.up.isPressed = false;
				}
		}
	}

	public noDirection(): boolean
	{
		return !this.character.actions.up.isPressed && !this.character.actions.down.isPressed && !this.character.actions.left.isPressed && !this.character.actions.right.isPressed;
	}

	public anyDirection(): boolean
	{
		return this.character.actions.up.isPressed || this.character.actions.down.isPressed || this.character.actions.left.isPressed || this.character.actions.right.isPressed;
	}

	public fallInAir(): void
	{
		if (!this.character.rayHasHit) { this.character.setState(new Falling(this.character)); }
	}

	public animationEnded(timeStep: number): boolean
	{
		if (this.character.mixer !== undefined)
		{
			if (this.animationLength === undefined)
			{
				console.error(this.constructor.name + 'Error: Set this.animationLength in state constructor!');
				return false;
			}
			else
			{
				return this.timer > this.animationLength - timeStep;
			}
		}
		else { return true; }
	}

	public setAppropriateDropState(): void
	{
		if (this.character.groundImpactData.velocity.y < -6)
		{
			this.character.setState(new DropRolling(this.character));
		}
		else if (this.anyDirection())
		{
			if (this.character.groundImpactData.velocity.y < -2)
			{
				this.character.setState(new DropRunning(this.character));
			}
			else
			{
				if (this.character.actions.run.isPressed)
				{
					this.character.setState(new Sprint(this.character));
				}
				else
				{
					this.character.setState(new Walk(this.character));
				}
			}
		}
		else
		{
			this.character.setState(new DropIdle(this.character));
		}
	}

	public setAppropriateStartWalkState(): void
	{
		let range = Math.PI;
		let angle = Utils.getSignedAngleBetweenVectors(this.character.orientation, this.character.getCameraRelativeMovementVector());

		if (angle > range * 0.8)
		{
			this.character.setState(new StartWalkBackLeft(this.character));
		}
		else if (angle < -range * 0.8)
		{
			this.character.setState(new StartWalkBackRight(this.character));
		}
		else if (angle > range * 0.3)
		{
			this.character.setState(new StartWalkLeft(this.character));
		}
		else if (angle < -range * 0.3)
		{
			this.character.setState(new StartWalkRight(this.character));
		}
		else
		{
			this.character.setState(new StartWalkForward(this.character));
		}
	}

	protected playAnimation(animName: string, fadeIn: number): void
	{
		this.animationLength = this.character.setAnimation(animName, fadeIn);
	}
}