import { FollowObject } from "./FollowObject";
import { Character } from "../Character";
export declare class FollowCharacter extends FollowObject {
    constructor(targetCharacter: Character, stopDistance?: number);
    setTarget(targetCharacter: Character): void;
}
