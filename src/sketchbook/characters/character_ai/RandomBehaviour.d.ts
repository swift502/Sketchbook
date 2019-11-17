import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { CharacterAIBase } from './CharacterAIBase';
export declare class RandomBehaviour extends CharacterAIBase implements ICharacterAI {
    private randomFrequency;
    constructor(randomFrequency?: number);
    update(timeStep: number): void;
}
