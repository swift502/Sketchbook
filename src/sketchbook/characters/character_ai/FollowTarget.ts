import * as THREE from 'three';
import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { CharacterAIBase } from './CharacterAIBase';

export class FollowTarget extends CharacterAIBase implements ICharacterAI
{
    public isTargetReached: boolean;

    private target: THREE.Object3D;
    private stopDistance: number;

    constructor(target: THREE.Object3D, stopDistance: number = 1.3)
    {
        super();
        this.target = target;
        this.stopDistance = stopDistance;
    }

    public setTarget(target: THREE.Object3D): void
    {
        this.target = target;
    }

    public update(timeStep: number): void
    {
        let viewVector = new THREE.Vector3().subVectors(this.target.position, this.character.position);
        this.character.setViewVector(viewVector);

        // Follow character
        if (viewVector.length() > this.stopDistance)
        {
            this.isTargetReached = false;
            this.character.triggerAction('up', true);
        }
        // Stand still
        else
        {
            this.isTargetReached = true;
            this.character.triggerAction('up', false);

            // Look at character
            this.character.setOrientation(viewVector);
        }
    }
}