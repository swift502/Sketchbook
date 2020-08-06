import THREE = require('three');
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { World } from '../core/World';
export declare class Grass implements IWorldEntity {
    groundMaterial: THREE.Material;
    grassMaterial: THREE.Material;
    private meshes;
    constructor(transform: any);
    addToWorld(world: World): void;
    removeFromWorld(world: World): void;
}
