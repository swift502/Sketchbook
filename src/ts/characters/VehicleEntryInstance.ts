import * as THREE from 'three';
import { SeatPoint } from '../data/SeatPoint';
import { Character } from './Character';

export class VehicleEntryInstance
{
	public character: Character;
	public targetSeat: SeatPoint;
	public wantsToTransitionToDriverSeat: boolean = false;

	constructor(character: Character)
	{
		this.character = character;
	}

	public update(timeStep: number): void
	{
		let entryPoint = new THREE.Vector3();
		this.targetSeat.entryPoint.getWorldPosition(entryPoint);
		let viewVector = new THREE.Vector3().subVectors(entryPoint, this.character.position);
		this.character.setOrientation(viewVector);
		
		let heightDifference = viewVector.y;
		viewVector.y = 0;
		if (this.character.charState.canEnterVehicles && viewVector.length() < 0.2 && heightDifference < 2) {
			this.character.enterVehicle(this.targetSeat);
		}
	}
}