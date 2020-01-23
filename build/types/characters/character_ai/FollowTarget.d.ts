import * as THREE from 'three';
import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { Character } from '../Character';
export declare class FollowTarget implements ICharacterAI {
    character: Character;
    isTargetReached: boolean;
    target: THREE.Object3D;
    private stopDistance;
    constructor(target: THREE.Object3D, stopDistance?: number);
    setTarget(target: THREE.Object3D): void;
    update(timeStep: number): void;
}
