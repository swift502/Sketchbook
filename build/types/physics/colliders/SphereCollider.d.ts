import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { ICollider } from '../../interfaces/ICollider';
export declare class SphereCollider implements ICollider {
    options: any;
    body: CANNON.Body;
    debugModel: THREE.Mesh;
    constructor(options: any);
}
