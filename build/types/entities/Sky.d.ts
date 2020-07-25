import * as THREE from 'three';
import { World } from '../core/World';
export declare class Sky extends THREE.Object3D {
    sun: THREE.DirectionalLight;
    set theta(value: number);
    set phi(value: number);
    private _phi;
    private _theta;
    private hemiLight;
    private maxHemiIntensity;
    private minHemiIntensity;
    private sunTarget;
    private skyMesh;
    private skyMaterial;
    private world;
    constructor(world: World);
    update(): void;
    refreshSunPosition(): void;
    refreshHemiIntensity(): void;
}
