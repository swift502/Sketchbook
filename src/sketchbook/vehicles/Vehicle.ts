import { Character } from '../characters/Character';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { World } from '../core/World';
import _ = require('lodash');
import { KeyBinding } from '../core/KeyBinding';
import { VehicleSeat } from './VehicleSeat';
import { Wheel } from './Wheel';
import { VehicleDoor } from './VehicleDoor';
import * as Utils from '../core/Utilities';

export abstract class Vehicle extends THREE.Object3D
{
    public controllingCharacter: Character;
    public actions: { [action: string]: KeyBinding; } = {};
    public rayCastVehicle: CANNON.RaycastVehicle;
    public seats: VehicleSeat[] = [];
    public wheels: Wheel[] = [];
    public drive: string;

    public camera: any;
    private firstPerson: boolean = false;

    public model: any;
    public world: World;

    public help: THREE.AxesHelper;

    // TODO: remake to a Sketchbook Object
    public collision: CANNON.Body;
    private modelContainer: THREE.Group;

    constructor(gltf: any, handlingSetup?: any)
    {
        super();

        if (handlingSetup === undefined) handlingSetup = {};
        handlingSetup.chassisConnectionPointLocal = new CANNON.Vec3(),
        handlingSetup.axleLocal = new CANNON.Vec3(-1, 0, 0);
        handlingSetup.directionLocal = new CANNON.Vec3(0, -1, 0);

        this.modelContainer = new THREE.Group();
        this.add(this.modelContainer);

        // Collision body
        this.collision = new CANNON.Body({
            mass: 50
        });
        let mat = new CANNON.Material('Mat');
        mat.friction = 0.01;
        this.collision.material = mat;

        // Read GLTF
        this.readVehicleData(gltf);
        this.setModel(gltf.scene);

        // Raycast vehicle component
        this.rayCastVehicle = new CANNON.RaycastVehicle({
            chassisBody: this.collision,
            indexUpAxis: 1,
            indexRightAxis: 0,
            indexForwardAxis: 2
        });

        this.wheels.forEach((wheel) =>
        {
            handlingSetup.chassisConnectionPointLocal.set(wheel.position.x, wheel.position.y + 0.2, wheel.position.z);
            const index = this.rayCastVehicle.addWheel(handlingSetup);
            wheel.rayCastWheelInfoIndex = index;
        });

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
        this.help.position.copy(Utils.threeVector(this.collision.interpolatedPosition));
        this.help.quaternion.copy(Utils.threeQuat(this.collision.interpolatedQuaternion));

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

        for (let i = 0; i < this.rayCastVehicle.wheelInfos.length; i++)
        {
            this.rayCastVehicle.updateWheelTransform(i);
            let transform = this.rayCastVehicle.wheelInfos[i].worldTransform;

            let wheelObject = this.wheels[i].wheelObject;
            wheelObject.position.copy(Utils.threeVector(transform.position));
            wheelObject.quaternion.copy(Utils.threeQuat(transform.quaternion));

            let upAxisWorld = new CANNON.Vec3();
            this.rayCastVehicle.getVehicleAxisWorld(this.rayCastVehicle.indexUpAxis, upAxisWorld);
        }
    }

