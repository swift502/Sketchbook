import * as CANNON from 'cannon';

import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { KeyBinding } from '../core/KeyBinding';
import { SpringSimulator } from '../simulation/SpringSimulator';
import { Euler } from 'three';
import THREE = require('three');
import * as Utils from '../core/Utilities';

export class Airplane extends Vehicle implements IControllable, IWorldEntity
{
    public rotor: THREE.Object3D;
    public leftAileron: THREE.Object3D;
    public rightAileron: THREE.Object3D;
    public elevators: THREE.Object3D[] = [];
    public rudder: THREE.Object3D;

    private steeringSimulator: SpringSimulator; 
    private aileronSimulator: SpringSimulator;
    private elevatorSimulator: SpringSimulator;
    private rudderSimulator: SpringSimulator;

    private enginePower: number = 0;

    // private engineRPM: number = 0;
    private lastDrag: number = 0;

    constructor(gltf: any)
    {
        super(gltf, {
            radius: 0.12,
            suspensionStiffness: 150,
            suspensionRestLength: 0.25,
            dampingRelaxation: 5,
            dampingCompression: 5,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            axleLocal: new CANNON.Vec3(-1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(),
        });

        this.readAirplaneData(gltf);

        this.collision.preStep = (body: CANNON.Body) => { this.physicsPreStep(body, this); };

        this.actions = {
            'throttle': new KeyBinding('KeyW'),
            'brake': new KeyBinding('KeyS'),
            'wheelBrake': new KeyBinding('Space'),
            'pitchUp': new KeyBinding('ArrowDown'),
            'pitchDown': new KeyBinding('ArrowUp'),
            'yawLeft': new KeyBinding('KeyQ'),
            'yawRight': new KeyBinding('KeyE'),
            'rollLeft': new KeyBinding('ArrowLeft', 'KeyA'),
            'rollRight': new KeyBinding('ArrowRight', 'KeyD'),
            'exitVehicle': new KeyBinding('KeyF'),
        };

        this.steeringSimulator = new SpringSimulator(60, 10, 0.6); 
        this.aileronSimulator = new SpringSimulator(60, 5, 0.6);
        this.elevatorSimulator = new SpringSimulator(60, 7, 0.6);
        this.rudderSimulator = new SpringSimulator(60, 10, 0.6);
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);
        
        // Rotors visuals
        if (this.controllingCharacter !== undefined)
        {
            if (this.enginePower < 1) this.enginePower += timeStep * 0.4;
            if (this.enginePower > 1) this.enginePower = 1;
        }
        else
        {
            if (this.enginePower > 0) this.enginePower -= timeStep * 0.12;
            if (this.enginePower < 0) this.enginePower = 0;
        }
        this.rotor.rotateX(this.enginePower);

        // if (this.actions.throttle.isPressed)
        // {
        //     this.engineRPM += 0.1 * timeStep;
        //     if (this.engineRPM > 1.3) this.engineRPM = 1.3;
        // }
        // else
        // {
        //     if (this.engineRPM > 1) this.engineRPM = 1;
        // }
        // if (this.actions.brake.isPressed)
        // {
        //     this.engineRPM -= 0.1 * timeStep;
        //     if (this.engineRPM < 0) this.engineRPM = 0;
        // }

        // Steering
        if (this.rayCastVehicle.numWheelsOnGround > 0)
        {
            if ((this.actions.yawLeft.isPressed || this.actions.rollLeft.isPressed)
                && !this.actions.yawRight.isPressed && !this.actions.rollRight.isPressed)
            {
                this.steeringSimulator.target = 0.8;
            }
            else if ((this.actions.yawRight.isPressed || this.actions.rollRight.isPressed)
                && !this.actions.yawLeft.isPressed && !this.actions.rollLeft.isPressed)
            {
                this.steeringSimulator.target = -0.8;
            }
            else
            {
                this.steeringSimulator.target = 0;
            }
        }
        else
        {
            this.steeringSimulator.target = 0;
        }
        this.steeringSimulator.simulate(timeStep);
        this.setSteeringValue(this.steeringSimulator.position);

        // Moving parts
        const partsRotationAmount = 0.7;
        // Ailerons
        if (this.actions.rollLeft.isPressed && !this.actions.rollRight.isPressed)
        {
            this.aileronSimulator.target = partsRotationAmount;
        }
        else if (!this.actions.rollLeft.isPressed && this.actions.rollRight.isPressed)
        {
            this.aileronSimulator.target = -partsRotationAmount;
        }
        else 
        {
            this.aileronSimulator.target = 0;
        }

        // Elevators
        if (this.actions.pitchUp.isPressed && !this.actions.pitchDown.isPressed)
        {
            this.elevatorSimulator.target = partsRotationAmount;
        }
        else if (!this.actions.pitchUp.isPressed && this.actions.pitchDown.isPressed)
        {
            this.elevatorSimulator.target = -partsRotationAmount;
        }
        else
        {
            this.elevatorSimulator.target = 0;
        }

        // Rudder
        if (this.actions.yawLeft.isPressed && !this.actions.yawRight.isPressed)
        {
            this.rudderSimulator.target = partsRotationAmount;
        }
        else if (!this.actions.yawLeft.isPressed && this.actions.yawRight.isPressed)
        {
            this.rudderSimulator.target = -partsRotationAmount;
        }
        else 
        {
            this.rudderSimulator.target = 0;
        }

        // Run rotation simulators
        this.aileronSimulator.simulate(timeStep);
        this.elevatorSimulator.simulate(timeStep);
        this.rudderSimulator.simulate(timeStep);

        // Rotate parts
        this.leftAileron.rotation.y = this.aileronSimulator.position;
        this.rightAileron.rotation.y = -this.aileronSimulator.position;
        this.elevators.forEach((elevator) =>
        {
            elevator.rotation.y = this.elevatorSimulator.position;
        });
        this.rudder.rotation.y = this.rudderSimulator.position;
    }

