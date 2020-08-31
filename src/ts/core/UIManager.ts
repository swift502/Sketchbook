import { LoadingScreenMode } from '../enums/LoadingScreenMode';

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

	public static setLoadingScreenMode(mode: LoadingScreenMode): void
	{
		document.getElementById('main-title').style.display = mode === LoadingScreenMode.Full ? 'block' : 'none';
		document.getElementById('loading-screen-background').style.display = mode === LoadingScreenMode.Full ? 'block' : 'none';
	}
}