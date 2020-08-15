import * as CANNON from 'cannon';
import { ICollider } from '../../interfaces/ICollider';
import { Object3D } from 'three';
export declare class ConvexCollider implements ICollider {
    mesh: any;
    options: any;
    body: CANNON.Body;
    debugModel: any;
    constructor(mesh: Object3D, options: any);
}
