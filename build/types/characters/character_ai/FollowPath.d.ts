import { FollowTarget } from "./FollowTarget";
import { ICharacterAI } from "src/sketchbook/interfaces/ICharacterAI";
import { PathNode } from "src/sketchbook/objects/PathNode";
export declare class FollowPath extends FollowTarget implements ICharacterAI {
    nodeRadius: any;
    reverse: boolean;
    private targetNode;
    constructor(firstNode: PathNode, nodeRadius: number);
    update(timeStep: number): void;
}
