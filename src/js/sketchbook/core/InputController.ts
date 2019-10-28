export class InputController
{
    public value: boolean;
    public justPressed: boolean;
    public justReleased: boolean;
    
    constructor()
    {
        this.value = false;
        this.justPressed = false;
        this.justReleased = false;
    }
}