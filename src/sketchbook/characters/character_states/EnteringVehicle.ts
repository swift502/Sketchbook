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
import { Seat } from '../../vehicles/Seat';

export class EnteringVehicle extends CharacterStateBase
{
    private vehicle: IControllable;
    private seat: THREE.Vector3 = new THREE.Vector3();
    private entryPoint: THREE.Vector3 = new THREE.Vector3();

    constructor(character: Character, vehicle: IControllable, seat: Seat)
    {
        super(character);

        this.vehicle = vehicle;
        seat.object.getWorldPosition( this.seat );
        // this.seat.y += this.character.height / 2;
        seat.entryPoint.getWorldPosition( this.entryPoint );
        // this.entryPoint.y += this.character.height / 2;

        this.animationLength = this.character.setAnimation('sit_down_right', 0.1);
        this.character.setPhysicsEnabled(false);
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);

        console.log(this.animationLength);

        if (this.timer > this.animationLength - timeStep)
        {
            this.character.setPosition(this.seat.x, this.seat.y, this.seat.z);
            this.character.controlledObject = this.vehicle;
            this.vehicle.controllingCharacter = this.character;
            this.character.setState(new Sitting(this.character));
        }

        let lerpPosition = new THREE.Vector3().lerpVectors(this.entryPoint, this.seat, this.timer / this.animationLength);
        this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);
    }
}