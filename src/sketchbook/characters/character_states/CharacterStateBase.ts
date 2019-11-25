import * as Utils from '../../core/Utilities';
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
import { KeyBinding } from '../../core/KeyBinding';

export abstract class CharacterStateBase implements ICharacterState
{
    public character: Character;
    public timer: number;
    public animationLength: any;

    constructor(character: Character)
    {
        this.character = character;

        this.character.velocitySimulator.damping = this.character.defaultVelocitySimulatorDamping;
        this.character.velocitySimulator.mass = this.character.defaultVelocitySimulatorMass;

        this.character.rotationSimulator.damping = this.character.defaultRotationSimulatorDamping;
        this.character.rotationSimulator.mass = this.character.defaultRotationSimulatorMass;

        this.character.arcadeVelocityIsAdditive = false;
        this.character.setArcadeVelocityInfluence(1, 0, 1);

        this.timer = 0;
    }

    public update(timeStep: number): void
    {
        this.timer += timeStep;
    }

    public onInputChange(): void
    {
        if (this.justPressed(this.character.actions.enter))
        {
                this.character.enterVehicle();
        }
        else if (this.character.enteringVehicle !== undefined)
        {
            if (this.justPressed(this.character.actions.up) ||
                this.justPressed(this.character.actions.down) ||
                this.justPressed(this.character.actions.left) ||
                this.justPressed(this.character.actions.right))
                {
                    this.character.enteringVehicle = undefined;
                    this.character.actions.up.value = false;
                }
        }
    }

    public noDirection(): boolean
    {
        return !this.character.actions.up.value && !this.character.actions.down.value && !this.character.actions.left.value && !this.character.actions.right.value;
    }

    public anyDirection(): boolean
    {
        return this.character.actions.up.value || this.character.actions.down.value || this.character.actions.left.value || this.character.actions.right.value;
    }

    public justPressed(key: KeyBinding): boolean
    {
        return key.justPressed;
    }

    public isPressed(key: KeyBinding): boolean
    {
        return key.value;
    }

    public justReleased(key: KeyBinding): boolean
    {
        return key.justReleased;
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
                if (this.isPressed(this.character.actions.run))
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
}