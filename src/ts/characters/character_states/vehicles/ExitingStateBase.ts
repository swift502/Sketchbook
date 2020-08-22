import * as THREE from 'three';
import * as Utils from '../../../core/FunctionLibrary';

import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { IControllable } from '../../../interfaces/IControllable';
import { Vehicle } from 'src/ts/vehicles/Vehicle';

export abstract class ExitingStateBase extends CharacterStateBase
{
	protected vehicle: IControllable;
	protected seat: VehicleSeat;
	protected startPosition: THREE.Vector3 = new THREE.Vector3();
	protected endPosition: THREE.Vector3 = new THREE.Vector3();
	protected startRotation: THREE.Quaternion = new THREE.Quaternion();
	protected endRotation: THREE.Quaternion = new THREE.Quaternion();
	protected exitPoint: THREE.Object3D;
	protected dummyObj: THREE.Object3D;

	constructor(character: Character, seat: VehicleSeat)
	{
		super(character);

		this.canFindVehiclesToEnter = false;
		this.seat = seat;
		this.vehicle = seat.vehicle;

		this.seat.door?.open();

		this.startPosition.copy(this.character.position);
		this.startRotation.copy(this.character.quaternion);

		this.dummyObj = new THREE.Object3D();
	}

	public detachCharacterFromVehicle(): void
	{
		this.character.controlledObject = undefined;
		this.character.resetOrientation();
		this.character.world.graphicsWorld.attach(this.character);
		this.character.resetVelocity();
		this.character.setPhysicsEnabled(true);
		this.character.setPosition(this.character.position.x, this.character.position.y, this.character.position.z);
		this.character.inputReceiverUpdate(0);
		this.character.characterCapsule.body.velocity.copy((this.vehicle as unknown as Vehicle).rayCastVehicle.chassisBody.velocity);
		this.character.feetRaycast();
	}

	public updateEndRotation(): void
	{
		const forward = Utils.getForward(this.exitPoint);
		forward.y = 0;
		forward.normalize();

		this.character.world.graphicsWorld.attach(this.dummyObj);
		this.exitPoint.getWorldPosition(this.dummyObj.position);
		let target = this.dummyObj.position.clone().add(forward);
		this.dummyObj.lookAt(target);
		this.seat.seatPointObject.parent.attach(this.dummyObj);
		this.endRotation.copy(this.dummyObj.quaternion);
	}
}