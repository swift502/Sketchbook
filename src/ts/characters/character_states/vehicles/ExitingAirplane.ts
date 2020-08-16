import * as THREE from 'three';
import * as Utils from '../../../core/FunctionLibrary';

import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { Side } from '../../../enums/Side';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { IControllable } from '../../../interfaces/IControllable';
import { Idle } from '../Idle';
import { CloseVehicleDoorOutside } from './CloseVehicleDoorOutside';
import { Vehicle } from 'src/ts/vehicles/Vehicle';
import { Falling } from '../Falling';

export class ExitingAirplane extends CharacterStateBase
{
	private vehicle: IControllable;
	private seat: VehicleSeat;
	private startPosition: THREE.Vector3 = new THREE.Vector3();
	private endPosition: THREE.Vector3 = new THREE.Vector3();

	constructor(character: Character, seat: VehicleSeat)
	{
		super(character);

		this.canFindVehiclesToEnter = false;
		this.seat = seat;
		this.vehicle = seat.vehicle;

		this.seat.door?.open();

		this.startPosition.copy(this.character.position);
		this.endPosition.copy(this.startPosition);
		this.endPosition.y += 1;

		this.playAnimation('jump_idle', 0.1);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		if (this.animationEnded(timeStep))
		{
			this.character.controlledObject = undefined;
			this.character.world.graphicsWorld.attach(this.character);
			this.character.resetVelocity();
			this.character.resetOrientation();
			this.character.setPhysicsEnabled(true);

			this.character.characterCapsule.body.velocity.copy((this.vehicle as unknown as Vehicle).rayCastVehicle.chassisBody.velocity);

			this.character.setState(new Falling(this.character));
			this.character.leaveSeat();
		}
		else
		{
			let beginningCutoff = 0.3;
			let factor = THREE.MathUtils.clamp(((this.timer / this.animationLength) - beginningCutoff) * (1 / (1 - beginningCutoff)), 0, 1);
			let smoothFactor = this.easeOutQuad(factor);
			let lerpPosition = new THREE.Vector3().lerpVectors(this.startPosition, this.endPosition, smoothFactor);
			this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);
		}
	}

	private easeOutQuad(x: number): number
	{
		return 1 - (1 - x) * (1 - x);
	}
}