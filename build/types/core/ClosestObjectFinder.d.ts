import * as THREE from 'three';
export declare class ClosestObjectFinder<T> {
    closestObject: T;
    private closestDistance;
    private referencePosition;
    private maxDistance;
    constructor(referencePosition: THREE.Vector3, maxDistance?: number);
    consider(object: T, objectPosition: THREE.Vector3): void;
}
