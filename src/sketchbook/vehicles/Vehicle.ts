import { Character } from "../characters/Character";
import { IControllable } from "../interfaces/IControllable";
import { InputController } from "../sketchbook";
import * as THREE from 'three';
import * as CANNON from 'cannon';
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
            'forward': new KeyBinding('KeyW'),
            'backward': new KeyBinding('KeyS'),
            'left': new KeyBinding('KeyA'),
            'right': new KeyBinding('KeyD'),
            'exitVehicle': new KeyBinding('KeyF'),
        };
    }

    public setModel(model: any): void
    {
        this.modelContainer.remove(this.model);
        this.model = model;
        this.modelContainer.add(this.model);
    }

    public update(): void
    {
        if (this.actions.exitVehicle.justPressed && this.controllingCharacter !== undefined && this.controllingCharacter.charState.canLeaveVehicles)
        {
            this.controllingCharacter.exitVehicle();
        }

        if (this.actions.forward.value)
        {
            let quat = new THREE.Quaternion(
                this.collision.quaternion.x,
                this.collision.quaternion.y,
                this.collision.quaternion.z,
                this.collision.quaternion.w
            );

            let dir = new THREE.Vector3(0, 0, 0.3);

            dir.applyQuaternion(quat);

            this.collision.velocity.x +=  dir.x;
            this.collision.velocity.y +=  dir.y;
            this.collision.velocity.z +=  dir.z;
        }
        if (this.actions.backward.value)
        {
            let quat = new THREE.Quaternion(
                this.collision.quaternion.x,
                this.collision.quaternion.y,
                this.collision.quaternion.z,
                this.collision.quaternion.w
            );

            let dir = new THREE.Vector3(0, 0, -0.3);

            dir.applyQuaternion(quat);

            this.collision.velocity.x +=  dir.x;
            this.collision.velocity.y +=  dir.y;
            this.collision.velocity.z +=  dir.z;
        }
        if (this.actions.left.value)
        {
            this.collision.angularVelocity.y += 0.5;
        }
        if (this.actions.right.value)
        {
            this.collision.angularVelocity.y -= 0.5;
        }

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

    public handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void
    {
        for (const action in this.actions) {
            if (this.actions.hasOwnProperty(action)) {
                const binding = this.actions[action];

                if (code === binding.keyCode)
                {
                    this.triggerAction(action, pressed);
                }
            }
        }
    }
    
    public triggerAction(actionName: string, value: boolean): void
    {
        // Get action and set it's parameters
        let action = this.actions[actionName];

        if (action.value !== value)
        {
            // Set value
            action.value = value;

            // Set the 'just' attributes
            if (value) action.justPressed = true;
            else action.justReleased = true;

            this.update();

            // Reset the 'just' attributes
            action.justPressed = false;
            action.justReleased = false;
        }
    }

    public handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void
    {
        return;
    }

    public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void
    {
        this.world.cameraOperator.move(deltaX, deltaY);
    }

    public handleMouseWheel(event: WheelEvent, value: number): void
    {
        return;
    }

    public inputReceiverInit(): void
    {
        this.world.cameraOperator.setRadius(2.4);
    }

    public inputReceiverUpdate(timeStep: number): void
    {
        // Position camera
        this.world.cameraOperator.target.set(
            this.position.x,
            this.position.y + 1,
            this.position.z
        );
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