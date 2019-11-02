import { Vehicle } from "./vehicle";
import { IControllable } from "../interfaces/IControllable";
import { Character } from "../characters/Character";
import { InputController } from "../sketchbook";

export class Car extends Vehicle implements IControllable {
    public controllingCharacter: Character;
    
    public actions: { [action: string]: InputController; };

    public triggerAction(actionName: string, value: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    
    public handleKey(code: string, pressed: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public handleScroll(value: number): void
    {
        throw new Error("Method not implemented.");
    }
    public handleMouseMove(deltaX: number, deltaY: number): void
    {
        throw new Error("Method not implemented.");
    }
    public inputReceiverInit(): void
    {
        throw new Error("Method not implemented.");
    }
    public inputReceiverUpdate(timeStep: number): void
    {
        throw new Error("Method not implemented.");
    }
}