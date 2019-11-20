import * as THREE from 'three';
import { Character } from '../Character';
import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { CharacterAIBase } from './CharacterAIBase';

export class FollowCharacter extends CharacterAIBase implements ICharacterAI
{
    private targetCharacter: Character;
    private stopDistance: number;

    constructor(targetCharacter: Character, stopDistance: number = 1.3)
    {
        super();
        this.targetCharacter = targetCharacter;
        this.stopDistance = stopDistance;
    }

    public update(timeStep: number): void
    {
        let viewVector = new THREE.Vector3().subVectors(this.targetCharacter.position, this.character.position);
        this.character.setViewVector(viewVector);

        // Follow character
        if (viewVector.length() > this.stopDistance)
        {
            this.character.triggerAction('up', true);
        }
        // Stand still
        else
        {
            this.character.triggerAction('up', false);

            // Look at character
            this.character.setOrientationTarget(viewVector);
        }
    }
}