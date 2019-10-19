import {StartWalkBase} from './StartWalkBase';

export class StartWalkLeft extends StartWalkBase
{
    constructor(character)
    {
        super(character);
        this.animationLength = character.setAnimation('start_left', 0.1);
    }
}