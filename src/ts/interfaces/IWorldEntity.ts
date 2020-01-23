import { World } from "../core/World";

export interface IWorldEntity {
    addToWorld(world: World): void;
    removeFromWorld(world: World): void;
}