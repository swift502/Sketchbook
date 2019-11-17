import { CharacterStateBase } from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';
export declare class JumpRunning extends CharacterStateBase implements ICharacterState {
    private alreadyJumped;
    constructor(character: Character);
    update(timeStep: number): void;
}
