import * as CANNON from 'cannon';

import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { KeyBinding } from '../core/KeyBinding';
import { SpringSimulator } from '../simulation/SpringSimulator';
import { Euler } from 'three';

export class Airplane extends Vehicle implements IControllable, IWorldEntity
{
    public rotor: THREE.Object3D;
    public leftAileron: THREE.Object3D;
    public rightAileron: THREE.Object3D;
    public elevators: THREE.Object3D[] = [];
    public rudder: THREE.Object3D;

    private aileronSimulator: SpringSimulator;
    private elevatorSimulator: SpringSimulator;
    private rudderSimulator: SpringSimulator;

    private enginePower: number = 0;

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

        this.actions = {
            'throttle': new KeyBinding('KeyW'),
            'brake': new KeyBinding('KeyS'),
            'pitchUp': new KeyBinding('ArrowDown'),
            'pitchDown': new KeyBinding('ArrowUp'),
            'yawLeft': new KeyBinding('KeyQ'),
            'yawRight': new KeyBinding('KeyE'),
            'rollLeft': new KeyBinding('ArrowLeft', 'KeyA'),
            'rollRight': new KeyBinding('ArrowRight', 'KeyD'),
            'exitVehicle': new KeyBinding('KeyF'),
        };

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
                desc: 'Increase engine RPM'
            },
            {
                keys: ['S'],
                desc: 'Decrease engine RPM'
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
        ]);
    }
}