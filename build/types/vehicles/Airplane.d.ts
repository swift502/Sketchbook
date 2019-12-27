import { Vehicle } from "./Vehicle";
import { IControllable } from "../interfaces/IControllable";
import { IWorldEntity } from "../interfaces/IWorldEntity";
export declare class Airplane extends Vehicle implements IControllable, IWorldEntity {
    rudder: THREE.Object3D;
    elevators: THREE.Object3D[];
    leftAileron: THREE.Object3D;
    rightAileron: THREE.Object3D;
    constructor();
    fromGLTF(gltf: any): void;
    readGLTF(gltf: any): void;
}
