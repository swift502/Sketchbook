import { SeatType } from "../enums/SeatType";

export class Seat
{
    public object: THREE.Object3D;
    public type: SeatType;
    public entryPoint: THREE.Object3D;
    public door: THREE.Object3D;
}