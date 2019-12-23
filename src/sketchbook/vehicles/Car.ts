import * as CANNON from 'cannon';

import { Vehicle } from "./Vehicle";
import { IControllable } from "../interfaces/IControllable";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { KeyBinding } from '../core/KeyBinding';

export class Car extends Vehicle implements IControllable, IWorldEntity
{
    private steeringWheel: THREE.Object3D;

    constructor()
    {
        super();

        this.actions = {
            'throttle': new KeyBinding('KeyW'),
            'brake': new KeyBinding('KeyS'),
            'left': new KeyBinding('KeyA'),
            'right': new KeyBinding('KeyD'),
            'exitVehicle': new KeyBinding('KeyF'),
        };
    }

    public fromGLTF(gltf: any): void
    {
        this.collision = new CANNON.Body({
            mass: 10
        });
        let mat = new CANNON.Material("Mat");
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
                }
            }
        });
    }
}