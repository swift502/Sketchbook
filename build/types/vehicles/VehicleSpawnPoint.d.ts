import * as THREE from 'three';
import { ISpawnPoint } from '../interfaces/ISpawnPoint';
import { World } from '../core/World';
export declare class VehicleSpawnPoint implements ISpawnPoint {
    type: string;
    driver: string;
    firstAINode: string;
    private object;
    constructor(object: THREE.Object3D);
    spawn(world: World): void;
    private getNewVehicleByType;
}
