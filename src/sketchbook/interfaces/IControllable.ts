import { Character } from "../characters/Character";
import { IInputReceiver } from "./IInputReceiver";

export interface IControllable extends IInputReceiver
{
    position: THREE.Vector3;
    controllingCharacter: Character;

    getMountPoint(character: Character): THREE.Vector3;
}