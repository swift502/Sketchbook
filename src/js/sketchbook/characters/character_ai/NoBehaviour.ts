import { AIBase } from './AIBase';

export class NoBehaviour extends AIBase
{
    public update(timeStep: number): void
    {
        super.update(timeStep);
        this.updateCharacter(timeStep);
    }
}
