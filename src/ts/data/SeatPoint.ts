import { SeatType } from '../enums/SeatType';
import { Side } from '../enums/Side';
import { IControllable } from '../interfaces/IControllable';
import THREE = require('three');
import { VehicleDoor } from '../vehicles/VehicleDoor';

export class SeatPoint
{
	// TODO move init of these values in this class' constructor
	public vehicle: IControllable;
	public seatPoint: THREE.Object3D;
	public connectedSeats: SeatPoint[] = [];
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
}