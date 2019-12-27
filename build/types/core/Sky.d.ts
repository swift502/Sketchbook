import * as THREE from 'three';
import { World } from './World';
export declare class Sky extends THREE.Object3D {
    sun: THREE.DirectionalLight;
    set theta(value: number);
    set phi(value: number);
    private _phi;
    private _theta;
    private sunTarget;
    private ambientLight;
    private skyMesh;
    private skyMaterial;
    private world;
    constructor(world: World);
    updateSkyCenter(pos: THREE.Vector3): void;
    refreshSunPosition(): void;
}
