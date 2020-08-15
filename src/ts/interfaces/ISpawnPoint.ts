import { World } from '../core/World';

export interface ISpawnPoint
{
	spawn(world: World): void;
}