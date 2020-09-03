import { World } from '../world/World';

export interface IWorldEntity {
	addToWorld(world: World): void;
	removeFromWorld(world: World): void;
}