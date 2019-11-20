import * as THREE from 'three';
import { World } from '../core/World';
import { IPhysicsType } from '../interfaces/IPhysicsType';
export declare class SBObject extends THREE.Object3D {
    isObject: boolean;
    model: any;
    physics: any;
    constructor(model?: THREE.Mesh, physics?: IPhysicsType);
    update(timeStep: number): void;
    setModel(model: THREE.Mesh): void;
    setModelFromPhysicsShape(): void;
    setPhysics(physics: IPhysicsType): void;
    addToWorld(world: World): void;
    removeFromWorld(world: World): void;
}
