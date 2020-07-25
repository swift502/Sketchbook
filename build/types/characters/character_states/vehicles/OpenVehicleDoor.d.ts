import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
export declare class OpenVehicleDoor extends CharacterStateBase {
    private seat;
    private hasOpenedDoor;
    constructor(character: Character, seat: VehicleSeat);
    update(timeStep: number): void;
}
