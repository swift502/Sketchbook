import * as THREE from 'three';
import * as CANNON from 'cannon';
import { SimulationFrame } from '../physics/spring_simulation/SimulationFrame';
import { Side } from '../enums/Side';
import { Object3D } from 'three';
import { Space } from '../enums/Space';
export declare function createCapsuleGeometry(radius?: number, height?: number, N?: number): THREE.Geometry;
/**
 * Constructs a 2D matrix from first vector, replacing the Y axes with the global Y axis,
 * and applies this matrix to the second vector. Saves performance when compared to full 3D matrix application.
 * Useful for character rotation, as it only happens on the Y axis.
 * @param {Vector3} a Vector to construct 2D matrix from
 * @param {Vector3} b Vector to apply basis to
 */
export declare function appplyVectorMatrixXZ(a: THREE.Vector3, b: THREE.Vector3): THREE.Vector3;
export declare function round(value: number, decimals?: number): number;
export declare function roundVector(vector: THREE.Vector3, decimals?: number): THREE.Vector3;
/**
 * Finds an angle between two vectors
 * @param {THREE.Vector3} v1
 * @param {THREE.Vector3} v2
 */
export declare function getAngleBetweenVectors(v1: THREE.Vector3, v2: THREE.Vector3, dotTreshold?: number): number;
/**
 * Finds an angle between two vectors with a sign relative to normal vector
 */
export declare function getSignedAngleBetweenVectors(v1: THREE.Vector3, v2: THREE.Vector3, normal?: THREE.Vector3, dotTreshold?: number): number;
export declare function haveSameSigns(n1: number, n2: number): boolean;
export declare function haveDifferentSigns(n1: number, n2: number): boolean;
export declare function setDefaults(options: {}, defaults: {}): {};
export declare function getGlobalProperties(prefix?: string): any[];
export declare function spring(source: number, dest: number, velocity: number, mass: number, damping: number): SimulationFrame;
export declare function springV(source: THREE.Vector3, dest: THREE.Vector3, velocity: THREE.Vector3, mass: number, damping: number): void;
export declare function threeVector(vec: CANNON.Vec3): THREE.Vector3;
export declare function cannonVector(vec: THREE.Vector3): CANNON.Vec3;
export declare function threeQuat(quat: CANNON.Quaternion): THREE.Quaternion;
export declare function cannonQuat(quat: THREE.Quaternion): CANNON.Quaternion;
export declare function setupMeshProperties(child: any): void;
export declare function detectRelativeSide(from: Object3D, to: Object3D): Side;
export declare function easeInOutSine(x: number): number;
export declare function easeOutQuad(x: number): number;
export declare function getRight(obj: THREE.Object3D, space?: Space): THREE.Vector3;
export declare function getUp(obj: THREE.Object3D, space?: Space): THREE.Vector3;
export declare function getForward(obj: THREE.Object3D, space?: Space): THREE.Vector3;
export declare function getBack(obj: THREE.Object3D, space?: Space): THREE.Vector3;
export declare function getMatrix(obj: THREE.Object3D, space: Space): THREE.Matrix4;
export declare function countSleepyBodies(): any;