    public physicsPreStep(body: CANNON.Body, plane: Airplane): void
    {
        let simulatedVelocity = new CANNON.Vec3();
        let flightVelocity = new CANNON.Vec3();

        let quat = new THREE.Quaternion(
            body.quaternion.x,
            body.quaternion.y,
            body.quaternion.z,
            body.quaternion.w
        );

        let right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
        let globalUp = new THREE.Vector3(0, 1, 0);
        let up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);
        let forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
        
        const velocity = new CANNON.Vec3().copy(this.collision.velocity);
        const currentSpeed = velocity.dot(Utils.cannonVector(forward));

        // let flightModeBottomSpeed = 5;
        // let flightModeTopSpeed = 15;

        // let gravity = plane.world.physicsWorld.gravity;
        // let gravityCompensation = new CANNON.Vec3(
        //     -gravity.x * plane.world.physicsFrameTime,
        //     -gravity.y * plane.world.physicsFrameTime,
        //     -gravity.z * plane.world.physicsFrameTime);
        // gravityCompensation *= 0.98;

        // body.velocity.x += gravityCompensation.x * flightModeInfluence;
        // body.velocity.y += gravityCompensation.y * flightModeInfluence;
        // body.velocity.z += gravityCompensation.z * flightModeInfluence;

        document.getElementById('car-debug').innerHTML = Utils.round(currentSpeed, 2) + '';

        // Throttle
        // body.velocity.x += forward.x * this.enginePower * this.engineRPM * 0.2;
        // body.velocity.y += forward.y * this.enginePower * this.engineRPM * 0.2;
        // body.velocity.z += forward.z * this.enginePower * this.engineRPM * 0.2;

        // document.getElementById('car-debug').innerHTML += '<br>' + Utils.round(this.engineRPM, 2) + '';

        // Vertical stabilization
        // let gravity = plane.world.physicsWorld.gravity;
        // let gravityCompensation = new CANNON.Vec3(-gravity.x, -gravity.y, -gravity.z).length();
        // gravityCompensation *= plane.world.physicsFrameTime;
        // gravityCompensation *= 0.98;
        // let dot = globalUp.dot(up);
        // gravityCompensation *= THREE.Math.clamp(Math.sqrt(dot), 0, 1);

