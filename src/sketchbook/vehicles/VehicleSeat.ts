import { SeatType } from "../enums/SeatType";
import { Side } from "../enums/Side";
import { IControllable } from "../interfaces/IControllable";
import THREE = require("three");
import { VehicleDoor } from "./VehicleDoor";

export class VehicleSeat
{
    public vehicle: IControllable;
    public seatObject: THREE.Object3D;
    public type: SeatType;
    public entryPoint: THREE.Object3D;
    public door: VehicleDoor;
    public doorSide: Side;

    constructor(object: THREE.Object3D)
    {
        this.seatObject = object;
    }

    public update(timeStep: number): void
    {
        this.door.update(timeStep);
    }
}