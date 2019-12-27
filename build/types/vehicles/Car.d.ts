import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { World } from '../core/World';
export declare class Car extends Vehicle implements IControllable, IWorldEntity {
    private rayCastVehicle;
    private wheels;
    private wheelsDebug;
    private steeringWheel;
    constructor();
    update(timeStep: number): void;
    onInputChange(): void;
    fromGLTF(gltf: any): void;
    readGLTF(gltf: any): void;
    addToWorld(world: World): void;
}