        // let vertDamping = Utils.threeVector(body.velocity);
        // vertDamping.x *= up.x;
        // vertDamping.y *= up.y;
        // vertDamping.z *= up.z;
        // vertDamping.multiplyScalar(-0.01);

        // let vertStab = up.clone();
        // vertStab.multiplyScalar((gravityCompensation));
        // vertStab.multiplyScalar(Math.pow(plane.enginePower, 3));
        // vertStab.add(vertDamping);

        // body.velocity.x += vertStab.x;
        // body.velocity.y += vertStab.y;
        // body.velocity.z += vertStab.z;
        
        // let idealVelocity = forward.clone().multiplyScalar(velLength);
        // let idealVelDifference = new CANNON.Vec3();
        // Utils.cannonVector(idealVelocity).vsub(body.velocity, idealVelDifference);

        // body.velocity.x += idealVelDifference.x * flightModeInfluence;
        // body.velocity.y += idealVelDifference.y * flightModeInfluence;
        // body.velocity.z += idealVelDifference.z * flightModeInfluence;

        // let  = Utils.cannonVector(new THREE.Vector3().lerpVectors(
        //     Utils.threeVector(body.velocity),
            
        //     flightModeInfluence
        // ));

        let velLength1 = body.velocity.length();
        let speedModifier = 0.03;
        if (plane.actions.throttle.isPressed && !plane.actions.brake.isPressed)
        {
            speedModifier = 0.08;
        }
        else if (!plane.actions.throttle.isPressed && plane.actions.brake.isPressed)
        {
            speedModifier = -0.08;
        }
        else if (this.rayCastVehicle.numWheelsOnGround > 0)
        {
            speedModifier = 0;
        }

        body.velocity.x += (velLength1 * this.lastDrag + speedModifier) * forward.x * this.enginePower;
        body.velocity.y += (velLength1 * this.lastDrag + speedModifier) * forward.y * this.enginePower;
        body.velocity.z += (velLength1 * this.lastDrag + speedModifier) * forward.z * this.enginePower;

        // Drag

        let velLength2 = body.velocity.length();
        const drag = Math.pow(velLength2, 1) * 0.005;
        body.velocity.x -= body.velocity.x * drag;
        body.velocity.y -= body.velocity.y * drag;
        body.velocity.z -= body.velocity.z * drag;
        this.lastDrag = drag;

        document.getElementById('car-debug').innerHTML += '<br>' + Utils.round(drag, 2) + '';

        // Lift
        const lift = Math.pow(velLength2, 1) * 0.01;
        body.velocity.x += up.x * lift;
        body.velocity.y += up.y * lift;
        body.velocity.z += up.z * lift;

        // if (body.velocity.length() > )

        // let flightModeInfluence = drag

        let flightModeBottomSpeed = 3;
        let flightModeTopSpeed = 10;

        let flightModeInfluence = (currentSpeed - flightModeBottomSpeed) / (flightModeTopSpeed - flightModeBottomSpeed);
        flightModeInfluence = THREE.Math.clamp(flightModeInfluence, 0, 1);
        flightModeInfluence = Math.pow(flightModeInfluence, 2);

        // Rotation stabilization
        let lookVelocity = body.velocity.clone();
        lookVelocity.y = forward.y * body.velocity.length();
        let rotStabVelocity = new THREE.Quaternion().setFromUnitVectors(forward, Utils.threeVector(lookVelocity));
        rotStabVelocity.x *= 0.3;
        rotStabVelocity.y *= 0.3;
        rotStabVelocity.z *= 0.3;
        rotStabVelocity.w *= 0.3;
        let rotStabEuler = new THREE.Euler().setFromQuaternion(rotStabVelocity);
        
        body.angularVelocity.x += rotStabEuler.x;
        body.angularVelocity.y += rotStabEuler.y;
        body.angularVelocity.z += rotStabEuler.z;

