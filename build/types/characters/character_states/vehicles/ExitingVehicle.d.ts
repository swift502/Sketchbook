import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { IControllable } from '../../../interfaces/IControllable';
export declare class ExitingVehicle extends CharacterStateBase {
    private vehicle;
    private seat;
    private startPosition;
    private endPosition;
    private startRotation;
    private endRotation;
    constructor(character: Character, vehicle: IControllable, seat: VehicleSeat);
    update(timeStep: number): void;
}
