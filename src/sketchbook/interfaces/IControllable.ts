import { Character } from '../characters/Character';
import { IInputReceiver } from './IInputReceiver';
import { VehicleSeat } from '../vehicles/VehicleSeat';

export interface IControllable extends IInputReceiver
{
    seats: VehicleSeat[];
    position: THREE.Vector3;
    controllingCharacter: Character;

    getMountPoint(character: Character): THREE.Vector3;
    triggerAction(actionName: string, value: boolean): void;
    resetControls(): void;
}