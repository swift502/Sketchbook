import { Character } from '../Character';
import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { CharacterAIBase } from './CharacterAIBase';
export declare class FollowCharacter extends CharacterAIBase implements ICharacterAI {
    private targetCharacter;
    private stopDistance;
    constructor(targetCharacter: Character, stopDistance?: number);
    update(timeStep: number): void;
}
