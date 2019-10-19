export class AIBase
{
    update()
    {
        if (this.character === undefined)
        {
            console.error('Character is undefined.');
            return false;
        }
    }

    updateCharacter(timeStep)
    {
        this.character.charState.update(timeStep);
    }
}