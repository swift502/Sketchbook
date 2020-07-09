import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Vehicle } from "./Vehicle";
import * as Utils from '../core/Utilities';

export class VehicleDoor
{
    public vehicle: Vehicle;
    public doorObject: THREE.Object3D;
    public doorVelocity: number = 0;
    public doorWorldPos: THREE.Vector3 = new THREE.Vector3();
    public lastTrailerPos: THREE.Vector3 = new THREE.Vector3();
    public lastTrailerVel: THREE.Vector3 = new THREE.Vector3();

    public rotation: number = 0;
    public targetRotation: number = 0;
    public rotationSpeed: number = 5;

    public lastVehicleVel: THREE.Vector3 = new THREE.Vector3();
    public lastVehiclePos: THREE.Vector3 = new THREE.Vector3();

    public helper1: THREE.AxesHelper;
    public helper2: THREE.AxesHelper;

    constructor(vehicle: Vehicle, object: THREE.Object3D)
    {
        this.vehicle = vehicle;
        this.doorObject = object;
    }

    public update(timestep: number): void
    {
        if (this.helper1 === undefined && this.vehicle.world !== undefined)
        {
            this.helper1 = new THREE.AxesHelper(1);
            this.vehicle.world.graphicsWorld.add(this.helper1);
        }

        if (this.helper2 === undefined && this.vehicle.world !== undefined)
        {
            this.helper2 = new THREE.AxesHelper(1);
            this.vehicle.world.graphicsWorld.add(this.helper2);
        }

        // if (this.rotation < this.targetRotation)
        // {
        //     this.rotation += timestep * this.rotationSpeed;

        //     if (this.rotation > this.targetRotation)
        //     {
        //         this.rotation = this.targetRotation;
        //     }
        // }
        // else if (this.rotation > this.targetRotation)
        // {
        //     this.rotation -= timestep * this.rotationSpeed;

        //     if (this.rotation < this.targetRotation)
        //     {
        //         this.rotation = this.targetRotation;
        //     }
        // }

        this.doorObject.setRotationFromEuler(new THREE.Euler(0, -this.rotation, 0));
    }

    public preStepCallback(): void
    {
        let vehicleVel = Utils.threeVector(this.vehicle.rayCastVehicle.chassisBody.velocity);
        let vehicleVelDiff = vehicleVel.clone().sub(this.lastVehicleVel);
        this.lastVehicleVel.copy(vehicleVel);
        
        this.doorObject.getWorldPosition(this.doorWorldPos);

        const quat = Utils.threeQuat(this.vehicle.rayCastVehicle.chassisBody.quaternion);
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
        const back = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);

        let trailerPos = back.clone().applyAxisAngle(up, -this.rotation).add(this.doorWorldPos);
        if (this.helper1 !== undefined) this.helper1.position.copy(trailerPos);
        // let trailerPushedPos = this.lastTrailerPos.clone();
        let trailerPushedPos = trailerPos.clone().sub(vehicleVelDiff);
        if (this.helper2 !== undefined) this.helper2.position.copy(trailerPushedPos);
        this.lastTrailerPos.copy(trailerPos);

        // let trailerVel = trailerPos.clone().sub(this.lastTrailerPos);

        // trailerVel.sub(Utils.threeVector(vehicleVel));
        // let trailerPushedPos = trailerPos.clone().add(trailerVel).sub(this.lastTrailerVel);
        // this.lastTrailerVel.copy(trailerVel);

        let v1 = trailerPos.clone().sub(this.doorWorldPos).normalize();
        let v2 = trailerPushedPos.clone().sub(this.doorWorldPos).normalize();
        let angle = Utils.getSignedAngleBetweenVectors(v1, v2, up);

        this.doorVelocity -= angle * 0.05;
        this.rotation += this.doorVelocity;

        if (this.rotation < 0)
        {
            this.rotation = 0;
            this.doorVelocity = -this.doorVelocity;
        }

        if (this.rotation > 1)
        {
            this.rotation = 1;
            this.doorVelocity = -this.doorVelocity;
        }

        this.doorVelocity = this.doorVelocity * 0.98;
    }

    public open(): void
    {
        this.targetRotation = 1;
    }

    public close(): void
    {
        this.targetRotation = 0;
    }

    public isOpen(): boolean
    {
        return this.rotation > 0.5;
    }
}