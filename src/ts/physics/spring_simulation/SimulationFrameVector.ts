export class SimulationFrameVector {
	public position: THREE.Vector3;
	public velocity: THREE.Vector3;

	constructor(position: THREE.Vector3, velocity: THREE.Vector3)
	{
		this.position = position;
		this.velocity = velocity;
	}
}