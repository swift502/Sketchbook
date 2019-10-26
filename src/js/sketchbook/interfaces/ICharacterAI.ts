export interface ICharacterAI {
    update(timeStep: number): void;
    updateCharacter(timeStep: number): void;
}