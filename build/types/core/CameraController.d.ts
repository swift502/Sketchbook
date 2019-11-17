import * as THREE from 'three';
import { World } from './World';
import { IInputReceiver } from '../interfaces/IInputReceiver';
import { KeyBinding } from './KeyBinding';
import { Character } from '../characters/Character';
export declare class CameraController implements IInputReceiver {
    world: World;
    camera: THREE.Camera;
    target: THREE.Vector3;
    sensitivity: THREE.Vector2;
    radius: number;
    theta: number;
    phi: number;
    onMouseDownPosition: THREE.Vector2;
    onMouseDownTheta: any;
    onMouseDownPhi: any;
    targetRadius: number;
    movementSpeed: number;
    actions: {
        [action: string]: KeyBinding;
    };
    upVelocity: number;
    forwardVelocity: number;
    rightVelocity: number;
    characterCaller: Character;
    constructor(world: World, camera: THREE.Camera, sensitivityX?: number, sensitivityY?: number);
    setSensitivity(sensitivityX: number, sensitivityY?: number): void;
    setRadius(value: number, instantly?: boolean): void;
    move(deltaX: number, deltaY: number): void;
    update(): void;
    handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void;
    handleMouseWheel(event: WheelEvent, value: number): void;
    handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void;
    handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void;
    inputReceiverInit(): void;
    inputReceiverUpdate(): void;
}
