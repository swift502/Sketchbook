import { Character } from "../Character";

export class AIBase
{
    public character: Character;
    public targetCharacter: Character;

    public update(timeStep: number): void
    {
        if (this.character === undefined)
        {
            console.error('Character is undefined.');
            return;
        }
    }

    public updateCharacter(timeStep: number): void
    {
        this.character.charState.update(timeStep);
    }
}