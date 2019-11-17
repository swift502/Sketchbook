import { Character } from "../characters/Character";
import { IInputReceiver } from "./IInputReceiver";

export interface IControllable extends IInputReceiver
{
    controllingCharacter: Character;
}