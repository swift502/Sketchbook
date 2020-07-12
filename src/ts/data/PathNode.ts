import { Path } from './Path';
import { Object3D } from 'three';

export class PathNode
{
    public object: Object3D;
    public path: Path;
    public nextNode: PathNode;
    public previousNode: PathNode;
}