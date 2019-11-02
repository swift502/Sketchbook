import { KeyBinding } from "../core/KeyBinding";

export interface IInputReceiver
{
    actions: { [action: string]: KeyBinding };

    handleKey(code: string, pressed: boolean): void;
    handleScroll(value: number): void;
    handleMouseMove(deltaX: number, deltaY: number): void;

    inputReceiverInit(): void;
    inputReceiverUpdate(timeStep: number): void;
}