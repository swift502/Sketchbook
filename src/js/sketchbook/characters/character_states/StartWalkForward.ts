import {StartWalkBase} from './_stateLibrary';

export class StartWalkForward extends StartWalkBase
{
    constructor(character)
    {
        super(character);
        this.animationLength = character.setAnimation('start_forward', 0.1);
    }
}