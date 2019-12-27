import { SeatType } from "../enums/SeatType";
import { Side } from "../enums/Side";
import { IControllable } from "../interfaces/IControllable";
import THREE = require("three");
import { VehicleDoor } from "./VehicleDoor";
export declare class VehicleSeat {
    vehicle: IControllable;
    seatObject: THREE.Object3D;
    type: SeatType;
    entryPoint: THREE.Object3D;
    door: VehicleDoor;
    doorSide: Side;
    constructor(object: THREE.Object3D);
    update(timeStep: number): void;
    isDoorOpen(): boolean;
    openDoor(): void;
    closeDoor(): void;
}
