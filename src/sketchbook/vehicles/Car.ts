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
import { SpringSimulator } from '../simulation/SpringSimulator';

export class Car extends Vehicle implements IControllable, IWorldEntity
{
    private rayCastVehicle: CANNON.RaycastVehicle;
    private wheels: Wheel[] = [];
    private wheelsDebug: THREE.Mesh[] = [];
    // private wheelBodies: CANNON.Body[] = [];
    private steeringWheel: THREE.Object3D;

    private steering: number = 0;
    private steeringSimulator: SpringSimulator;
    private gear: number = 1;

    // Transmission
    private shiftTimer: number;
    private timeToShift: number = 0.2;

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

        this.steeringSimulator = new SpringSimulator(60, 10, 0.6);
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);

        document.getElementById('car-debug').innerHTML = '';

        for (let i = 0; i < this.rayCastVehicle.wheelInfos.length; i++) {
            this.rayCastVehicle['updateWheelTransform'](i);
            let t = this.rayCastVehicle.wheelInfos[i]['worldTransform'];
            let wheelBody = this.wheelsDebug[i];
            wheelBody.position.copy(t.position);
            wheelBody.quaternion.copy(t.quaternion);
            let upAxisWorld = new CANNON.Vec3();
            this.rayCastVehicle.getVehicleAxisWorld(this.rayCastVehicle.indexUpAxis, upAxisWorld);
        }

        let quat = new THREE.Quaternion(
            this.collision.quaternion.x,
            this.collision.quaternion.y,
            this.collision.quaternion.z,
            this.collision.quaternion.w
        );
        let forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
        
        const engineForce = 4000;
        const maxGears = 4;
        const gearsMaxSpeeds = {
            '0': 0,
            '1': 4,
            '2': 8,
            '3': 12,
            '4': 16
        };
        const velocity = new CANNON.Vec3().copy(this.collision.velocity);
        const currentSpeed = velocity.dot(Utils.cannonVector(forward));

        // Engine

        if (this.shiftTimer > 0)
        {
            this.shiftTimer -= timeStep;
            if (this.shiftTimer < 0) this.shiftTimer = 0;
        }
        else
        {
            // Transmission 
            const powerFactor = (gearsMaxSpeeds[this.gear] - currentSpeed) / (gearsMaxSpeeds[this.gear] - gearsMaxSpeeds[this.gear - 1]);
                            
            if (powerFactor < 0.1 && this.gear < maxGears) this.shiftUp();
            else if (this.gear > 1 && powerFactor > 1.2) this.shiftDown();
            else
            {
                if (this.actions.throttle.isPressed)
                {
                    const force = (engineForce / this.gear) * (powerFactor ** 2);
    
                    this.rayCastVehicle.applyEngineForce(-force, 1);
                    this.rayCastVehicle.applyEngineForce(-force, 3);
    
                    document.getElementById('car-debug').innerHTML += '<br>Force: ' + Utils.round(force, 0);
                }
                if (this.actions.reverse.isPressed)
                {
                    const engineForceDivider = THREE.Math.clamp(-currentSpeed, 1, Number.POSITIVE_INFINITY);
                    const force = (engineForce * 2) / (engineForceDivider ** 4);
    
                    this.rayCastVehicle.applyEngineForce(force, 1);
                    this.rayCastVehicle.applyEngineForce(force, 3);
    
                    document.getElementById('car-debug').innerHTML += '<br>Force: ' + Utils.round(force, 0);
                }
            }

            document.getElementById('car-debug').innerHTML += '<br>Power factor: ' + Utils.round(powerFactor, 2);
        }

        document.getElementById('car-debug').innerHTML += '<br>Speed: ' + Utils.round(currentSpeed * 5, 0);
        document.getElementById('car-debug').innerHTML += '<br>Gear: ' + Utils.round(this.gear, 0);

        // Steering
        const maxSteerVal = 0.8;
        const steeringFactor = THREE.Math.clamp(currentSpeed * 0.3, 1, Number.POSITIVE_INFINITY);

        if (this.actions.right.isPressed) this.steeringSimulator.target = -maxSteerVal;
        else if (this.actions.left.isPressed) this.steeringSimulator.target = maxSteerVal;
        else this.steeringSimulator.target = 0;
        
        this.steeringSimulator.simulate(timeStep);
        this.rayCastVehicle.setSteeringValue(this.steeringSimulator.position / steeringFactor, 0);
        this.rayCastVehicle.setSteeringValue(this.steeringSimulator.position / steeringFactor, 2);
    }

    public shiftUp(): void
    {
        this.gear++;
        this.shiftTimer = this.timeToShift;

        this.rayCastVehicle.applyEngineForce(0, 1);
        this.rayCastVehicle.applyEngineForce(0, 3);
    }

    public shiftDown(): void
    {
        this.gear--;
        this.shiftTimer = this.timeToShift;

        this.rayCastVehicle.applyEngineForce(0, 1);
        this.rayCastVehicle.applyEngineForce(0, 3);
    }

    public physicsPreStep(body: CANNON.Body, car: Car): void
    {
        let quat = new THREE.Quaternion(
            body.quaternion.x,
            body.quaternion.y,
            body.quaternion.z,
            body.quaternion.w
        );

        // let right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
        // let globalUp = new THREE.Vector3(0, 1, 0);
        // let up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);
        let forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);

        const tiresHaveContact = this.rayCastVehicle['numWheelsOnGround'] > 0;

        if (this.actions.right.isPressed && !tiresHaveContact)
        {
            body.angularVelocity.x += forward.x * 0.2;
            body.angularVelocity.y += forward.y * 0.2;
            body.angularVelocity.z += forward.z * 0.2;
        }

        if (this.actions.left.isPressed && !tiresHaveContact)
        {
            body.angularVelocity.x -= forward.x * 0.2;
            body.angularVelocity.y -= forward.y * 0.2;
            body.angularVelocity.z -= forward.z * 0.2;
        }

        if (!this.actions.throttle.isPressed && !this.actions.reverse.isPressed) 
        {
            body.velocity.x *= 0.99;
            body.velocity.y *= 0.99;
            body.velocity.z *= 0.99;
        }
    }

    public onInputChange(): void
    {
        super.onInputChange();

        const brakeForce = 1000000;

        if (this.actions.throttle.justReleased || this.actions.reverse.justReleased)
        {
            this.rayCastVehicle.applyEngineForce(0, 1);
            this.rayCastVehicle.applyEngineForce(0, 3);
        }

        if (this.actions.brake.justPressed)
        {
            this.rayCastVehicle.setBrake(brakeForce, 1);
            this.rayCastVehicle.setBrake(brakeForce, 3);
        }
        if (this.actions.brake.justReleased)
        {
            this.rayCastVehicle.setBrake(0, 1);
            this.rayCastVehicle.setBrake(0, 3);
        }
    }

    public fromGLTF(gltf: any): void
    {
        this.collision = new CANNON.Body({
            mass: 50
        });
        this.collision.preStep = (body: CANNON.Body) => { this.physicsPreStep(body, this); };
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
                suspensionStiffness: 20,
                suspensionRestLength: 0.35,
                frictionSlip: 0.8,
                dampingRelaxation: 2,
                dampingCompression: 2,
                maxSuspensionForce: 100000,
                rollInfluence:  1,
                axleLocal: new CANNON.Vec3(-1, 0, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(),
                // maxSuspensionTravel: 0.3,
                rotation: Math.PI / 2,
                // useCustomSlidingRotationalSpeed: true,
                // customSlidingRotationalSpeed: 30,
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
            let wheel1 = new THREE.Mesh(cylinderGeo.clone(), defaultMat);
            let wheel2 = new THREE.Mesh(cylinderGeo.clone(), defaultMat);
            let wheel3 = new THREE.Mesh(cylinderGeo.clone(), defaultMat);
            let wheel4 = new THREE.Mesh(cylinderGeo.clone(), defaultMat);
            if (this.wheels[0].facing === 'left') wheel1.geometry.translate(0.06, 0, 0);
            if (this.wheels[0].facing === 'right') wheel1.geometry.translate(-0.06, 0, 0);
            if (this.wheels[1].facing === 'left') wheel2.geometry.translate(0.06, 0, 0);
            if (this.wheels[1].facing === 'right') wheel2.geometry.translate(-0.06, 0, 0);
            if (this.wheels[2].facing === 'left') wheel3.geometry.translate(0.06, 0, 0);
            if (this.wheels[2].facing === 'right') wheel3.geometry.translate(-0.06, 0, 0);
            if (this.wheels[3].facing === 'left') wheel4.geometry.translate(0.06, 0, 0);
            if (this.wheels[3].facing === 'right') wheel4.geometry.translate(-0.06, 0, 0);
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