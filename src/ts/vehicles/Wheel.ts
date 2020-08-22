import { WheelInfo } from 'cannon';

export class Wheel
{
	public wheelObject: THREE.Object3D;
	public position: THREE.Vector3;
	public steering: boolean = false;
	public drive: string; // Drive type "fwd" or "rwd"
	public rayCastWheelInfoIndex: number; // Linked to a raycast vehicle WheelInfo structure

	constructor(wheelObject: THREE.Object3D)
	{
		this.wheelObject = wheelObject;

		this.position = wheelObject.position;

		if (wheelObject.hasOwnProperty('userData') && wheelObject.userData.hasOwnProperty('data'))
		{
			if (wheelObject.userData.hasOwnProperty('steering')) 
			{
				this.steering = (wheelObject.userData.steering === 'true');
			}

			if (wheelObject.userData.hasOwnProperty('drive')) 
			{
				this.drive = wheelObject.userData.drive;
			}
		}
	}
}