import * as CANNON from 'cannon';
import * as THREE from 'three';
import * as Utils from '../../core/Utilities';
import { IPhysicsType } from '../../interfaces/IPhysicsType';

export class CapsuleCollider implements IPhysicsType
{
    public options: any;
    public body: CANNON.Body;
    // public visual: THREE.Mesh;

    constructor(options)
    {
        let defaults = {
            mass: 0,
            position: new CANNON.Vec3(),
            height: 0.5,
            radius: 0.3,
            segments: 8,
            friction: 0.3
        };
        options = Utils.setDefaults(options, defaults);
        this.options = options;

        let mat = new CANNON.Material("capsuleMat");
        mat.friction = options.friction;

        let capsuleBody = new CANNON.Body({
            mass: options.mass,
            position: options.position
        });

        // Compound shape
        let sphereShape = new CANNON.Sphere(options.radius);

        // Materials
        capsuleBody.material = mat;
        // sphereShape.material = mat;

        capsuleBody.addShape(sphereShape, new CANNON.Vec3(0, 0, 0));
        capsuleBody.addShape(sphereShape, new CANNON.Vec3(0, options.height / 2, 0));
        capsuleBody.addShape(sphereShape, new CANNON.Vec3(0, -options.height / 2, 0));

        this.body = capsuleBody;
        // this.visual = this.getVisualModel({ visible: false, wireframe: true });
    }

    // public getVisualModel(options): THREE.Mesh
    // {
    //     let defaults = {
    //         visible: true,
    //         wireframe: true
    //     };
    //     options = Utils.setDefaults(options, defaults);

    //     let material = new THREE.MeshLambertMaterial({ color: 0xcccccc, wireframe: options.wireframe });
    //     let geometry = Utils.createCapsuleGeometry(this.options.radius, this.options.height, this.options.segments);
    //     let visualCapsule = new THREE.Mesh(geometry, material);
    //     visualCapsule.visible = options.visible;
    //     if (!options.wireframe)
    //     {
    //         visualCapsule.castShadow = true;
    //         visualCapsule.receiveShadow = true;
    //     }

    //     return visualCapsule;
    // }
}