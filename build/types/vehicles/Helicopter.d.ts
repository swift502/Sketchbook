import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { EntityType } from '../enums/EntityType';
export declare class Helicopter extends Vehicle implements IControllable, IWorldEntity {
    entityType: EntityType;
    rotors: THREE.Object3D[];
    private enginePower;
    constructor(gltf: any);
    noDirectionPressed(): boolean;
    update(timeStep: number): void;
    onInputChange(): void;
    physicsPreStep(body: CANNON.Body, heli: Helicopter): void;
    readHelicopterData(gltf: any): void;
    inputReceiverInit(): void;
}
