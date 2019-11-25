import { Character } from "../characters/Character";
import { IInputReceiver } from "./IInputReceiver";
import { Seat } from "../vehicles/Seat";

export interface IControllable extends IInputReceiver
{
    seats: Seat[];
    position: THREE.Vector3;
    controllingCharacter: Character;

    getMountPoint(character: Character): THREE.Vector3;
}