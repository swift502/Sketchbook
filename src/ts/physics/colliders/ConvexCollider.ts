import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import * as Utils from '../../core/FunctionLibrary';
import { ICollider } from '../../interfaces/ICollider';
import {Mesh, Vector3} from 'three';
import {Object3D} from 'three';

export class ConvexCollider implements ICollider
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

		let mat = new CANNON.Material('convMat');
		mat.friction = options.friction;
		// mat.restitution = 0.7;

		const vertices = []
		const faces: number[][] = []
		
		const positions = this.mesh.geometry.getAttribute('position').array;
		for (let i = 0; i < positions.array.length; i + 3) {
			vertices.push(new Vector3(positions[i], positions[i + 1], positions[i + 2]))
			faces.push([i, i + 1, i + 2])
		}

		let cannonPoints = vertices.map((v: Vector3) => {
			return new CANNON.Vec3(v.x, v.y, v.z);
		});

		let cannonFaces = faces


		let shape = new CANNON.ConvexPolyhedron({vertices:cannonPoints, faces:cannonFaces});
		// shape.material = mat;

		// Add phys sphere
		let physBox = new CANNON.Body({
			mass: options.mass,
			position: options.position,
			shape
		});

		physBox.material = mat;

		this.body = physBox;
	}
}