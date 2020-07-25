import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
export declare class CloseVehicleDoorOutside extends CharacterStateBase {
    private seat;
    private hasClosedDoor;
    constructor(character: Character, seat: VehicleSeat);
    update(timeStep: number): void;
}
