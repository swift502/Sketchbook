import * as THREE from 'three';
import { Vehicle } from './Vehicle';
export declare class VehicleDoor {
    vehicle: Vehicle;
    doorObject: THREE.Object3D;
    doorVelocity: number;
    doorWorldPos: THREE.Vector3;
    lastTrailerPos: THREE.Vector3;
    lastTrailerVel: THREE.Vector3;
    rotation: number;
    achievingTargetRotation: boolean;
    physicsEnabled: boolean;
    targetRotation: number;
    rotationSpeed: number;
    lastVehicleVel: THREE.Vector3;
    lastVehiclePos: THREE.Vector3;
    constructor(vehicle: Vehicle, object: THREE.Object3D);
    update(timestep: number): void;
    preStepCallback(): void;
    open(): void;
    close(): void;
}
