import { SeatType } from "../enums/SeatType";
import { Side } from "../enums/Side";
import { IControllable } from "../interfaces/IControllable";
import THREE = require("three");

export class Seat
{
    public vehicle: IControllable;
    public object: THREE.Object3D;
    public type: SeatType;
    public entryPoint: THREE.Object3D;
    public door: THREE.Object3D;
    public doorSide: Side;
    public isDoorOpen: boolean = false;

    public openDoorTest(): void
    {
        this.door.setRotationFromEuler(new THREE.Euler(0, -Math.PI * 0.45, 0));
    }

    public closeDoorTest(): void
    {
        this.door.setRotationFromEuler(new THREE.Euler(0, 0, 0));
    }
}