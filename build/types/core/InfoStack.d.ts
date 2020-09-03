import { InfoStackMessage } from './InfoStackMessage';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { EntityType } from '../enums/EntityType';
import { World } from '../world/World';
export declare class InfoStack implements IWorldEntity {
    updateOrder: number;
    entityType: EntityType;
    messages: InfoStackMessage[];
    entranceAnimation: string;
    exitAnimation: string;
    messageDuration: number;
    addMessage(text: string): void;
    update(timeStep: number): void;
    addToWorld(world: World): void;
    removeFromWorld(world: World): void;
}
