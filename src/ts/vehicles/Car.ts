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
    public drive: string = 'awd';

    // private wheelsDebug: THREE.Mesh[] = [];
    private steeringWheel: THREE.Object3D;

    private steeringSimulator: SpringSimulator;
    private gear: number = 1;

    // Transmission
    private shiftTimer: number;
    private timeToShift: number = 0.2;

    constructor(gltf: any)
    {
        super(gltf, {
            radius: 0.25,
            suspensionStiffness: 20,
            suspensionRestLength: 0.35,
            frictionSlip: 0.8,
            dampingRelaxation: 2,
            dampingCompression: 2,
            rollInfluence: 0.9
        });

        this.readCarData(gltf);

        this.collision.preStep = (body: CANNON.Body) => { this.physicsPreStep(body, this); };

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

        let quat = new THREE.Quaternion(
            this.collision.quaternion.x,
            this.collision.quaternion.y,
            this.collision.quaternion.z,
            this.collision.quaternion.w
        );
        let forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
        
        const engineForce = 500;
        const maxGears = 5;
        const gearsMaxSpeeds = {
            'R': -4,
            '0': 0,
            '1': 5,
            '2': 9,
            '3': 13,
            '4': 17,
            '5': 22,
        };
        const velocity = new CANNON.Vec3().copy(this.collision.velocity);
        const currentSpeed = velocity.dot(Utils.cannonVector(forward));
        velocity.normalize();
        let driftCorrection = Utils.getSignedAngleBetweenVectors(Utils.threeVector(velocity), forward);

        // Engine
        if (this.shiftTimer > 0)
        {
            this.shiftTimer -= timeStep;
            if (this.shiftTimer < 0) this.shiftTimer = 0;
        }
        else
        {
            // Transmission 
            if (this.actions.reverse.isPressed)
            {
                const powerFactor = (gearsMaxSpeeds['R'] - currentSpeed) / Math.abs(gearsMaxSpeeds['R']);
                const force = (engineForce / this.gear) * (Math.abs(powerFactor) ** 1);

                this.applyEngineForce(force);
            }
            else
            {
                const powerFactor = (gearsMaxSpeeds[this.gear] - currentSpeed) / (gearsMaxSpeeds[this.gear] - gearsMaxSpeeds[this.gear - 1]);

                if (powerFactor < 0.1 && this.gear < maxGears) this.shiftUp();
                else if (this.gear > 1 && powerFactor > 1.2) this.shiftDown();
                else if (this.actions.throttle.isPressed)
                {
                    const force = (engineForce / this.gear) * (powerFactor ** 1);
                    this.applyEngineForce(-force);
                }
            }
        }

        // Steering
        const maxSteerVal = 0.8;
        let speedFactor = THREE.Math.clamp(currentSpeed * 0.3, 1, Number.MAX_VALUE);

        if (this.actions.right.isPressed)
        {
            let steering = Math.min(-maxSteerVal / speedFactor, -driftCorrection);
            this.steeringSimulator.target = THREE.Math.clamp(steering, -maxSteerVal, maxSteerVal);
        }
        else if (this.actions.left.isPressed)
        {
            let steering = Math.max(maxSteerVal / speedFactor, -driftCorrection);
            this.steeringSimulator.target = THREE.Math.clamp(steering, -maxSteerVal, maxSteerVal);
        }
        else this.steeringSimulator.target = 0;
        
        this.steeringSimulator.simulate(timeStep);
        this.setSteeringValue(this.steeringSimulator.position);
        this.steeringWheel.rotation.z = -this.steeringSimulator.position * 2;

        if (this.rayCastVehicle.numWheelsOnGround < 3 && Math.abs(this.collision.velocity.length()) < 0.1)
        {
            this.collision.quaternion.copy(this.collision.initQuaternion);
        }
    }

    public shiftUp(): void
    {
        this.gear++;
        this.shiftTimer = this.timeToShift;

        this.applyEngineForce(0);
    }

    public shiftDown(): void
    {
        this.gear--;
        this.shiftTimer = this.timeToShift;

        this.applyEngineForce(0);
    }

    public physicsPreStep(body: CANNON.Body, car: Car): void
    {
        let quat = new THREE.Quaternion(
            body.quaternion.x,
            body.quaternion.y,
            body.quaternion.z,
            body.quaternion.w
        );

        let forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
        const tiresHaveContact = this.rayCastVehicle.numWheelsOnGround > 0;

        // if (this.actions.right.isPressed && !tiresHaveContact)
        // {
        //     body.angularVelocity.x += forward.x * 0.2;
        //     body.angularVelocity.y += forward.y * 0.2;
        //     body.angularVelocity.z += forward.z * 0.2;
        // }

        // if (this.actions.left.isPressed && !tiresHaveContact)
        // {
        //     body.angularVelocity.x -= forward.x * 0.2;
        //     body.angularVelocity.y -= forward.y * 0.2;
        //     body.angularVelocity.z -= forward.z * 0.2;
        // }

        // if (!this.actions.throttle.isPressed && !this.actions.reverse.isPressed) 
        // {
        //     body.velocity.x *= 0.99;
        //     body.velocity.y *= 0.99;
        //     body.velocity.z *= 0.99;
        // }
    }

    public onInputChange(): void
    {
        super.onInputChange();

        const brakeForce = 1000000;

        if (this.actions.throttle.justReleased || this.actions.reverse.justReleased)
        {
            this.applyEngineForce(0);
        }
        if (this.actions.brake.justPressed)
        {
            this.setBrake(brakeForce, 'rwd');
        }
        if (this.actions.brake.justReleased)
        {
            this.setBrake(0, 'rwd');
        }
    }

    public inputReceiverInit(): void
    {
        super.inputReceiverInit();

        this.world.updateControls([
            {
                keys: ['W'],
                desc: 'Throttle'
            },
            {
                keys: ['S'],
                desc: 'Brake / Reverse'
            },
            {
                keys: ['A', 'D'],
                desc: 'Steering'
            },
            {
                keys: ['Space'],
                desc: 'Handbrake'
            },
            {
                keys: ['F'],
                desc: 'Exit vehicle'
            },
        ]);
    }

    public readCarData(gltf: any): void
    {
        gltf.scene.traverse((child) => {
            if (child.hasOwnProperty('userData'))
            {
                if (child.userData.hasOwnProperty('data'))
                {
                    if (child.userData.data === 'steering_wheel')
                    {
                        this.steeringWheel = child;
                    }
                }
            }
        });
    }
}