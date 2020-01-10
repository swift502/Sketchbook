import * as CANNON from 'cannon';
import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { IWorldEntity } from '../interfaces/IWorldEntity';
export declare class Car extends Vehicle implements IControllable, IWorldEntity {
    drive: string;
    private steeringWheel;
    private steeringSimulator;
    private gear;
    private shiftTimer;
    private timeToShift;
    constructor(gltf: any);
    update(timeStep: number): void;
    shiftUp(): void;
    shiftDown(): void;
    physicsPreStep(body: CANNON.Body, car: Car): void;
    onInputChange(): void;
    inputReceiverInit(): void;
    readCarData(gltf: any): void;
}
