import { ISpawnPoint } from '../interfaces/ISpawnPoint';
import * as THREE from 'three';
import { World } from '../core/World';
export declare class CharacterSpawnPoint implements ISpawnPoint {
    private object;
    constructor(object: THREE.Object3D);
    spawn(world: World): void;
}
