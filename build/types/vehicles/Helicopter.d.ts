import * as CANNON from 'cannon';
import { Vehicle } from "./Vehicle";
import { IControllable } from "../interfaces/IControllable";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { KeyBinding } from '../core/KeyBinding';
import THREE = require('three');
export declare class Helicopter extends Vehicle implements IControllable, IWorldEntity {
    rotors: THREE.Object3D[];
    private enginePower;
    actions: {
        'ascend': KeyBinding;
        'descend': KeyBinding;
        'pitchUp': KeyBinding;
        'pitchDown': KeyBinding;
        'yawLeft': KeyBinding;
        'yawRight': KeyBinding;
        'rollLeft': KeyBinding;
        'rollRight': KeyBinding;
        'exitVehicle': KeyBinding;
    };
    constructor();
    update(timeStep: number): void;
    physicsPreStep(body: CANNON.Body, heli: Helicopter): void;
    fromGLTF(gltf: any): void;
    readGLTF(gltf: any): void;
}
