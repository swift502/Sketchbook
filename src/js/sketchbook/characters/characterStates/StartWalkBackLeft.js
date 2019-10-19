import {StartWalkBase} from './StartWalkBase';

export class StartWalkBackLeft extends StartWalkBase
{
    constructor(character)
    {
        super(character);
        this.animationLength = character.setAnimation('start_back_left', 0.1);
    }
}