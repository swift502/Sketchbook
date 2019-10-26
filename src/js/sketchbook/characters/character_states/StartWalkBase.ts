import * as Utils from '../../core/Utilities';
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

export class StartWalkBase extends CharacterStateBase
{
    constructor(character)
    {
        super(character);

        this.character.rotationSimulator.mass = 20;
        this.character.rotationSimulator.damping = 0.7;

        this.character.setArcadeVelocityTarget(0.8);
        // this.character.velocitySimulator.damping = 0.5;
        // this.character.velocitySimulator.mass = 1;
    }

    public update(timeStep): void
    {
        super.update(timeStep);

        if (this.animationEnded(timeStep))
        {
            this.character.setState(Walk);
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

        this.character.update(timeStep);

        this.fallInAir();
    }

    public changeState(): void
    {
        if (this.justPressed(this.character.controls.jump))
        {
            this.character.setState(JumpRunning);
        }

        if (this.noDirection())
        {
            if (this.timer < 0.1)
            {
                let angle = Utils.getSignedAngleBetweenVectors(this.character.orientation, this.character.orientationTarget);

                if (angle > Math.PI * 0.4)
                {
                    this.character.setState(IdleRotateLeft);
                }
                else if (angle < -Math.PI * 0.4)
                {
                    this.character.setState(IdleRotateRight);
                }
                else
                {
                    this.character.setState(Idle);
                }
            }
            else
            {
                this.character.setState(Idle);
            }
        }

        if (this.justPressed(this.character.controls.run))
        {
            this.character.setState(Sprint);
        }
    }
}