    public onInputChange(): void
    {
        if (this.actions.exitVehicle.justPressed && this.controllingCharacter !== undefined && this.controllingCharacter.charState.canLeaveVehicles)
        {
            this.controllingCharacter.modelContainer.visible = true;
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
        // Free camera
        if (code === 'KeyC' && pressed === true && event.shiftKey === true)
        {
            this.resetControls();
            this.world.cameraOperator.characterCaller = this.controllingCharacter;
            this.world.inputManager.setInputReceiver(this.world.cameraOperator);
        }
        else if (code === 'KeyC')
        {
            this.firstPerson = true;
            this.world.cameraOperator.setRadius(0, true);
            this.controllingCharacter.modelContainer.visible = false;
        }
        else
        {
            for (const action in this.actions) {
                if (this.actions.hasOwnProperty(action)) {
                    const binding = this.actions[action];

                    if (_.includes(binding.eventCodes, code))
                    {
                        this.triggerAction(action, pressed);
                    }
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

            // Reset the 'just' attributes
            action.justPressed = false;
            action.justReleased = false;

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
        this.world.scrollTheTimeScale(value);
    }

    public inputReceiverInit(): void
    {
        this.world.cameraOperator.setRadius(3);
    }

    public inputReceiverUpdate(timeStep: number): void
    {
        if (this.firstPerson)
        {
            // this.world.cameraOperator.target.set(
            //     this.position.x + this.camera.position.x,
            //     this.position.y + this.camera.position.y,
            //     this.position.z + this.camera.position.z
            // );

            let temp = new THREE.Vector3().copy(this.camera.position);
            temp.applyQuaternion(this.quaternion);
            this.world.cameraOperator.target.copy(temp.add(this.position));
        }
        else
        {
            // Position camera
            this.world.cameraOperator.target.set(
                this.position.x,
                this.position.y + 0.5,
                this.position.z
            );
        }
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
        else if (this.rayCastVehicle === undefined)
        {
            console.error('Trying to create vehicle without raycastVehicleComponent');
        }
        else
        {
            this.world = world;
            world.vehicles.push(this);
            world.graphicsWorld.add(this);
            // world.physicsWorld.addBody(this.collision);
            this.rayCastVehicle.addToWorld(world.physicsWorld);
            world.graphicsWorld.add(this.help);

            this.wheels.forEach((wheel) =>
            {
                this.world.graphicsWorld.attach(wheel.wheelObject);
            });
        }
    }

    public setPosition(x: number, y: number, z: number): void
    {
        this.collision.position.x = x;
        this.collision.position.y = y;
        this.collision.position.z = z;
    }

    public setSteeringValue(val: number): void
    {
        this.wheels.forEach((wheel) =>
        {
            if (wheel.steering) this.rayCastVehicle.setSteeringValue(val, wheel.rayCastWheelInfoIndex);
        });
    }

    public applyEngineForce(force: number): void
    {
        this.wheels.forEach((wheel) =>
        {
            if (this.drive === wheel.drive || this.drive === 'awd')
            {
                this.rayCastVehicle.applyEngineForce(force, wheel.rayCastWheelInfoIndex);
            }
        });
    }

    public setBrake(brakeForce: number, driveFilter?: string): void
    {
        this.wheels.forEach((wheel) =>
        {
            if (driveFilter === undefined || driveFilter === wheel.drive)
            {
                this.rayCastVehicle.setBrake(brakeForce, wheel.rayCastWheelInfoIndex);
            }
        });
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

    public readVehicleData(gltf: any): void
    {
        gltf.scene.traverse((child) => {

            if (child.isMesh)
            {
                Utils.setupMeshProperties(child);
            }

            if (child.hasOwnProperty('userData'))
            {
                if (child.userData.hasOwnProperty('data'))
                {
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
                            console.error('Seat object ' + child + ' has no doorSide property.');
                        }

                        if (child.userData.hasOwnProperty('entry_point')) 
                        {
                            seat.entryPoint = gltf.scene.getObjectByName(child.userData.entry_point);
                        }
                        else
                        {
                            console.error('Seat object ' + child + ' has no entry point reference property.');
                        }

                        if (child.userData.hasOwnProperty('seat_type')) 
                        {
                            seat.type = child.userData.seat_type;
                        }
                        else
                        {
                            console.error('Seat object ' + child + ' has no seat type property.');
                        }

                        this.seats.push(seat);
                    }
                    if (child.userData.data === 'camera')
                    {
                        this.camera = child;
                    }
                    if (child.userData.data === 'wheel')
                    {
                        let wheel = new Wheel(child);

                        wheel.position = child.position;

                        if (child.userData.hasOwnProperty('steering')) 
                        {
                            wheel.steering = (child.userData.steering === 'true');
                        }

                        if (child.userData.hasOwnProperty('drive')) 
                        {
                            wheel.drive = child.userData.drive;
                        }

                        this.wheels.push(wheel);
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
            }
        });

        if (this.collision.shapes.length === 0)
        {
            console.warn('Vehicle ' + typeof(this) + ' has no collision data.');
        }
        if (this.seats.length === 0)
        {
            console.warn('Vehicle ' + typeof(this) + ' has no seats.');
        }
    }
}