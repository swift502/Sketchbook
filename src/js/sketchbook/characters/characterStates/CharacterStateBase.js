import { Utilities as Utils } from '../../core/Utilities';
import
{
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
    Walk
} from './_stateLibrary';

export class CharacterStateBase
{
    /**
     * @param {Character} character 
     */
    constructor(character)
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

    update(timeStep)
    {
        this.timer += timeStep;
    }

    changeState() { }

    noDirection()
    {
        return !this.character.controls.up.value && !this.character.controls.down.value && !this.character.controls.left.value && !this.character.controls.right.value;
    }

    anyDirection()
    {
        return this.character.controls.up.value || this.character.controls.down.value || this.character.controls.left.value || this.character.controls.right.value;
    }

    justPressed(control)
    {
        return this.character.controls.lastControl == control && control.justPressed;
    }

    isPressed(control)
    {
        return control.value;
    }

    justReleased(control)
    {
        return this.character.controls.lastControl == control && control.justReleased;
    }

    fallInAir()
    {
        if (!this.character.rayHasHit) this.character.setState(Falling);
    }

    animationEnded(timeStep)
    {
        if (this.character.mixer != undefined)
        {
            if (this.animationLength == undefined)
            {
                console.error(this.constructor.name + 'Error: Set this.animationLength in state constructor!');
                return false;
            }
            else
            {
                return this.timer > this.animationLength - timeStep;
            }
        }
        else return true;
    }

    setAppropriateDropState()
    {
        if (this.character.groundImpactData.velocity.y < -6)
        {
            this.character.setState(DropRolling);
        }
        else if (this.anyDirection())
        {
            if (this.character.groundImpactData.velocity.y < -2)
            {
                this.character.setState(DropRunning);
            }
            else
            {
                if (this.isPressed(this.character.controls.run))
                {
                    this.character.setState(Sprint);
                }
                else
                {
                    this.character.setState(Walk);
                }
            }
        }
        else
        {
            this.character.setState(DropIdle);
        }
    }

    setAppropriateStartWalkState()
    {
        let range = Math.PI;
        let angle = Utils.getSignedAngleBetweenVectors(this.character.orientation, this.character.getCameraRelativeMovementVector());

        if (angle > range * 0.8)
        {
            this.character.setState(StartWalkBackLeft);
        }
        else if (angle < -range * 0.8)
        {
            this.character.setState(StartWalkBackRight);
        }
        else if (angle > range * 0.3)
        {
            this.character.setState(StartWalkLeft);
        }
        else if (angle < -range * 0.3)
        {
            this.character.setState(StartWalkRight);
        }
        else
        {
            this.character.setState(StartWalkForward);
        }
    }
}