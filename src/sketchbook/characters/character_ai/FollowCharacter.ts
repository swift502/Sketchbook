import { FollowObject } from "./FollowObject";
import { Character } from "../Character";

export class FollowCharacter extends FollowObject
{
    constructor(targetCharacter: Character, stopDistance: number = 1.3)
    {
        super(targetCharacter, stopDistance);
    }

    public setTarget(targetCharacter: Character): void
    {
        super.setTarget(targetCharacter);
    }
}