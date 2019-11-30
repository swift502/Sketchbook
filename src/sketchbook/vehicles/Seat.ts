import { SeatType } from "../enums/SeatType";
import { Side } from "../enums/Side";
import { IControllable } from "../interfaces/IControllable";

export class Seat
{
    public vehicle: IControllable;
    public object: THREE.Object3D;
    public type: SeatType;
    public entryPoint: THREE.Object3D;
    public door: THREE.Object3D;
    public doorSide: Side;
    public isDoorOpen: boolean = false;
}