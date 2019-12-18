import { Character } from "../characters/Character";
import { IControllable } from "../interfaces/IControllable";
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { World } from "../core/World";
import _ = require("lodash");
import { KeyBinding } from "../core/KeyBinding";
import { VehicleSeat } from "./VehicleSeat";
import { Wheel } from "./Wheel";

export class Vehicle extends THREE.Object3D implements IControllable, IWorldEntity
{
    public controllingCharacter: Character;
    public actions: { [action: string]: KeyBinding; };
    public seats: VehicleSeat[] = [];
    public wheels: Wheel[] = [];

    public model: any;
    // TODO: remake to a Sketchbook Object
    public collision: CANNON.Body;
    
    private modelContainer: THREE.Group;
    private world: World;

    public help: any;

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

        this.help = new THREE.AxesHelper(2);
    }

    public setModel(model: any): void
    {
        this.modelContainer.remove(this.model);
        this.model = model;
        this.modelContainer.add(this.model);
    }

    public update(timeStep: number): void
    {
        this.seats[0].seatObject.getWorldPosition(this.help.position);
        this.seats[0].seatObject.getWorldQuaternion(this.help.quaternion);

        // this.help.position.copy(this.seats[0].seatObject.position);
        // this.help.quaternion.copy(this.seats[0].seatObject.quaternion);

        if (this.actions.exitVehicle.justPressed && this.controllingCharacter !== undefined && this.controllingCharacter.charState.canLeaveVehicles)
        {
            this.controllingCharacter.exitVehicle();
        }

        if (this.actions.forward.isPressed)
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
        if (this.actions.backward.isPressed)
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
        if (this.actions.left.isPressed)
        {
            this.collision.angularVelocity.y += 0.5;
        }
        if (this.actions.right.isPressed)
        {
            this.collision.angularVelocity.y -= 0.5;
        }

        this.position.set(
            this.collision.interpolatedPosition.x,
            this.collision.interpolatedPosition.y,
            this.collision.interpolatedPosition.z
        );

        this.quaternion.set(
            this.collision.interpolatedQuaternion.x,
            this.collision.interpolatedQuaternion.y,
            this.collision.interpolatedQuaternion.z,
            this.collision.interpolatedQuaternion.w
        );

        // this.rotation.setFromQuaternion(
        //     new THREE.Quaternion(
        //         this.collision.interpolatedQuaternion.x,
        //         this.collision.interpolatedQuaternion.y,
        //         this.collision.interpolatedQuaternion.z,
        //         this.collision.interpolatedQuaternion.w
        //     )
        // );

        this.seats.forEach((seat: VehicleSeat) => {
            seat.update(timeStep);
        });
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

        if (action.isPressed !== value)
        {
            // Set value
            action.isPressed = value;

            // Set the 'just' attributes
            if (value) action.justPressed = true;
            else action.justReleased = true;

            this.update(0);

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

        // Make light follow vehicle (for shadows)
        this.world.dirLight.position.set(
            this.position.x + this.world.sun.x * 15,
            this.position.y + this.world.sun.y * 15,
            this.position.z + this.world.sun.z * 15);
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

            world.graphicsWorld.add(this.help);
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