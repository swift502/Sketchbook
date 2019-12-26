import * as CANNON from 'cannon';

import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { KeyBinding } from '../core/KeyBinding';
import { Wheel } from './Wheel';
import _ = require('lodash');
import { World } from '../core/World';
import THREE = require('three');
import * as Utils from '../core/Utilities';

export class Car extends Vehicle implements IControllable, IWorldEntity
{
    private rayCastVehicle: CANNON.RaycastVehicle;
    private wheels: Wheel[] = [];
    private wheelsDebug: THREE.Mesh[] = [];
    // private wheelBodies: CANNON.Body[] = [];
    private steeringWheel: THREE.Object3D;

    constructor()
    {
        super();

        this.actions = {
            'throttle': new KeyBinding('KeyW'),
            'reverse': new KeyBinding('KeyS'),
            'brake': new KeyBinding('Space'),
            'left': new KeyBinding('KeyA'),
            'right': new KeyBinding('KeyD'),
            'exitVehicle': new KeyBinding('KeyF'),
        };
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);

        for (let i = 0; i < this.rayCastVehicle.wheelInfos.length; i++) {
            this.rayCastVehicle['updateWheelTransform'](i);
            let t = this.rayCastVehicle.wheelInfos[i]['worldTransform'];
            let wheelBody = this.wheelsDebug[i];
            wheelBody.position.copy(t.position);
            wheelBody.quaternion.copy(t.quaternion);
            // if(i === 0) console.log(this.rayCastVehicle.wheelInfos[i].rotation);
            // wheelBody.rotateY(Math.PI / 2);
            let upAxisWorld = new CANNON.Vec3();
            this.rayCastVehicle.getVehicleAxisWorld(this.rayCastVehicle.indexUpAxis, upAxisWorld);
            // wheelBody.rotateOnWorldAxis(Utils.threeVector(upAxisWorld), -Math.PI / 2);
        }
    }

    public onInputChange(): void
    {
        super.onInputChange();

        const maxSteerVal = 0.8;
        const maxForce = 50;
        const brakeForce = 1000000;

        if (this.actions.throttle.justPressed)
        {
            this.rayCastVehicle.applyEngineForce(-maxForce, 1);
            this.rayCastVehicle.applyEngineForce(-maxForce, 3);
        }
        if (this.actions.reverse.justPressed)
        {
            this.rayCastVehicle.applyEngineForce(maxForce, 1);
            this.rayCastVehicle.applyEngineForce(maxForce, 3);
        }
        if (this.actions.throttle.justReleased || this.actions.reverse.justReleased)
        {
            this.rayCastVehicle.applyEngineForce(0, 1);
            this.rayCastVehicle.applyEngineForce(0, 3);
        }

        if (this.actions.brake.justPressed)
        {
            this.rayCastVehicle.setBrake(brakeForce, 0);
            this.rayCastVehicle.setBrake(brakeForce, 1);
            this.rayCastVehicle.setBrake(brakeForce, 2);
            this.rayCastVehicle.setBrake(brakeForce, 3);
        }
        if (this.actions.brake.justReleased)
        {
            this.rayCastVehicle.setBrake(0, 0);
            this.rayCastVehicle.setBrake(0, 1);
            this.rayCastVehicle.setBrake(0, 2);
            this.rayCastVehicle.setBrake(0, 3);
        }

        if (this.actions.right.isPressed)
        {
            this.rayCastVehicle.setSteeringValue(-maxSteerVal, 0);
            this.rayCastVehicle.setSteeringValue(-maxSteerVal, 2);
        }
        if (this.actions.right.justReleased)
        {
            this.rayCastVehicle.setSteeringValue(0, 0);
            this.rayCastVehicle.setSteeringValue(0, 2);
        }

        if (this.actions.left.justPressed)
        {
            this.rayCastVehicle.setSteeringValue(maxSteerVal, 0);
            this.rayCastVehicle.setSteeringValue(maxSteerVal, 2);
        }
        if (this.actions.left.justReleased)
        {
            this.rayCastVehicle.setSteeringValue(0, 0);
            this.rayCastVehicle.setSteeringValue(0, 2);
        }
    }

    public fromGLTF(gltf: any): void
    {
        this.collision = new CANNON.Body({
            mass: 10
        });
        let mat = new CANNON.Material('Mat');
        mat.friction = 0.01;
        this.collision.material = mat;

        this.readGLTF(gltf);
        this.setModel(gltf.scene);
    }

    public readGLTF(gltf: any): void
    {
        super.readGLTF(gltf);

        gltf.scene.traverse((child) => {
            if (child.hasOwnProperty('userData'))
            {
                if (child.userData.hasOwnProperty('data'))
                {
                    if (child.userData.data === 'steering_wheel')
                    {
                        this.steeringWheel = child;
                    }
                    if (child.userData.data === 'wheel')
                    {
                        let wheel = new Wheel();

                        wheel.position = child.position;

                        if (child.userData.hasOwnProperty('facing')) 
                        {
                            wheel.facing = child.userData.facing;
                        }
                        else
                        {
                            console.error('Wheel object ' + child + ' has no facing property.');
                        }
                        if (child.userData.hasOwnProperty('steering')) 
                        {
                            wheel.steering = (child.userData.steering === 'true');
                        }

                        this.wheels.push(wheel);
                    }
                }
            }
        });
    }

    // TODO: also add removeWorld
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
            
            world.graphicsWorld.add(this.help);
            
            const options = {
                radius: 0.25,
                directionLocal: new CANNON.Vec3(0, -1, 0),
                suspensionStiffness: 10,
                suspensionRestLength: 0.6,
                frictionSlip: 0.9,
                dampingRelaxation: 1,
                dampingCompression: 1,
                maxSuspensionForce: 100000,
                rollInfluence:  1,
                axleLocal: new CANNON.Vec3(-1, 0, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(),
                maxSuspensionTravel: 0.3,
                rotation: Math.PI / 2,
                useCustomSlidingRotationalSpeed: true,
                customSlidingRotationalSpeed: -0.01,
            };

            // Create the vehicle
            let vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.collision,
                indexUpAxis: 1,
                indexRightAxis: 0,
                // @ts-ignore
                indexForwardAxis: 2
            });

            // Debug
            let cylinderGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 12);
            cylinderGeo.rotateZ(Math.PI / 2);
            let defaultMat = new THREE.MeshLambertMaterial();
            let wheel1 = new THREE.Mesh(cylinderGeo, defaultMat);
            let wheel2 = new THREE.Mesh(cylinderGeo, defaultMat);
            let wheel3 = new THREE.Mesh(cylinderGeo, defaultMat);
            let wheel4 = new THREE.Mesh(cylinderGeo, defaultMat);
            wheel1.castShadow = true;
            wheel1.receiveShadow = true;
            wheel2.castShadow = true;
            wheel2.receiveShadow = true;
            wheel3.castShadow = true;
            wheel3.receiveShadow = true;
            wheel4.castShadow = true;
            wheel4.receiveShadow = true;
            world.graphicsWorld.add(wheel1);
            world.graphicsWorld.add(wheel2);
            world.graphicsWorld.add(wheel3);
            world.graphicsWorld.add(wheel4);
            this.wheelsDebug.push(wheel1);
            this.wheelsDebug.push(wheel2);
            this.wheelsDebug.push(wheel3);
            this.wheelsDebug.push(wheel4);

            options.chassisConnectionPointLocal.set(this.wheels[0].position.x, this.wheels[0].position.y + 0.2, this.wheels[0].position.z);
            vehicle.addWheel(options);
            options.chassisConnectionPointLocal.set(this.wheels[1].position.x, this.wheels[1].position.y + 0.2, this.wheels[1].position.z);
            vehicle.addWheel(options);
            options.chassisConnectionPointLocal.set(this.wheels[2].position.x, this.wheels[2].position.y + 0.2, this.wheels[2].position.z);
            vehicle.addWheel(options);
            options.chassisConnectionPointLocal.set(this.wheels[3].position.x, this.wheels[3].position.y + 0.2, this.wheels[3].position.z);
            vehicle.addWheel(options);

            this.rayCastVehicle = vehicle;
            // world.physicsWorld.addBody(this.collision);
            this.rayCastVehicle.addToWorld(world.physicsWorld);
        }
    }
}