        // Pitch
        if (plane.actions.pitchUp.isPressed)
        {
            body.angularVelocity.x -= right.x * 0.1 * flightModeInfluence * this.enginePower;
            body.angularVelocity.y -= right.y * 0.1 * flightModeInfluence * this.enginePower;
            body.angularVelocity.z -= right.z * 0.1 * flightModeInfluence * this.enginePower;
        }
        if (plane.actions.pitchDown.isPressed)
        {
            body.angularVelocity.x += right.x * 0.1 * flightModeInfluence * this.enginePower;
            body.angularVelocity.y += right.y * 0.1 * flightModeInfluence * this.enginePower;
            body.angularVelocity.z += right.z * 0.1 * flightModeInfluence * this.enginePower;
        }

        // Yaw
        if (plane.actions.yawLeft.isPressed)
        {
            body.angularVelocity.x += up.x * 0.03 * flightModeInfluence * this.enginePower;
            body.angularVelocity.y += up.y * 0.03 * flightModeInfluence * this.enginePower;
            body.angularVelocity.z += up.z * 0.03 * flightModeInfluence * this.enginePower;
        }
        if (plane.actions.yawRight.isPressed)
        {
            body.angularVelocity.x -= up.x * 0.03 * flightModeInfluence * this.enginePower;
            body.angularVelocity.y -= up.y * 0.03 * flightModeInfluence * this.enginePower;
            body.angularVelocity.z -= up.z * 0.03 * flightModeInfluence * this.enginePower;
        }

        // Roll
        if (plane.actions.rollLeft.isPressed)
        {
            body.angularVelocity.x -= forward.x * 0.1 * flightModeInfluence * this.enginePower;
            body.angularVelocity.y -= forward.y * 0.1 * flightModeInfluence * this.enginePower;
            body.angularVelocity.z -= forward.z * 0.1 * flightModeInfluence * this.enginePower;
        }
        if (plane.actions.rollRight.isPressed)
        {
            body.angularVelocity.x += forward.x * 0.1 * flightModeInfluence * this.enginePower;
            body.angularVelocity.y += forward.y * 0.1 * flightModeInfluence * this.enginePower;
            body.angularVelocity.z += forward.z * 0.1 * flightModeInfluence * this.enginePower;
        }

        // Angular damping
        body.angularVelocity.x *= 0.96;
        body.angularVelocity.y *= 0.96;
        body.angularVelocity.z *= 0.96;
    }

    public onInputChange(): void
    {
        super.onInputChange();

        const brakeForce = 1000;

        if (this.actions.wheelBrake.justPressed)
        {
            this.setBrake(brakeForce);
        }
        if (this.actions.wheelBrake.justReleased)
        {
            this.setBrake(0);
        }
    }

    public readAirplaneData(gltf: any): void
    {
        gltf.scene.traverse((child) => {
            if (child.hasOwnProperty('userData'))
            {
                if (child.userData.hasOwnProperty('data'))
                {
                    if (child.userData.data === 'rotor')
                    {
                        this.rotor = child;
                    }
                    if (child.userData.data === 'rudder')
                    {
                        this.rudder = child;
                    }
                    if (child.userData.data === 'elevator')
                    {
                        this.elevators.push(child);
                    }
                    if (child.userData.data === 'aileron')
                    {
                        if (child.userData.hasOwnProperty('side')) 
                        {
                            if (child.userData.side === 'left')
                            {
                                this.leftAileron = child;
                            }
                            else if (child.userData.side === 'right')
                            {
                                this.rightAileron = child;
                            }
                        }
                    }
                }
            }
        });
    }

    public inputReceiverInit(): void
    {
        super.inputReceiverInit();

        this.world.updateControls([
            {
                keys: ['W'],
                desc: 'Increase rotor RPM'
            },
            {
                keys: ['S'],
                desc: 'Decrease rotor RPM'
            },
            {
                keys: ['↑', '↓'],
                desc: 'Elevators'
            },
            {
                keys: ['←', '→', 'or', 'A', 'D'],
                desc: 'Ailerons'
            },
            {
                keys: ['Q', 'E'],
                desc: 'Rudder / Steering'
            },
            {
                keys: ['Space'],
                desc: 'Brake'
            },
        ]);
    }
}