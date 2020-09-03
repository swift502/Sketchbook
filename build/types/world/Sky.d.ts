import * as THREE from 'three';
import { World } from './World';
import { IUpdatable } from '../interfaces/IUpdatable';
import { default as CSM } from 'three-csm';
export declare class Sky extends THREE.Object3D implements IUpdatable {
    updateOrder: number;
    sunPosition: THREE.Vector3;
    csm: CSM;
    set theta(value: number);
    set phi(value: number);
    private _phi;
    private _theta;
    private hemiLight;
    private maxHemiIntensity;
    private minHemiIntensity;
    private skyMesh;
    private skyMaterial;
    private world;
    constructor(world: World);
    update(timeScale: number): void;
    refreshSunPosition(): void;
    refreshHemiIntensity(): void;
}
