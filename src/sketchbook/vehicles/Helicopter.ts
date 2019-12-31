import * as CANNON from 'cannon';
import * as Utils from '../core/Utilities';

import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { KeyBinding } from '../core/KeyBinding';
import THREE = require('three');
import { World } from '../core/World';

export class Helicopter extends Vehicle implements IControllable, IWorldEntity
{
    public rotors: THREE.Object3D[] = [];
    private enginePower: number = 0;

    constructor(gltf: any)
    {
        super(gltf);

        this.readHelicopterData(gltf);

        this.collision.preStep = (body: CANNON.Body) => { this.physicsPreStep(body, this); };

        this.actions = {
            'ascend': new KeyBinding('KeyW'),
            'descend': new KeyBinding('KeyS'),
            'pitchUp': new KeyBinding('ArrowDown'),
            'pitchDown': new KeyBinding('ArrowUp'),
            'yawLeft': new KeyBinding('KeyQ'),
            'yawRight': new KeyBinding('KeyE'),
            'rollLeft': new KeyBinding('ArrowLeft', 'KeyA'),
            'rollRight': new KeyBinding('ArrowRight', 'KeyD'),
            'exitVehicle': new KeyBinding('KeyF'),
        };
    }

    public update(timeStep: number): void
    {
        super.update(timeStep);
        
        // Rotors visuals
        if (this.controllingCharacter !== undefined)
        {
            if (this.enginePower < 1) this.enginePower += timeStep * 0.2;
            if (this.enginePower > 1) this.enginePower = 1;
        }
        else
        {
            if (this.enginePower > 0) this.enginePower -= timeStep * 0.06;
            if (this.enginePower < 0) this.enginePower = 0;
        }

        this.rotors.forEach((rotor) =>
        {
            rotor.rotateX(this.enginePower * 0.5);
        });
    }

    public physicsPreStep(body: CANNON.Body, heli: Helicopter): void
    {
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
        
        // Throttle
        if (heli.actions.ascend.isPressed)
        {
            body.velocity.x += up.x * 0.15 * this.enginePower;
            body.velocity.y += up.y * 0.15 * this.enginePower;
            body.velocity.z += up.z * 0.15 * this.enginePower;
        }
        if (heli.actions.descend.isPressed)
        {
            body.velocity.x -= up.x * 0.15 * this.enginePower;
            body.velocity.y -= up.y * 0.15 * this.enginePower;
            body.velocity.z -= up.z * 0.15 * this.enginePower;
        }

        // Vertical stabilization
        let gravity = heli.world.physicsWorld.gravity;
        let gravityCompensation = new CANNON.Vec3(-gravity.x, -gravity.y, -gravity.z).length();
        gravityCompensation *= heli.world.physicsFrameTime;
        gravityCompensation *= 0.98;
        let dot = globalUp.dot(up);
        gravityCompensation *= Math.sqrt(THREE.Math.clamp(dot, 0, 1));

        let vertDamping = Utils.threeVector(body.velocity);
        vertDamping.x *= up.x;
        vertDamping.y *= up.y;
        vertDamping.z *= up.z;
        vertDamping.multiplyScalar(-0.01);

        let vertStab = up.clone();
        vertStab.multiplyScalar((gravityCompensation));
        vertStab.multiplyScalar(Math.pow(heli.enginePower, 3));
        vertStab.add(vertDamping);

        body.velocity.x += vertStab.x;
        body.velocity.y += vertStab.y;
        body.velocity.z += vertStab.z;

        // Positional damping
        body.velocity.x *= 0.99;
        body.velocity.z *= 0.99;

        // Rotation stabilization
        if (this.controllingCharacter !== undefined)
        {
            let rotStabVelocity = new THREE.Quaternion().setFromUnitVectors(up, globalUp);
            rotStabVelocity.x *= 0.3;
            rotStabVelocity.y *= 0.3;
            rotStabVelocity.z *= 0.3;
            rotStabVelocity.w *= 0.3;
            let rotStabEuler = new THREE.Euler().setFromQuaternion(rotStabVelocity);
            
            body.angularVelocity.x += rotStabEuler.x;
            body.angularVelocity.y += rotStabEuler.y;
            body.angularVelocity.z += rotStabEuler.z;
        }

        // Pitch
        if (heli.actions.pitchUp.isPressed)
        {
            body.angularVelocity.x -= right.x * 0.1 * this.enginePower;
            body.angularVelocity.y -= right.y * 0.1 * this.enginePower;
            body.angularVelocity.z -= right.z * 0.1 * this.enginePower;
        }
        if (heli.actions.pitchDown.isPressed)
        {
            body.angularVelocity.x += right.x * 0.1 * this.enginePower;
            body.angularVelocity.y += right.y * 0.1 * this.enginePower;
            body.angularVelocity.z += right.z * 0.1 * this.enginePower;
        }

        // Yaw
        if (heli.actions.yawLeft.isPressed)
        {
            body.angularVelocity.x += up.x * 0.1 * this.enginePower;
            body.angularVelocity.y += up.y * 0.1 * this.enginePower;
            body.angularVelocity.z += up.z * 0.1 * this.enginePower;
        }
        if (heli.actions.yawRight.isPressed)
        {
            body.angularVelocity.x -= up.x * 0.1 * this.enginePower;
            body.angularVelocity.y -= up.y * 0.1 * this.enginePower;
            body.angularVelocity.z -= up.z * 0.1 * this.enginePower;
        }

        // Roll
        if (heli.actions.rollLeft.isPressed)
        {
            body.angularVelocity.x -= forward.x * 0.1 * this.enginePower;
            body.angularVelocity.y -= forward.y * 0.1 * this.enginePower;
            body.angularVelocity.z -= forward.z * 0.1 * this.enginePower;
        }
        if (heli.actions.rollRight.isPressed)
        {
            body.angularVelocity.x += forward.x * 0.1 * this.enginePower;
            body.angularVelocity.y += forward.y * 0.1 * this.enginePower;
            body.angularVelocity.z += forward.z * 0.1 * this.enginePower;
        }

        // Angular damping
        body.angularVelocity.x *= 0.97;
        body.angularVelocity.y *= 0.97;
        body.angularVelocity.z *= 0.97;
    }

    public readHelicopterData(gltf: any): void
    {
        gltf.scene.traverse((child) => {
            if (child.hasOwnProperty('userData'))
            {
                if (child.userData.hasOwnProperty('data'))
                {
                    if (child.userData.data === 'rotor')
                    {
                        this.rotors.push(child);
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
                desc: 'Ascend'
            },
            {
                keys: ['S'],
                desc: 'Descend'
            },
            {
                keys: ['↑', '↓'],
                desc: 'Pitch'
            },
            {
                keys: ['←', '→', 'or', 'A', 'D'],
                desc: 'Roll'
            },
            {
                keys: ['Q', 'E'],
                desc: 'Yaw'
            },
            {
                keys: ['F'],
                desc: 'Exit vehicle'
            },
        ]);
    }
}