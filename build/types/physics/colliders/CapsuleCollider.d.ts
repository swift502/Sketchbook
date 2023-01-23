import * as CANNON from 'cannon-es';
import { ICollider } from '../../interfaces/ICollider';
export declare class CapsuleCollider implements ICollider {
    options: any;
    body: CANNON.Body;
    constructor(options: any);
}
