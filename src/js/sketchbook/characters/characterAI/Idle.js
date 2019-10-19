import { AIBase } from './AIBase';

export class Idle extends AIBase
{
    update(timeStep)
    {
        super.update();
        this.updateCharacter(timeStep);
    }
}