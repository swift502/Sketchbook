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
import { VehicleDoor } from "./VehicleDoor";

export abstract class Vehicle extends THREE.Object3D implements IControllable, IWorldEntity
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

        this.seats.forEach((seat: VehicleSeat) => {
            seat.update(timeStep);
        });
    }

    public onInputChange(): void
    {
        if (this.actions.exitVehicle.justPressed && this.controllingCharacter !== undefined && this.controllingCharacter.charState.canLeaveVehicles)
        {
            this.controllingCharacter.exitVehicle();
        }
    }

    public resetControls(): void
    {
        for (const action in this.actions) {
            if (this.actions.hasOwnProperty(action)) {
                this.triggerAction(action, false);
            }
        }
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

            this.onInputChange();

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

        this.world.sky.updateSkyCenter(this.position);
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

    public setPosition(x: number, y: number, z: number): void
    {
        this.collision.position.x = x;
        this.collision.position.y = y;
        this.collision.position.z = z;
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

    public readGLTF(gltf: any): void
    {
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }

            if (child.hasOwnProperty('userData'))
            {
                if (child.userData.hasOwnProperty('data'))
                {
                    if (child.userData.data === 'wheel')
                    {
                        let wheel = new Wheel();

                        if (child.userData.hasOwnProperty('facing')) 
                        {
                            wheel.facing = child.userData.facing;
                        }
                        else
                        {
                            console.error("Wheel object " + child + " has no facing property.");
                        }
                        if (child.userData.hasOwnProperty('steering')) 
                        {
                            wheel.steering = (child.userData.steering === "true");
                        }

                        this.wheels.push(wheel);
                    }
                    if (child.userData.data === 'seat')
                    {
                        let seat = new VehicleSeat(child);
                        seat.vehicle = this;

                        if (child.userData.hasOwnProperty('door_object')) 
                        {
                            seat.door = new VehicleDoor(gltf.scene.getObjectByName(child.userData.door_object));
                        }

                        if (child.userData.hasOwnProperty('door_side')) 
                        {
                            seat.doorSide = child.userData.door_side;
                        }
                        else
                        {
                            console.error("Seat object " + child + " has no doorSide property.");
                        }

                        if (child.userData.hasOwnProperty('entry_point')) 
                        {
                            seat.entryPoint = gltf.scene.getObjectByName(child.userData.entry_point);
                        }
                        else
                        {
                            console.error("Seat object " + child + " has no entry point reference property.");
                        }

                        if (child.userData.hasOwnProperty('seat_type')) 
                        {
                            seat.type = child.userData.seat_type;
                        }
                        else
                        {
                            console.error("Seat object " + child + " has no seat type property.");
                        }

                        this.seats.push(seat);
                    }
                    if (child.userData.data === 'collision')
                    {
                        if (child.userData.shape === 'box')
                        {
                            child.visible = false;

                            let phys = new CANNON.Box(new CANNON.Vec3(child.scale.x, child.scale.y, child.scale.z));
                            this.collision.addShape(phys, new CANNON.Vec3(child.position.x, child.position.y, child.position.z));
                        }
                    }
                    if (child.userData.data === 'navmesh')
                    {
                        child.visible = false;
                    }
                }
                if (child.userData.hasOwnProperty('texture'))
                {
                    child.material = new THREE.MeshLambertMaterial({
                    map: new THREE.TextureLoader().load('../build/graphics/' + child.userData.texture)
                });
                }
            }
        });

        if (this.collision.shapes.length === 0)
        {
            console.warn("Vehicle " + typeof(this) + " has no collision data.");
        }
        if (this.seats.length === 0)
        {
            console.warn("Vehicle " + typeof(this) + " has no seats.");
        }
    }
}