import { AIBase } from './AIBase';

export class Idle extends AIBase
{
    public update(timeStep: number): void
    {
        super.update(timeStep);
        this.updateCharacter(timeStep);
    }
}
