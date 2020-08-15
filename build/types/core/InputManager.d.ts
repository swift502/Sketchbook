import { World } from './World';
import { IInputReceiver } from '../interfaces/IInputReceiver';
export declare class InputManager {
    world: World;
    domElement: any;
    pointerLock: any;
    isLocked: boolean;
    inputReceiver: IInputReceiver;
    boundOnMouseDown: (evt: any) => void;
    boundOnMouseMove: (evt: any) => void;
    boundOnMouseUp: (evt: any) => void;
    boundOnMouseWheelMove: (evt: any) => void;
    boundOnPointerlockChange: (evt: any) => void;
    boundOnPointerlockError: (evt: any) => void;
    boundOnKeyDown: (evt: any) => void;
    boundOnKeyUp: (evt: any) => void;
    constructor(world: World, domElement: HTMLElement);
    update(timestep: number, unscaledTimeStep: number): void;
    setInputReceiver(receiver: IInputReceiver): void;
    setPointerLock(enabled: boolean): void;
    onPointerlockChange(event: MouseEvent): void;
    onPointerlockError(event: MouseEvent): void;
    onMouseDown(event: MouseEvent): void;
    onMouseMove(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    onKeyDown(event: KeyboardEvent): void;
    onKeyUp(event: KeyboardEvent): void;
    onMouseWheelMove(event: WheelEvent): void;
}
