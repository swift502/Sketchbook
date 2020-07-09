import * as CANNON from 'cannon';
import * as THREE from 'three';
import * as Utils from '../../core/Utilities';
import {IPhysicsType} from '../../interfaces/IPhysicsType';
import {Object3D} from 'three';
import { threeToCannon } from '../../../lib/utils/three-to-cannon';

export class TrimeshCollider implements IPhysicsType
{
    public mesh: any;
    public options: any;
    public body: CANNON.Body;
    public debugModel: any;

    constructor(mesh: Object3D, options: any)
    {
        this.mesh = mesh.clone();

        let defaults = {
            mass: 0,
            position: mesh.position,
            friction: 0.3
        };
        options = Utils.setDefaults(options, defaults);
        this.options = options;

        let mat = new CANNON.Material('triMat');
        mat.friction = options.friction;
        // mat.restitution = 0.7;

        let shape = threeToCannon(this.mesh, {type: threeToCannon.Type.MESH});
        // shape['material'] = mat;

        // Add phys sphere
        let physBox = new CANNON.Body({
            mass: options.mass,
            position: options.position,
            shape: shape
        });

        physBox.material = mat;

        this.body = physBox;
        //this.visual = this.getVisualModel({ visible: false, wireframe: true });
    }

    // public getVisualModel(options: any): THREE.Mesh
    // {
    //     let defaults = {
    //         visible: true,
    //         wireframe: true
    //     };
    //     options = Utils.setDefaults(options, defaults);

    //     let material = new THREE.MeshLambertMaterial({ color: 0xcccccc, wireframe: options.wireframe });
    //     let visualBox = this.mesh.clone();
    //     visualBox.material = material;
    //     visualBox.visible = options.visible;
    //     if (!options.wireframe)
    //     {
    //         visualBox.castShadow = true;
    //         visualBox.receiveShadow = true;
    //     }

    //     return visualBox;
    // }
}