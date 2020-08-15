export class KeyBinding
{
	public eventCodes: string[];
	public isPressed: boolean = false;
	public justPressed: boolean = false;
	public justReleased: boolean = false;
	
	constructor(...code: string[])
	{
		this.eventCodes = code;
	}
}