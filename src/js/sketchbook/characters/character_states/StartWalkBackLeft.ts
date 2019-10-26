import { StartWalkBase } from './_stateLibrary';

export class StartWalkBackLeft extends StartWalkBase
{
    constructor(character)
    {
        super(character);
        this.animationLength = character.setAnimation('start_back_left', 0.1);
    }
}