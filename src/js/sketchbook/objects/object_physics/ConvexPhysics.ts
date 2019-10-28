import * as CANNON from 'cannon';
import * as THREE from 'three';
import * as Utils from '../../core/Utilities';
import { IPhysicsType } from '../../interfaces/IPhysicsType';

export class ConvexPhysics implements IPhysicsType
{
    public mesh: any;
    public options: any;
    public physical: CANNON.Body;
    public visual: any;

    constructor(mesh, options)
    {
        this.mesh = mesh.clone();

        let defaults = {
            mass: 0,
            position: mesh.position,
            friction: 0.3
        };
        options = Utils.setDefaults(options, defaults);
        this.options = options;

        let mat = new CANNON.Material("convMat");
        mat.friction = options.friction;
        // mat.restitution = 0.7;

        if (this.mesh.geometry.isBufferGeometry)
        {
            this.mesh.geometry = new THREE.Geometry().fromBufferGeometry(this.mesh.geometry);
        }

        let cannonPoints = this.mesh.geometry.vertices.map((v) => {
            return new CANNON.Vec3( v.x, v.y, v.z );
        });
        
        let cannonFaces = this.mesh.geometry.faces.map((f) => {
            return [f.a, f.b, f.c];
        });

        let shape = new CANNON.ConvexPolyhedron(cannonPoints, cannonFaces);
        // shape.material = mat;

        // Add phys sphere
        let physBox = new CANNON.Body({
            mass: options.mass,
            position: options.position,
            shape
        });

        physBox.material = mat;

        this.physical = physBox;
        this.visual = this.getVisualModel({ visible: false, wireframe: true });
    }

    public getVisualModel(options): THREE.Mesh
    {
        let defaults = {
            visible: true,
            wireframe: true
        };
        options = Utils.setDefaults(options, defaults);

        let material = new THREE.MeshLambertMaterial({ color: 0xcccccc, wireframe: options.wireframe });
        let visualBox = this.mesh.clone();
        visualBox.material = material;
        visualBox.visible = options.visible;
        if (!options.wireframe)
        {
            visualBox.castShadow = true;
            visualBox.receiveShadow = true;
        }

        return visualBox;
    }
}