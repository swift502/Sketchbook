import * as CANNON from 'cannon';
import * as THREE from 'three';
import { IPhysicsType } from '../../interfaces/IPhysicsType';
export declare class ConvexPhysics implements IPhysicsType {
    mesh: any;
    options: any;
    physical: CANNON.Body;
    visual: any;
    constructor(mesh: any, options: any);
    getVisualModel(options: any): THREE.Mesh;
}
