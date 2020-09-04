import * as THREE from 'three';
import * as CANNON from 'cannon';
import * as Utils from '../../core/FunctionLibrary';

import { FollowTarget } from './FollowTarget';
import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { PathNode } from '../../world/PathNode';
import { Vehicle } from '../../vehicles/Vehicle';

export class FollowPath extends FollowTarget implements ICharacterAI
{
	public nodeRadius: number;
	public reverse: boolean = false;

	private staleTimer: number = 0;
	private targetNode: PathNode;

	constructor(firstNode: PathNode, nodeRadius: number)
	{
		super(firstNode.object, 0);
		this.nodeRadius = nodeRadius;
		this.targetNode = firstNode;
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		// Todo only compute once in followTarget
		let source = new THREE.Vector3();
		let target = new THREE.Vector3();
		this.character.getWorldPosition(source);
		this.target.getWorldPosition(target);
		let viewVector = new THREE.Vector3().subVectors(target, source);
		viewVector.y = 0;

		let targetToNextNode = this.targetNode.nextNode.object.position.clone().sub(this.targetNode.object.position);
		targetToNextNode.y = 0;
		targetToNextNode.normalize();
		let slowDownAngle = viewVector.clone().normalize().dot(targetToNextNode);
		let speed = (this.character.controlledObject as unknown as Vehicle).collision.velocity.length();

		// console.log(slowDownAngle, viewVector.length(), speed);
		if ((slowDownAngle < 0.7 && viewVector.length() < 50 && speed > 10))
		{
			this.character.controlledObject.triggerAction('reverse', true);
			this.character.controlledObject.triggerAction('throttle', false);
		}

		if (speed < 1 || (this.character.controlledObject as unknown as Vehicle).rayCastVehicle.numWheelsOnGround === 0) this.staleTimer += timeStep;
		else this.staleTimer = 0;
		if (this.staleTimer > 5)
		{
			let worldPos = new THREE.Vector3();
			this.targetNode.object.getWorldPosition(worldPos);
			worldPos.y += 3;
			(this.character.controlledObject as unknown as Vehicle).collision.position = Utils.cannonVector(worldPos);
			(this.character.controlledObject as unknown as Vehicle).collision.interpolatedPosition = Utils.cannonVector(worldPos);
			(this.character.controlledObject as unknown as Vehicle).collision.angularVelocity = new CANNON.Vec3();
			(this.character.controlledObject as unknown as Vehicle).collision.quaternion.copy((this.character.controlledObject as unknown as Vehicle).collision.initQuaternion);
			this.staleTimer = 0;
		}

		if (viewVector.length() < this.nodeRadius) 
		{
			if (this.reverse)
			{
				super.setTarget(this.targetNode.previousNode.object);
				this.targetNode = this.targetNode.previousNode;
			}
			else
			{
				super.setTarget(this.targetNode.nextNode.object);
				this.targetNode = this.targetNode.nextNode;
			}
		}
	}
}