import * as THREE from 'three';
import { AIBase } from './AIBase';

export class FollowCharacter extends AIBase
{
    private stopDistance: number;

    constructor(targetCharacter, stopDistance = 1.3)
    {
        super();
        this.targetCharacter = targetCharacter;
        this.stopDistance = stopDistance;
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);

        let viewVector = new THREE.Vector3().subVectors(this.targetCharacter.position, this.character.position);
        this.character.setViewVector(viewVector);

        // Follow character
        if (viewVector.length() > this.stopDistance)
        {
            this.character.setControl('up', true);
        }
        // Stand still
        else
        {
            this.character.setControl('up', false);

            // Look at character
            this.character.setOrientationTarget(viewVector);
        }

        this.updateCharacter(timeStep);
    }
}