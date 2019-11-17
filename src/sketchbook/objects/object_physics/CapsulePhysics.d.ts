import * as CANNON from 'cannon';
import * as THREE from 'three';
import { IPhysicsType } from '../../interfaces/IPhysicsType';
export declare class CapsulePhysics implements IPhysicsType {
    options: any;
    physical: CANNON.Body;
    visual: THREE.Mesh;
    constructor(options: any);
    getVisualModel(options: any): THREE.Mesh;
}
