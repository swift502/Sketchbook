import { FollowTarget } from './FollowTarget';
import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { PathNode } from '../../objects/PathNode';
import THREE = require('three');

export class FollowPath extends FollowTarget implements ICharacterAI
{
    public nodeRadius: number;
    public reverse: boolean = false;

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