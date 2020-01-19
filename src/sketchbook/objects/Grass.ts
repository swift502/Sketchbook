import THREE = require('three');
import { Noise } from '../../lib/utils/perlin.js';
import { GrassShader } from '../../lib/shaders/GrassShader';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { World } from '../core/World';

export class Grass implements IWorldEntity
{
    public groundMaterial: THREE.Material;
    public grassMaterial: THREE.Material;

    private meshes: THREE.Mesh[] = [];

    constructor(transform: any)
    {
        // Based on:
        // "Realistic real-time grass rendering" by Eddie Lee, 2010
        // https://www.eddietree.com/grass
        // https://medium.com/@Zadvorsky/into-vertex-shaders-594e6d8cd804u
        // https://github.com/zadvorsky/three.bas
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_instancing_dynamic.html
        // https://www.opengl-tutorial.org/intermediate-tutorials/tutorial-17-quaternions/

        // Variables for blade mesh
        let joints = 3;
        let w_ = 0.02;
        let h_ = 0.2;

        // Number of blades
        let instances = 300000;

        // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
        function multiplyQuaternions(q1, q2)
        {
            x = q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x;
            y = -q1.x * q2.z + q1.y * q2.w + q1.z * q2.x + q1.w * q2.y;
            z = q1.x * q2.y - q1.y * q2.x + q1.z * q2.w + q1.w * q2.z;
            w = -q1.x * q2.x - q1.y * q2.y - q1.z * q2.z + q1.w * q2.w;
            return new THREE.Vector4(x, y, z, w);
        }

        // ************** Setup **************
        // Use noise.js library to generate a grid of 2D simplex noise values
        let noise = Noise();
        noise.seed(Math.random());

        // The ground
        let ground_geometry = new THREE.PlaneGeometry(transform.scale.x * 2, transform.scale.z * 2);
        this.groundMaterial = new THREE.MeshBasicMaterial({ color: 0x002300 });

        // Define base geometry that will be instanced. We use a plane for an individual blade of grass
        let base_geometry = new THREE.PlaneBufferGeometry(w_, h_, 1, joints);
        base_geometry.translate(0, h_ / 2, 0);

        // From:
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_instancing_dynamic.html
        let instanced_geometry = new THREE.InstancedBufferGeometry();

        // ************** Attributes **************
        instanced_geometry.index = base_geometry.index;
        instanced_geometry.attributes.position = base_geometry.attributes.position;
        instanced_geometry.attributes.uv = base_geometry.attributes.uv;

        // Each instance has its own data for position, rotation and scale
        let offsets = [];
        let orientations = [];
        let stretches = [];
        let halfRootAngleSin = [];
        let halfRootAngleCos = [];

        // Temp variables
        let quaternion_0 = new THREE.Vector4();
        let quaternion_1 = new THREE.Vector4();
        let x, y, z, w;

        // The min and max angle for the growth direction (in radians)
        let min = -0.25;
        let max = 0.25;

        // For each instance of the grass blade
        for (let i = 0; i < instances; i++)
        {
            // Offset of the roots
            x = Math.random() * transform.scale.x * 2 - transform.scale.x;
            z = Math.random() * transform.scale.z * 2 - transform.scale.z;
            y = 0;
            offsets.push(x, y, z);

            // Define random growth directions
            // Rotate around Y
            let angle = Math.PI - Math.random() * (2 * Math.PI);
            halfRootAngleSin.push(Math.sin(0.5 * angle));
            halfRootAngleCos.push(Math.cos(0.5 * angle));

            let RotationAxis = new THREE.Vector3(0, 1, 0);
            x = RotationAxis.x * Math.sin(angle / 2.0);
            y = RotationAxis.y * Math.sin(angle / 2.0);
            z = RotationAxis.z * Math.sin(angle / 2.0);
            w = Math.cos(angle / 2.0);
            quaternion_0.set(x, y, z, w).normalize();

            // Rotate around X
            angle = Math.random() * (max - min) + min;
            RotationAxis = new THREE.Vector3(1, 0, 0);
            x = RotationAxis.x * Math.sin(angle / 2.0);
            y = RotationAxis.y * Math.sin(angle / 2.0);
            z = RotationAxis.z * Math.sin(angle / 2.0);
            w = Math.cos(angle / 2.0);
            quaternion_1.set(x, y, z, w).normalize();

            // Combine rotations to a single quaternion
            quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);

            // Rotate around Z
            angle = Math.random() * (max - min) + min;
            RotationAxis = new THREE.Vector3(0, 0, 1);
            x = RotationAxis.x * Math.sin(angle / 2.0);
            y = RotationAxis.y * Math.sin(angle / 2.0);
            z = RotationAxis.z * Math.sin(angle / 2.0);
            w = Math.cos(angle / 2.0);
            quaternion_1.set(x, y, z, w).normalize();

            // Combine rotations to a single quaternion
            quaternion_0 = multiplyQuaternions(quaternion_0, quaternion_1);

            orientations.push(quaternion_0.x, quaternion_0.y, quaternion_0.z, quaternion_0.w);

            // Define variety in height
            if (i < instances / 3)
            {
                stretches.push(Math.random() * 1.8);
            } else
            {
                stretches.push(Math.random());
            }
        }

        let offsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3);
        let stretchAttribute = new THREE.InstancedBufferAttribute(new Float32Array(stretches), 1);
        let halfRootAngleSinAttribute = new THREE.InstancedBufferAttribute(new Float32Array(halfRootAngleSin), 1);
        let halfRootAngleCosAttribute = new THREE.InstancedBufferAttribute(new Float32Array(halfRootAngleCos), 1);
        let orientationAttribute = new THREE.InstancedBufferAttribute(new Float32Array(orientations), 4);

        instanced_geometry['setAttribute']('offset', offsetAttribute);
        instanced_geometry['setAttribute']('orientation', orientationAttribute);
        instanced_geometry['setAttribute']('stretch', stretchAttribute);
        instanced_geometry['setAttribute']('halfRootAngleSin', halfRootAngleSinAttribute);
        instanced_geometry['setAttribute']('halfRootAngleCos', halfRootAngleCosAttribute);

        ground_geometry.computeBoundingSphere();
        instanced_geometry.boundingSphere = ground_geometry.boundingSphere.clone();

        // Get alpha map and blade texture
        // These have been taken from "Realistic real-time grass rendering" by Eddie Lee, 2010
        let loader = new THREE.TextureLoader();
        loader.crossOrigin = '';
        let texture = loader.load('https://al-ro.github.io/images/grass/blade_diffuse.jpg');
        let alphaMap = loader.load('https://al-ro.github.io/images/grass/blade_alpha.jpg');

        // Define the material, specifying attributes, uniforms, shaders etc.
        this.grassMaterial = new THREE.ShaderMaterial({
            uniforms: {
                map: { value: texture },
                alphaMap: { value: alphaMap },
                time: { type: 'float', value: 0 },
                playerPos: { type: 'vec3', value: new THREE.Vector3() }
            },
            vertexShader: GrassShader.vertexShader,
            fragmentShader: GrassShader.fragmentShader,
            side: THREE.DoubleSide
        });

        let grassMesh = new THREE.Mesh(instanced_geometry, this.grassMaterial);
        grassMesh.position.copy(transform.position);
        this.meshes.push(grassMesh);
    }

    public addToWorld(world: World): void
    {
        this.meshes.forEach((mesh) => {
            world.graphicsWorld.add(mesh);
        });
    }

    public removeFromWorld(world: World): void
    {
        this.meshes.forEach((mesh) => {
            world.graphicsWorld.remove(mesh);
        });
    }
}