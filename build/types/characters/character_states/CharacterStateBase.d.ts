import { Character } from '../Character';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { KeyBinding } from '../../core/KeyBinding';
export declare abstract class CharacterStateBase implements ICharacterState {
    character: Character;
    timer: number;
    animationLength: any;
    constructor(character: Character);
    update(timeStep: number): void;
    onInputChange(): void;
    noDirection(): boolean;
    anyDirection(): boolean;
    justPressed(key: KeyBinding): boolean;
    isPressed(key: KeyBinding): boolean;
    justReleased(key: KeyBinding): boolean;
    fallInAir(): void;
    animationEnded(timeStep: number): boolean;
    setAppropriateDropState(): void;
    setAppropriateStartWalkState(): void;
}
