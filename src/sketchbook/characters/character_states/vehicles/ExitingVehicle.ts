import
{
    CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { Side } from '../../../enums/Side';
import { Seat } from '../../../vehicles/Seat';
import { IControllable } from '../../../interfaces/IControllable';
import THREE = require('three');
import { Idle } from '../Idle';
import { CloseVehicleDoorOutside } from './CloseVehicleDoorOutside';

export class ExitingVehicle extends CharacterStateBase
{
    private vehicle: IControllable;
    private seat: Seat;
    private startPosition: THREE.Vector3 = new THREE.Vector3();
    private endPosition: THREE.Vector3 = new THREE.Vector3();

    constructor(character: Character, vehicle: IControllable, seat: Seat)
    {
        super(character);

        this.canFindVehiclesToEnter = false;
        this.vehicle = vehicle;
        this.seat = seat;

        this.seat.openDoorTest();

        // seat.object.getWorldPosition( this.startPosition );
        this.startPosition.copy(seat.object.position);
        this.startPosition.y +=  0.5;
        
        // seat.entryPoint.getWorldPosition( this.endPosition );
        this.endPosition.copy(seat.entryPoint.position);
        // this.endPosition.y += this.character.height / 2 - this.character.modelOffset.y;
        this.endPosition.y += 1;

        if (seat.doorSide === Side.Left)
        {
            this.animationLength = this.character.setAnimation('stand_up_left', 0.1);
        }
        else if (seat.doorSide === Side.Right)
        {
            this.animationLength = this.character.setAnimation('stand_up_right', 0.1);
        }
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);

        if (this.timer > this.animationLength - timeStep)
        {
            // this.character.setPosition(this.startPosition.x, this.startPosition.y, this.startPosition.z);
            this.character.controlledObject = undefined;
            this.character.controlledObjectSeat = undefined;
            this.vehicle.controllingCharacter = undefined;
            this.character.world.graphicsWorld.attach(this.character);
            this.character.setPhysicsEnabled(true);

            if (this.anyDirection())
            {
                this.character.setState(new Idle(this.character));
            }
            else
            {
                this.character.setState(new CloseVehicleDoorOutside(this.character, this.seat));
            }
        }
        else
        {
            let factor = this.timer / this.animationLength;
            let sineFactor = 1 - ((Math.cos(factor * Math.PI) * 0.5) + 0.5);
            let lerpPosition = new THREE.Vector3().lerpVectors(this.startPosition, this.endPosition, sineFactor);
            this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);
    
            this.fallInAir();
        }
    }
}