import THREE = require("three");
export declare class VehicleDoor {
    doorObject: THREE.Object3D;
    rotation: number;
    targetRotation: number;
    rotationSpeed: number;
    constructor(object: THREE.Object3D);
    update(timestep: number): void;
    open(): void;
    close(): void;
    isOpen(): boolean;
}
