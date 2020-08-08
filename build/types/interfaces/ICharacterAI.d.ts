import { Character } from '../characters/Character';
export interface ICharacterAI {
    character: Character;
    update(timeStep: number): void;
}
