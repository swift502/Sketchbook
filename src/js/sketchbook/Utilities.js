import * as THREE from 'three';
import _ from 'lodash';
import { Utils } from 'cannon';

export class Utilities
{
    //#region Geometry

    static createCapsuleGeometry(radius = 1, height = 2, N = 32)
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

                if (i == N / 4)
                {
                    let face_1 = new THREE.Face3(vec.x, vec.y, vec.z, [ //ok
                        normals[vec.x],
                        normals[vec.y],
                        normals[vec.z]
                    ]);

                    let face_2 = new THREE.Face3(vec.x, vec.z, vec.w, [
                        normals[vec.x],
                        normals[vec.z],
                        normals[vec.w]
                    ]);

                    geometry.faces.push(face_2);
                    geometry.faces.push(face_1);
                } else
                {
                    let face_1 = new THREE.Face3(vec.x, vec.y, vec.z, [
                        normals[vec.x],
                        normals[vec.y],
                        normals[vec.z]
                    ]);

                    let face_2 = new THREE.Face3(vec.x, vec.z, vec.w, [
                        normals[vec.x],
                        normals[vec.z],
                        normals[vec.w]
                    ]);

                    geometry.faces.push(face_1);
                    geometry.faces.push(face_2);
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

    //#region Maths

    /**
     * Constructs a 2D matrix from first vector, replacing the Y axes with the global Y axis,
     * and applies this matrix to the second vector. Saves performance when compared to full 3D matrix application.
     * Useful for character rotation, as it only happens on the Y axis.
     * @param {Vector3} a Vector to construct 2D matrix from
     * @param {Vector3} b Vector to apply basis to
     */
    static appplyVectorMatrixXZ(a, b)
    {
        return new THREE.Vector3(
            (a.x * b.z + a.z * b.x) / 2,
            b.y,
            (a.z * b.z + -a.x * b.x) / 2
        );
    }

    static round(number, decimals = 0)
    {
        return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    static roundVector(vector, decimals = 0)
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
    static getAngleBetweenVectors(v1, v2, dot_treshold = 0.0005)
    {
        let angle;
        let dot = v1.dot(v2);

        // If dot is close to 1, we'll round angle to zero
        if (dot > 1 - dot_treshold)
        {
            angle = 0;
        }
        else
        {
            // Dot too close to -1
            if (dot < -1 + dot_treshold)
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
     * @param {THREE.Vector3} v1 
     * @param {THREE.Vector3} v2 
     * @param {THREE.Vector3} normal Normal vector of the plane created by v1 and v2, independent of the order of v1 and v2
     */
    static getSignedAngleBetweenVectors(v1, v2, normal = new THREE.Vector3(0, 1, 0), dot_treshold = 0.0005)
    {
        let angle = this.getAngleBetweenVectors(v1, v2, dot_treshold);

        // Get vector pointing up or down
        let cross = new THREE.Vector3().crossVectors(v1, v2);
        // Compare cross with normal to find out direction
        if (normal.dot(cross) < 0)
        {
            angle = -angle;
        }

        return angle;
    }

    static haveSameSigns(n1, n2)
    {
        return (n1 < 0) == (n2 < 0);
    }

    static haveDifferentSigns(n1, n2)
    {
        return (n1 < 0) != (n2 < 0);
    }

    //#endregion

    //#region Miscellaneous

    static createArray(length)
    {
        let arr = new Array(length || 0),
            i = length;

        if (arguments.length > 1)
        {
            let args = Array.prototype.slice.call(arguments, 1);
            while (i--) arr[length - 1 - i] = this.createArray.apply(this, args);
        }

        return arr;
    }

    static setDefaults(options, defaults)
    {
        return _.defaults({}, _.clone(options), defaults);
    }

    static getGlobalProperties(prefix = '')
    {
        let keyValues = [], global = window; // window for browser environments
        for (let prop in global)
        {
            if (prop.indexOf(prefix) == 0) // check the prefix
                keyValues.push(prop /*+ "=" + global[prop]*/);
        }
        return keyValues; // build the string
    }

    //#endregion
}