import
{
    CharacterStateBase,
    EndWalk,
    Idle,
    JumpRunning,
    Sprint,
} from './_stateLibrary';
import { Character } from '../Character';
import { IControllable } from '../../interfaces/IControllable';
import THREE = require('three');
import { Sitting } from './Sitting';

export class EnteringVehicle extends CharacterStateBase
{
    private vehicle: IControllable;
    private lerpFactor: number = 0;
    private initialPosition: THREE.Vector3;

    constructor(character: Character, vehicle: IControllable)
    {
        super(character);

        this.vehicle = vehicle;
        this.initialPosition = character.characterCapsule.physics.physical.position.clone();
        this.character.setAnimation('idle', 0.1);
        this.character.setPhysicsEnabled(false);
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);

        if (this.timer > 0.5) {
            this.character.setPosition(this.vehicle.position.x, this.vehicle.position.y, this.vehicle.position.z);
            this.character.controlledObject = this.vehicle;
            this.character.setState(new Sitting(this.character));
        }

        let lerpPosition = new THREE.Vector3().lerpVectors(this.initialPosition, this.vehicle.position, this.timer / 0.5);
        this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);
    }
}