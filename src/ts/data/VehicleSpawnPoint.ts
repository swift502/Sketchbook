import * as THREE from 'three';
import { ISpawnPoint } from '../interfaces/ISpawnPoint';
import { World } from '../core/World';
import { Helicopter } from '../vehicles/Helicopter';
import { Airplane } from '../vehicles/Airplane';
import { Car } from '../vehicles/Car';
import * as Utils from '../core/HelperFunctions';
import { Vehicle } from '../vehicles/Vehicle';
import { Character } from '../characters/Character';
import { FollowPath } from '../characters/character_ai/FollowPath';

export class VehicleSpawnPoint implements ISpawnPoint
{
	public type: string;
	public driver: string;
	public firstAINode: string;

	private object: THREE.Object3D;

	constructor(object: THREE.Object3D)
	{
		this.object = object;
	}

	public spawn(world: World): void
	{
		world.loadingManager.loadGLTF('build/assets/' + this.type + '.glb', (model: any) =>
		{
			let vehicle = this.getNewVehicleByType(model, this.type);
			vehicle.spawnPoint = this.object;

			let worldPos = new THREE.Vector3();
			let worldQuat = new THREE.Quaternion();
			this.object.getWorldPosition(worldPos);
			this.object.getWorldQuaternion(worldQuat);

			vehicle.setPosition(worldPos.x, worldPos.y + 1, worldPos.z);
			vehicle.collision.quaternion.copy(Utils.cannonQuat(worldQuat));
			world.add(vehicle);

			if (this.driver !== undefined)
			{
				world.loadingManager.loadGLTF('build/assets/boxman.glb', (charModel) =>
				{
					let character = new Character(charModel);
					world.add(character);
					character.teleportToVehicle(vehicle, vehicle.seats[0]);

					if (this.driver === 'player')
					{
						character.takeControl();
					}
					else if (this.driver === 'ai')
					{
						if (this.firstAINode !== undefined)
						{
							let nodeFound = false;
							for (const pathName in world.paths) {
								if (world.paths.hasOwnProperty(pathName)) {
									const path = world.paths[pathName];
									
									for (const nodeName in path.nodes) {
										if (Object.prototype.hasOwnProperty.call(path.nodes, nodeName)) {
											const node = path.nodes[nodeName];
											
											if (node.object.name === this.firstAINode)
											{
												character.setBehaviour(new FollowPath(node, 10));
												nodeFound = true;
											}
										}
									}
								}
							}

							if (!nodeFound)
							{
								console.error('Path node ' + this.firstAINode + 'not found.');
							}
						}
					}
				});
			}
		});
	}

	private getNewVehicleByType(model: any, type: string): Vehicle
	{
		switch (type)
		{
			case 'car': return new Car(model);
			case 'heli': return new Helicopter(model);
			case 'airplane': return new Airplane(model);
		}
	}
}