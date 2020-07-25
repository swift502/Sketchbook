import { FollowTarget } from './FollowTarget';
import { ICharacterAI } from '../../interfaces/ICharacterAI';
import { PathNode } from '../../data/PathNode';
export declare class FollowPath extends FollowTarget implements ICharacterAI {
    nodeRadius: number;
    reverse: boolean;
    private targetNode;
    constructor(firstNode: PathNode, nodeRadius: number);
    update(timeStep: number): void;
}
