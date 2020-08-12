import * as THREE from 'three';

export class ClosestObjectFinder<T>
{
	public closestObject: T;

	private closestDistance: number = Number.POSITIVE_INFINITY;
	private referencePosition: THREE.Vector3;
	private maxDistance: number = Number.POSITIVE_INFINITY;

	constructor(referencePosition: THREE.Vector3, maxDistance?: number)
	{
		this.referencePosition = referencePosition;
		if (maxDistance !== undefined) this.maxDistance = maxDistance;
	}

	public consider(object: T, objectPosition: THREE.Vector3): void
	{
		let distance = this.referencePosition.distanceTo(objectPosition);

		if (distance < this.maxDistance && distance < this.closestDistance)
		{
			this.closestDistance = distance;
			this.closestObject = object;
		}
	}
}