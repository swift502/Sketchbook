import * as THREE from 'three';
import { AIBase } from './AIBase';
import { ICharacterAI } from '../../interfaces/ICharacterAI';

export class RandomBehaviour extends AIBase implements ICharacterAI
{
    private randomFrequency: number;

    constructor(randomFrequency: number = 100)
    {
        super();
        this.randomFrequency = randomFrequency;
    }

    public update(timeStep): void
    {
        super.update(timeStep);

        let rndInt = Math.floor(Math.random() * this.randomFrequency);
        let rndBool = Math.random() > 0.5 ? true : false;

        if (rndInt === 0)
        {
            this.character.setViewVector(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5));

            this.character.setControl('up', true);
            this.character.charState.update(timeStep);
            this.character.setControl('up', false);
        }
        else if (rndInt === 1)
        {
            this.character.setControl('up', rndBool);
        }
        else if (rndInt === 2)
        {
            this.character.setControl('run', rndBool);
        }
        else if (rndInt === 3)
        {
            this.character.setControl('jump', rndBool);
        }

        this.updateCharacter(timeStep);
    }
}