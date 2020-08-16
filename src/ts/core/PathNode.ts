import { Path } from './Path';
import { Object3D } from 'three';

export class PathNode
{
	public object: Object3D;
	public path: Path;
	public nextNode: PathNode;
	public previousNode: PathNode;

	constructor(child: THREE.Object3D, path: Path)
	{
		this.object = child;
		this.path = path;
	}
}