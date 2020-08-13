import { SeatType } from '../enums/SeatType';
import { Side } from '../enums/Side';
import { IControllable } from '../interfaces/IControllable';
import THREE = require('three');
import { VehicleDoor } from '../vehicles/VehicleDoor';
import { Vehicle } from '../vehicles/Vehicle';

export class SeatPoint
{
	public vehicle: IControllable;
	public seatPointObject: THREE.Object3D;

	// String of names of connected seats
	public connectedSeatsString: string;
	// Actual seatPoint objects, need to be identified
	// by parsing connectedSeatsString after all seats are imported
	public connectedSeats: SeatPoint[] = [];

	public type: SeatType;
	public entryPoint: THREE.Object3D;
	public door: VehicleDoor;
	public doorSide: Side;

	constructor(vehicle: IControllable, object: THREE.Object3D, gltf: any)
	{
		this.vehicle = vehicle;
		this.seatPointObject = object;

		if (object.hasOwnProperty('userData') && object.userData.hasOwnProperty('data'))
		{
			if (object.userData.hasOwnProperty('door_object')) 
			{
				this.door = new VehicleDoor(this, gltf.scene.getObjectByName(object.userData.door_object));
			}

			if (object.userData.hasOwnProperty('door_side')) 
			{
				this.doorSide = object.userData.door_side;
			}
			else
			{
				console.error('Seat object ' + object + ' has no doorSide property.');
			}

			if (object.userData.hasOwnProperty('entry_points')) 
			{
				let entry_points = (object.userData.entry_points as string).split(';');
				for (const entry_point of entry_points)
				{
					if (entry_point.length > 0)
					{
						this.entryPoint = gltf.scene.getObjectByName(entry_point);
					}
				}
			}
			else
			{
				console.error('Seat object ' + object + ' has no entry point reference property.');
			}

			if (object.userData.hasOwnProperty('seat_type')) 
			{
				this.type = object.userData.seat_type;
			}
			else
			{
				console.error('Seat object ' + object + ' has no seat type property.');
			}

			if (object.userData.hasOwnProperty('connected_seats')) 
			{
				this.connectedSeatsString = object.userData.connected_seats;
			}
		}
	}

	public update(timeStep: number): void
	{
		if (this.door !== undefined)
		{
			this.door.update(timeStep);
		}
	}
}