import {StartWalkBase} from './StartWalkBase';

export class StartWalkForward extends StartWalkBase
{
    constructor(character)
    {
        super(character);
        this.animationLength = character.setAnimation('start_forward', 0.1);
    }
}