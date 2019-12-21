import { Vehicle } from "./Vehicle";
import { IControllable } from "../interfaces/IControllable";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { CANNON } from "../sketchbook";

export class Helicopter extends Vehicle implements IControllable, IWorldEntity
{
    public rotors: THREE.Object3D[];

    public fromGLTF(gltf: any): void
    {
        this.collision = new CANNON.Body({
            mass: 10
        });
        let mat = new CANNON.Material("Mat");
        mat.friction = 0.01;
        this.collision.material = mat;

        this.rotors = [];

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
                    if (child.userData.data === 'rotor')
                    {
                        this.rotors.push(child);
                    }
                }
            }
        });
    }
}