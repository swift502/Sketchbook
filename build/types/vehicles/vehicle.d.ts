import { Character } from "../characters/Character";
import { IControllable } from "../interfaces/IControllable";
import { KeyBinding } from "../core/KeyBinding";
export declare class Vehicle implements IControllable {
    controllingCharacter: Character;
    actions: {
        [action: string]: KeyBinding;
    };
    triggerAction(actionName: string, value: boolean): void;
    handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void;
    handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void;
    handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void;
    handleMouseWheel(event: WheelEvent, value: number): void;
    inputReceiverInit(): void;
    inputReceiverUpdate(timeStep: number): void;
}
