export class UIManager
{
	public static setWelcomeScreenVisible(value: boolean): void
	{

	}

	public static setUserInterfaceVisible(value: boolean): void
	{
		document.getElementById('ui-container').style.display = value ? 'block' : 'none';
	}

	public static setLoadingScreenVisible(value: boolean): void
	{
		document.getElementById('loading-screen').style.display = value ? 'flex' : 'none';
	}
}