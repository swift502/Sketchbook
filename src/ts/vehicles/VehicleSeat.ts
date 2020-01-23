import { SeatType } from "../enums/SeatType";
import { Side } from "../enums/Side";
import { IControllable } from "../interfaces/IControllable";
import THREE = require("three");
import { VehicleDoor } from "./VehicleDoor";

export class VehicleSeat
{
    public vehicle: IControllable;
    public seatPoint: THREE.Object3D;
    public type: SeatType;
    public entryPoint: THREE.Object3D;
    public door: VehicleDoor;
    public doorSide: Side;

    constructor(object: THREE.Object3D)
    {
        this.seatPoint = object;
    }

    public update(timeStep: number): void
    {
        if (this.door !== undefined)
        {
            this.door.update(timeStep);
        }
    }

    public isDoorOpen(): boolean
    {
        if (this.door === undefined)
        {
            return true;
        }
        else 
        {
            return this.door.isOpen();
        }
    }

    public openDoor(): void
    {
        if (this.door !== undefined) this.door.open();
    }

    public closeDoor(): void
    {
        if (this.door !== undefined) this.door.close();
    }
}