import * as THREE from 'three';
import { World } from '../core/World';
import { IPhysicsType } from '../interfaces/IPhysicsType';
import { IWorldEntity } from '../interfaces/IWorldEntity';
export declare class SBObject extends THREE.Object3D implements IWorldEntity {
    isObject: boolean;
    model: any;
    physics: IPhysicsType;
    constructor(model?: THREE.Mesh, physics?: IPhysicsType);
    update(timeStep: number): void;
    setModel(model: THREE.Mesh): void;
    setModelFromPhysicsShape(): void;
    setPhysics(physics: IPhysicsType): void;
    addToWorld(world: World): void;
    removeFromWorld(world: World): void;
}
