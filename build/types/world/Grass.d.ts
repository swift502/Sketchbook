import * as THREE from 'three';
import { World } from '../world/World';
import { IUpdatable } from '../interfaces/IUpdatable.js';
export declare class Grass implements IUpdatable {
    updateOrder: number;
    grassMaterial: THREE.ShaderMaterial;
    playerPosition: THREE.Vector3;
    private meshes;
    private world;
    constructor(object: any, world: World);
    update(timeStep: number): void;
}
