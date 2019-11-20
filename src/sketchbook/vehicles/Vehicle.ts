import { Character } from "../characters/Character";
import { IControllable } from "../interfaces/IControllable";
import { InputController } from "../sketchbook";

export class Vehicle implements IControllable
{
    public controllingCharacter: Character;
    public actions: { [action: string]: InputController; };

    public triggerAction(actionName: string, value: boolean): void
    {
        return;
    }

    public handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void
    {
        return;
    }

    public handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void
    {
        return;
    }

    public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void
    {
        return;
    }

    public handleMouseWheel(event: WheelEvent, value: number): void
    {
        return;
    }

    public inputReceiverInit(): void
    {
        return;
    }

    public inputReceiverUpdate(timeStep: number): void
    {
        return;
    }
}