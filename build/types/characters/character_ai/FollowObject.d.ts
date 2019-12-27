import * as THREE from 'three';
import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { CharacterAIBase } from './CharacterAIBase';
export declare class FollowObject extends CharacterAIBase implements ICharacterAI {
    isTargetReached: boolean;
    private target;
    private stopDistance;
    constructor(target: THREE.Object3D, stopDistance?: number);
    setTarget(target: THREE.Object3D): void;
    update(timeStep: number): void;
}
