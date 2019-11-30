import
{
    CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { IControllable } from '../../../interfaces/IControllable';
import THREE = require('three');
import { Sitting } from '../Sitting';
import { Seat } from '../../../vehicles/Seat';
import { Side } from '../../../enums/Side';
import { CloseVehicleDoorInside } from './CloseVehicleDoorInside';

export class EnteringVehicle extends CharacterStateBase
{
    private vehicle: IControllable;
    private seat: Seat;
    private startPosition: THREE.Vector3 = new THREE.Vector3();
    private endPosition: THREE.Vector3 = new THREE.Vector3();

    constructor(character: Character, seat: Seat)
    {
        super(character);

        this.canFindVehiclesToEnter = false;
        this.vehicle = seat.vehicle;
        this.seat = seat;

        // seat.entryPoint.getWorldPosition( this.startPosition );
        this.startPosition.copy(seat.entryPoint.position);
        this.startPosition.y += this.character.height / 2 - this.character.modelOffset.y;

        // seat.object.getWorldPosition( this.endPosition );
        this.endPosition.copy(seat.object.position);
        this.endPosition.y += this.character.height / 2 - this.character.modelOffset.y;

        if (seat.doorSide === Side.Left)
        {
            this.animationLength = this.character.setAnimation('sit_down_right', 0.1);
        }
        else if (seat.doorSide === Side.Right)
        {
            this.animationLength = this.character.setAnimation('sit_down_left', 0.1);
        }

        this.character.setPhysicsEnabled(false);
        (this.seat.vehicle as unknown as THREE.Object3D).attach(this.character);

    }

    public update(timeStep: number): void
    {
        super.update(timeStep);

        if (this.timer > this.animationLength - timeStep)
        {
            this.character.setPosition(this.endPosition.x, this.endPosition.y, this.endPosition.z);
            this.character.controlledObject = this.vehicle;
            this.vehicle.inputReceiverInit();

            this.character.controlledObjectSeat = this.seat;
            this.vehicle.controllingCharacter = this.character;

            if (this.anyDirection())
            {
                this.character.setState(new Sitting(this.character));
            }
            else
            {
                this.character.setState(new CloseVehicleDoorInside(this.character, this.seat));
            }
        }

        let factor = this.timer / this.animationLength;
        let sineFactor = 1 - ((Math.cos(factor * Math.PI) * 0.5) + 0.5);
        let lerpPosition = new THREE.Vector3().lerpVectors(this.startPosition, this.endPosition, sineFactor);
        this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);
    }
}