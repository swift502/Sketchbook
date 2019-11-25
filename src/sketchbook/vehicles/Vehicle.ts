import { Character } from "../characters/Character";
import { IControllable } from "../interfaces/IControllable";
import { InputController } from "../sketchbook";
import THREE = require("three");
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { World } from "../core/World";
import _ = require("lodash");
import { KeyBinding } from "../core/KeyBinding";
import { Seat } from "./Seat";
import { Wheel } from "./Wheel";

export class Vehicle extends THREE.Object3D implements IControllable, IWorldEntity
{
    public controllingCharacter: Character;
    public actions: { [action: string]: InputController; };
    public seats: Seat[] = [];
    public wheels: Wheel[] = [];

    public model: any;
    // TODO: remake to a Sketchbook Object
    public collision: CANNON.Body;
    
    private modelContainer: THREE.Group;
    private world: World;

    constructor()
    {
        super();

        this.modelContainer = new THREE.Group();
        this.add(this.modelContainer);

        // Actions
        this.actions = {
            'exitVehicle': new KeyBinding('Keyf'),
        };
    }

    public setModel(model: any): void
    {
        this.modelContainer.remove(this.model);
        this.model = model;
        this.modelContainer.add(this.model);
    }

    public update()
    {
        this.position.set(
            this.collision.position.x,
            this.collision.position.y,
            this.collision.position.z
        );

        this.rotation.setFromQuaternion(
            new THREE.Quaternion(
                this.collision.quaternion.x,
                this.collision.quaternion.y,
                this.collision.quaternion.z,
                this.collision.quaternion.w
            )
        );
    }

    public triggerAction(actionName: string, value: boolean): void
    {
        return;
    }

    public handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void
    {
        if (code === 'KeyF' && pressed === true && this.controllingCharacter !== undefined)
        {
            this.controllingCharacter.exitVehicle();
        }
    }

    public handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void
    {
        return;
    }

    public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void
    {
        this.world.cameraController.move(deltaX, deltaY);
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
        return this.seats[0].entryPoint.position;
    }

    public addToWorld(world: World): void
    {
        if (_.includes(world.vehicles, this))
        {
            console.warn('Adding character to a world in which it already exists.');
        }
        else
        {
            this.world = world;
            world.vehicles.push(this);
            world.graphicsWorld.add(this);
            world.physicsWorld.addBody(this.collision);
        }
    }

    public removeFromWorld(world: World): void
    {
        if (!_.includes(world.vehicles, this))
        {
            console.warn('Removing character from a world in which it isn\'t present.');
        }
        else
        {
            this.world = undefined;
            _.pull(world.vehicles, this);
            world.graphicsWorld.remove(this);
            world.physicsWorld.remove(this.collision);
        }
    }
}