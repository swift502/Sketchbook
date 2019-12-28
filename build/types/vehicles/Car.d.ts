import * as CANNON from 'cannon';
import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { World } from '../core/World';
export declare class Car extends Vehicle implements IControllable, IWorldEntity {
    private rayCastVehicle;
    private wheels;
    private wheelsDebug;
    private steeringWheel;
    private steering;
    private steeringSimulator;
    private gear;
    constructor();
    update(timeStep: number): void;
    physicsPreStep(body: CANNON.Body, car: Car): void;
    onInputChange(): void;
    fromGLTF(gltf: any): void;
    readGLTF(gltf: any): void;
    addToWorld(world: World): void;
}
