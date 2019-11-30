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
    private startRotation: THREE.Vector3 = new THREE.Vector3();
    private endRotation: THREE.Vector3 = new THREE.Vector3();

    constructor(character: Character, seat: Seat)
    {
        super(character);

        this.canFindVehiclesToEnter = false;
        this.vehicle = seat.vehicle;
        this.seat = seat;

        // this.startPosition.copy(seat.entryPoint.position);
        // this.startPosition.y += this.character.height / 2 - this.character.modelOffset.y;
        // this.startPosition = (this.seat.vehicle as unknown as THREE.Object3D).worldToLocal(this.character.position);

        // this.endPosition.copy(seat.object.position);
        // this.endPosition.y += this.character.height / 2 - this.character.modelOffset.y;

        // this.startRotation = (this.seat.vehicle as unknown as THREE.Object3D).worldToLocal(this.character.orientation);
        // this.startRotation.copy(seat.entryPoint.quaternion);
        // this.endRotation.copy(seat.object.quaternion);

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

        this.startPosition.copy(this.character.position);
        this.endPosition.copy(seat.object.position);
        this.endPosition.y += 0.5;

        // this.startRotation.copy(this.character.orientation);
        // const elements = this.seat.entryPoint.matrix.elements;
        // this.endRotation = new THREE.Vector3(-elements[8], -elements[9], -elements[10]);
        // this.endRotation.copy(seat.object.quaternion);
        // this.character.visuals.setRotationFromQuaternion(this.startRotation);
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

        // let quat = this.startRotation.slerp(this.endRotation, sineFactor);
        // let lerpRotation = new THREE.Vector3().lerpVectors(this.startPosition, this.endPosition, sineFactor);
        // this.character.orientation.copy(lerpRotation);
        // this.character.visuals.lookAt(lerpRotation);

        // let lerpRotation = new THREE.Vector3().lerpVectors(this.startRotation, this.endRotation, sineFactor);
        // this.character.setRotationFromEuler(new THREE.Euler(lerpRotation.x, lerpRotation.y, lerpRotation.z));
    }
}