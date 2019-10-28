import * as THREE from 'three';
import * as _ from 'lodash';
import { SimulationFrame } from '../simulation/SimulationFrame';

export function createCapsuleGeometry(radius = 1, height = 2, N = 32): THREE.Geometry
{
    const geometry = new THREE.Geometry();
    const TWOPI = Math.PI * 2;
    const PID2 = 1.570796326794896619231322;

    const normals = [];

    // top cap
    for (let i = 0; i <= N / 4; i++)
    {
        for (let j = 0; j <= N; j++)
        {
            let theta = j * TWOPI / N;
            let phi = -PID2 + Math.PI * i / (N / 2);
            let vertex = new THREE.Vector3();
            let normal = new THREE.Vector3();
            vertex.x = radius * Math.cos(phi) * Math.cos(theta);
            vertex.y = radius * Math.cos(phi) * Math.sin(theta);
            vertex.z = radius * Math.sin(phi);
            vertex.z -= height / 2;
            normal.x = vertex.x;
            normal.y = vertex.y;
            normal.z = vertex.z;
            geometry.vertices.push(vertex);
            normals.push(normal);
        }
    }

    // bottom cap
    for (let i = N / 4; i <= N / 2; i++)
    {
        for (let j = 0; j <= N; j++)
        {
            let theta = j * TWOPI / N;
            let phi = -PID2 + Math.PI * i / (N / 2);
            let vertex = new THREE.Vector3();
            let normal = new THREE.Vector3();
            vertex.x = radius * Math.cos(phi) * Math.cos(theta);
            vertex.y = radius * Math.cos(phi) * Math.sin(theta);
            vertex.z = radius * Math.sin(phi);
            vertex.z += height / 2;
            normal.x = vertex.x;
            normal.y = vertex.y;
            normal.z = vertex.z;
            geometry.vertices.push(vertex);
            normals.push(normal);
        }
    }

    for (let i = 0; i <= N / 2; i++)
    {
        for (let j = 0; j < N; j++)
        {
            let vec = new THREE.Vector4(
                i * (N + 1) + j,
                i * (N + 1) + (j + 1),
                (i + 1) * (N + 1) + (j + 1),
                (i + 1) * (N + 1) + j
            );

            if (i === N / 4)
            {
                let face1 = new THREE.Face3(vec.x, vec.y, vec.z, [
                    normals[vec.x],
                    normals[vec.y],
                    normals[vec.z]
                ]);

                let face2 = new THREE.Face3(vec.x, vec.z, vec.w, [
                    normals[vec.x],
                    normals[vec.z],
                    normals[vec.w]
                ]);

                geometry.faces.push(face2);
                geometry.faces.push(face1);
            } else
            {
                let face1 = new THREE.Face3(vec.x, vec.y, vec.z, [
                    normals[vec.x],
                    normals[vec.y],
                    normals[vec.z]
                ]);

                let face2 = new THREE.Face3(vec.x, vec.z, vec.w, [
                    normals[vec.x],
                    normals[vec.z],
                    normals[vec.w]
                ]);

                geometry.faces.push(face1);
                geometry.faces.push(face2);
            }
        }
        // if(i==(N/4)) break; // N/4 is when the center segments are solved
    }

    geometry.rotateX(Math.PI / 2);
    geometry.computeVertexNormals();
    geometry.computeFaceNormals();

    return geometry;
}

//#endregion

//#region Math

/**
 * Constructs a 2D matrix from first vector, replacing the Y axes with the global Y axis,
 * and applies this matrix to the second vector. Saves performance when compared to full 3D matrix application.
 * Useful for character rotation, as it only happens on the Y axis.
 * @param {Vector3} a Vector to construct 2D matrix from
 * @param {Vector3} b Vector to apply basis to
 */
export function appplyVectorMatrixXZ(a, b): THREE.Vector3
{
    return new THREE.Vector3(
        (a.x * b.z + a.z * b.x),
        b.y,
        (a.z * b.z + -a.x * b.x)
    );
}

export function round(value: number, decimals: number = 0): number
{
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function roundVector(vector: THREE.Vector3, decimals: number = 0): THREE.Vector3
{
    return new THREE.Vector3(
        this.round(vector.x, decimals),
        this.round(vector.y, decimals),
        this.round(vector.z, decimals),
    );
}

/**
 * Finds an angle between two vectors
 * @param {THREE.Vector3} v1 
 * @param {THREE.Vector3} v2 
 */
export function getAngleBetweenVectors(v1: THREE.Vector3, v2: THREE.Vector3, dotTreshold: number = 0.0005): number
{
    let angle: number;
    let dot = v1.dot(v2);

    // If dot is close to 1, we'll round angle to zero
    if (dot > 1 - dotTreshold)
    {
        angle = 0;
    }
    else
    {
        // Dot too close to -1
        if (dot < -1 + dotTreshold)
        {
            angle = Math.PI / 2;
        }
        else
        {
            // Get angle difference in radians
            angle = Math.acos(dot);
        }
    }

    return angle;
}

/**
 * Finds an angle between two vectors with a sign relative to normal vector
 */
export function getSignedAngleBetweenVectors(v1: THREE.Vector3, v2: THREE.Vector3, normal = new THREE.Vector3(0, 1, 0), dotTreshold: number = 0.0005): number
{
    let angle = this.getAngleBetweenVectors(v1, v2, dotTreshold);

    // Get vector pointing up or down
    let cross = new THREE.Vector3().crossVectors(v1, v2);
    // Compare cross with normal to find out direction
    if (normal.dot(cross) < 0)
    {
        angle = -angle;
    }

    return angle;
}

export function haveSameSigns(n1: number, n2: number): boolean
{
    return (n1 < 0) === (n2 < 0);
}

export function haveDifferentSigns(n1: number, n2: number): boolean
{
    return (n1 < 0) !== (n2 < 0);
}

//#endregion

//#region Miscellaneous

export function setDefaults(options: {}, defaults: {}): {}
{
    return _.defaults({}, _.clone(options), defaults);
}

export function getGlobalProperties(prefix: string = ''): any[]
{
    let keyValues = [];
    let global = window; // window for browser environments
    for (let prop in global)
    {
        // check the prefix
        if (prop.indexOf(prefix) === 0) {
            keyValues.push(prop /*+ "=" + global[prop]*/);
        }
    }
    return keyValues; // build the string
}

export function spring(source: number, dest: number, velocity: number, mass: number, damping: number): SimulationFrame
{
    let acceleration = dest - source;
    acceleration /= mass;
    velocity += acceleration;
    velocity *= damping;

    let position = source += velocity;

    return new SimulationFrame(position, velocity);
}

export function springV(source: THREE.Vector3, dest: THREE.Vector3, velocity: THREE.Vector3, mass: number, damping: number): void
{
    let acceleration = new THREE.Vector3().subVectors(dest, source);
    acceleration.divideScalar(mass);
    velocity.add(acceleration);
    velocity.multiplyScalar(damping);
    source.add(velocity);
}

export class GroundImpactData {
    public velocity: THREE.Vector3 = new THREE.Vector3();
}

//#endregion