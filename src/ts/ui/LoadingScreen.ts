import { World } from '../core/World';

export class LoadingScreen
{
	private world: World;

	constructor(world: World)
	{
		this.world = world;
	}

	public displayStartBtn(): void
	{
		document.getElementById('start-btn').style.opacity = '1';
	}

	public hideWelcomeScreen(): void
	{
		document.getElementById('ui-container').style.display = 'block';
		document.getElementById('loading-screen').style.display = 'none';
		this.world.setTimeScale(1);
	}
}