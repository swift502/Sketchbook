import { ISpawnPoint } from '../interfaces/ISpawnPoint';
import { VehicleSpawnPoint } from './VehicleSpawnPoint';
import { CharacterSpawnPoint } from './CharacterSpawnPoint';
import { World } from '../core/World';

export class Scenario
{
	public spawnAlways: boolean;
	public default: boolean;

	private rootNode: THREE.Object3D;
	private spawnPoints: ISpawnPoint[] = [];

	constructor(root: THREE.Object3D)
	{
		this.rootNode = root;
	}

	public findSpawnPoints(): void
	{
		this.rootNode.traverse((child) => {
			if (child.hasOwnProperty('userData'))
			{
				if (child.userData.data === 'spawn')
				{
					if (child.userData.type === 'car' || child.userData.type === 'airplane' || child.userData.type === 'heli')
					{
						let sp = new VehicleSpawnPoint(child);

						if (child.userData.hasOwnProperty('type')) 
						{
							sp.type = child.userData.type;
						}

						if (child.userData.hasOwnProperty('driver')) 
						{
							sp.driver = child.userData.driver;

							if (child.userData.driver === 'ai' && child.userData.hasOwnProperty('first_node'))
							{
								sp.firstAINode = child.userData.first_node;
							}
						}

						this.spawnPoints.push(sp);
					}
					else if (child.userData.type === 'player')
					{
						let sp = new CharacterSpawnPoint(child);
						this.spawnPoints.push(sp);
					}
				}
			}
		});
	}

	public launch(world: World): void
	{
		// this.world.clearEntities();
		this.spawnPoints.forEach((sp) => {
			sp.spawn(world);
		});
	}
}