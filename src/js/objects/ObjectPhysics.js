import * as CANNON from 'cannon';
import * as THREE from 'three';
import { Utilities as Utils } from '../sketchbook/Utilities';
import { threeToCannon } from '../lib/utils/three-pathfinding';

class Sphere
{
    constructor(options)
    {
        let defaults = {
            mass: 0,
            position: new CANNON.Vec3(),
            radius: 0.3,
            friction: 0.3
        };
        options = Utils.setDefaults(options, defaults);
        this.options = options;

        let mat = new CANNON.Material();
        mat.friction = options.friction;

        let shape = new CANNON.Sphere(options.radius);
        shape.material = mat;

        // Add phys sphere
        let physSphere = new CANNON.Body({
            mass: options.mass,
            position: options.position,
            shape: shape
        });
        physSphere.material = mat;

        this.physical = physSphere;
        this.visual = this.getVisualModel({ visible: false, wireframe: true });
    }

    getVisualModel(options)
    {
        let defaults = {
            visible: true,
            wireframe: true
        };
        options = Utils.setDefaults(options, defaults);

        let geometry = new THREE.SphereGeometry(this.options.radius);
        let material = new THREE.MeshLambertMaterial({ color: 0xcccccc, wireframe: options.wireframe });
        let visualSphere = new THREE.Mesh(geometry, material);
        visualSphere.visible = options.visible;

        if (!options.wireframe)
        {
            visualSphere.castShadow = true;
            visualSphere.receiveShadow = true;
        }

        return visualSphere;
    }
}

class Box
{
    constructor(options)
    {
        let defaults = {
            mass: 0,
            position: new CANNON.Vec3(),
            size: new CANNON.Vec3(0.3, 0.3, 0.3),
            friction: 0.3
        };
        options = Utils.setDefaults(options, defaults);
        this.options = options;

        let mat = new CANNON.Material();
        mat.friction = options.friction;
        // mat.restitution = 0.7;

        let shape = new CANNON.Box(options.size);
        shape.material = mat;


        // Add phys sphere
        let physBox = new CANNON.Body({
            mass: options.mass,
            position: options.position,
            shape: shape
        });

        physBox.material = mat;

        this.physical = physBox;
        this.visual = this.getVisualModel({ visible: false, wireframe: true });
    }

    getVisualModel(options)
    {
        let defaults = {
            visible: true,
            wireframe: true
        };
        options = Utils.setDefaults(options, defaults);

        let geometry = new THREE.BoxGeometry(this.options.size.x * 2, this.options.size.y * 2, this.options.size.z * 2);
        let material = new THREE.MeshLambertMaterial({ color: 0xcccccc, wireframe: options.wireframe });
        let visualBox = new THREE.Mesh(geometry, material);
        visualBox.visible = options.visible;
        if (!options.wireframe)
        {
            visualBox.castShadow = true;
            visualBox.receiveShadow = true;
        }

        return visualBox;
    }
}

class Capsule
{
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

        let mat = new CANNON.Material();
        mat.friction = options.friction;

        let physicalCapsule = new CANNON.Body({
            mass: options.mass,
            position: options.position
        });

        // Compound shape
        let sphereShape = new CANNON.Sphere(options.radius);

        // Materials
        physicalCapsule.material = mat;
        sphereShape.material = mat;

        physicalCapsule.addShape(sphereShape, new CANNON.Vec3(0, 0, 0));
        physicalCapsule.addShape(sphereShape, new CANNON.Vec3(0, options.height / 2, 0));
        physicalCapsule.addShape(sphereShape, new CANNON.Vec3(0, -options.height / 2, 0));

        this.physical = physicalCapsule;
        this.visual = this.getVisualModel({ visible: false, wireframe: true });
    }

    getVisualModel(options)
    {
        let defaults = {
            visible: true,
            wireframe: true
        };
        options = Utils.setDefaults(options, defaults);

        let material = new THREE.MeshLambertMaterial({ color: 0xcccccc, wireframe: options.wireframe });
        let geometry = Utils.createCapsuleGeometry(this.options.radius, this.options.height, this.options.segments);
        let visualCapsule = new THREE.Mesh(geometry, material);
        visualCapsule.visible = options.visible;
        if (!options.wireframe)
        {
            visualCapsule.castShadow = true;
            visualCapsule.receiveShadow = true;
        }

        return visualCapsule;
    }
}

class Convex
{
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

        let mat = new CANNON.Material();
        mat.friction = options.friction;
        // mat.restitution = 0.7;

        if(this.mesh.geometry.isBufferGeometry)
        {
            this.mesh.geometry = new THREE.Geometry().fromBufferGeometry(this.mesh.geometry);
        }

        let cannonPoints = this.mesh.geometry.vertices.map(function(v) {
            return new CANNON.Vec3( v.x, v.y, v.z );
        });
        
        let cannonFaces = this.mesh.geometry.faces.map(function(f) {
            return [f.a, f.b, f.c];
        });

        let shape = new CANNON.ConvexPolyhedron(cannonPoints, cannonFaces);
        shape.material = mat;

        // Add phys sphere
        let physBox = new CANNON.Body({
            mass: options.mass,
            position: options.position,
            shape: shape
        });

        physBox.material = mat;

        this.physical = physBox;
        this.visual = this.getVisualModel({ visible: false, wireframe: true });
    }

    getVisualModel(options)
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

class TriMesh
{
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

        let mat = new CANNON.Material();
        mat.friction = options.friction;
        // mat.restitution = 0.7;

        if(this.mesh.geometry.isBufferGeometry)
        {
            this.mesh.geometry = new THREE.Geometry().fromBufferGeometry(this.mesh.geometry);
        }

        let shape = threeToCannon(this.mesh, {type: threeToCannon.Type.MESH});
        shape.material = mat;

        // Add phys sphere
        let physBox = new CANNON.Body({
            mass: options.mass,
            position: options.position,
            shape: shape
        });

        physBox.material = mat;

        this.physical = physBox;
        this.visual = this.getVisualModel({ visible: false, wireframe: true });
    }

    getVisualModel(options)
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

export let ObjectPhysics = {
    Sphere: Sphere,
    Box: Box,
    Capsule: Capsule,
    Convex: Convex,
    TriMesh: TriMesh
};