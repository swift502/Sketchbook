import { World } from '../world/World';
import { EntityType } from '../enums/EntityType';
import { IUpdatable } from './IUpdatable';

export interface IWorldEntity extends IUpdatable
{
	entityType: EntityType;

	addToWorld(world: World): void;
	removeFromWorld(world: World): void;
}