export class KeyBinding
{
    public keyCode: string;
    public isPressed: boolean = false;
    public justPressed: boolean = false;
    public justReleased: boolean = false;
    
    constructor(code: string)
    {
        this.keyCode = code;
    }
}