import * as CANNON from 'cannon';
import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import THREE = require('three');
export declare class Airplane extends Vehicle implements IControllable, IWorldEntity {
    rotor: THREE.Object3D;
    leftAileron: THREE.Object3D;
    rightAileron: THREE.Object3D;
    elevators: THREE.Object3D[];
    rudder: THREE.Object3D;
    private steeringSimulator;
    private aileronSimulator;
    private elevatorSimulator;
    private rudderSimulator;
    private enginePower;
    private lastDrag;
    constructor(gltf: any);
    update(timeStep: number): void;
    physicsPreStep(body: CANNON.Body, plane: Airplane): void;
    onInputChange(): void;
    readAirplaneData(gltf: any): void;
    inputReceiverInit(): void;
}
