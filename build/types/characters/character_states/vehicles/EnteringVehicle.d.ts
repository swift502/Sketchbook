import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
export declare class EnteringVehicle extends CharacterStateBase {
    private vehicle;
    private seat;
    private startPosition;
    private endPosition;
    private startRotation;
    private endRotation;
    constructor(character: Character, seat: VehicleSeat);
    update(timeStep: number): void;
}
