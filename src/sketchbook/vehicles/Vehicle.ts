import { Character } from "../characters/Character";
import { IControllable } from "../interfaces/IControllable";
import { InputController } from "../sketchbook";
import THREE = require("three");
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { World } from "../core/World";
import _ = require("lodash");

export class Vehicle extends THREE.Object3D implements IControllable, IWorldEntity
{
    public controllingCharacter: Character;
    public actions: { [action: string]: InputController; };
    // public mountPoints: THREE.Object3D[];

    public triggerAction(actionName: string, value: boolean): void
    {
        return;
    }

    public handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void
    {
        return;
    }

    public handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void
    {
        return;
    }

    public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void
    {
        return;
    }

    public handleMouseWheel(event: WheelEvent, value: number): void
    {
        return;
    }

    public inputReceiverInit(): void
    {
        return;
    }

    public inputReceiverUpdate(timeStep: number): void
    {
        return;
    }

    public getMountPoint(character: Character): THREE.Vector3
    {
        return this.position;
    }

    public addToWorld(world: World): void
    {
        world.vehicles.push(this);
    }

    public removeFromWorld(world: World): void
    {
        _.pull(world.vehicles, this);
    }
}