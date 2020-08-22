import * as THREE from 'three';
import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { IControllable } from '../../../interfaces/IControllable';
export declare abstract class ExitingStateBase extends CharacterStateBase {
    protected vehicle: IControllable;
    protected seat: VehicleSeat;
    protected startPosition: THREE.Vector3;
    protected endPosition: THREE.Vector3;
    protected startRotation: THREE.Quaternion;
    protected endRotation: THREE.Quaternion;
    protected exitPoint: THREE.Object3D;
    protected dummyObj: THREE.Object3D;
    constructor(character: Character, seat: VehicleSeat);
    detachCharacterFromVehicle(): void;
    updateEndRotation(): void;
}
