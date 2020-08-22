import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { ExitingStateBase } from './ExitingStateBase';
export declare class ExitingAirplane extends ExitingStateBase {
    constructor(character: Character, seat: VehicleSeat);
    update(timeStep: number): void;
}
