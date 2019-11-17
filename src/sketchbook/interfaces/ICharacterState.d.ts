export interface ICharacterState {
    update(timeStep: number): void;
    onInputChange(): void;
}
