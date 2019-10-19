import {StartWalkBase} from './StartWalkBase';

export class StartWalkRight extends StartWalkBase
{
    constructor(character)
    {
        super(character);
        this.animationLength = character.setAnimation('start_right', 0.1);
    }
}