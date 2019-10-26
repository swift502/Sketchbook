export interface ICharacterState {
    update(timeStep: number): void;
    changeState(): void;
}