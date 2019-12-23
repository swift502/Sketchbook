import * as CANNON from 'cannon';

import { Vehicle } from "./Vehicle";
import { IControllable } from "../interfaces/IControllable";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { KeyBinding } from '../core/KeyBinding';

export class Airplane extends Vehicle implements IControllable, IWorldEntity
{
    public rudder: THREE.Object3D;
    public elevators: THREE.Object3D[];
    public leftAileron: THREE.Object3D;
    public rightAileron: THREE.Object3D;

    constructor()
    {
        super();

        this.actions = {
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

        this.rudder = undefined;
        this.elevators = [];
        this.leftAileron = undefined;
        this.rightAileron = undefined;

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
}