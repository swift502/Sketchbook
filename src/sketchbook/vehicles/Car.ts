import { Vehicle } from "./Vehicle";
import { IControllable } from "../interfaces/IControllable";
import { IWorldEntity } from "../interfaces/IWorldEntity";

export class Car extends Vehicle implements IControllable, IWorldEntity
{
    private steeringWheel: THREE.Object3D;
}