/**
 * Character states are a general way to control how characters behave.
 * They have a complete control of what happens to the character.
 * They're a low-level layer in between the high-level character AI and the
 * characters themselves. States should be independent and not rely on anything
 * other than the character and it's properties. They should be able to start
 * functioning at any point time without any input parameters.
 */

import
{
    CharacterStateBase,
    DropIdle,
    DropRolling,
    DropRunning,
    EndWalk,
    Falling,
    Idle,
    IdleRotateLeft,
    IdleRotateRight,
    JumpIdle,
    JumpRunning,
    Sprint,
    StartWalkBase,
    StartWalkBackLeft,
    StartWalkBackRight,
    StartWalkForward,
    StartWalkLeft,
    StartWalkRight,
    Walk
} from './_stateLibrary';


export let CharacterStates = {
    CharacterStateBase: CharacterStateBase,
    DropIdle: DropIdle,
    DropRolling: DropRolling,
    DropRunning: DropRunning,
    EndWalk: EndWalk,
    Falling: Falling,
    Idle: Idle,
    IdleRotateLeft: IdleRotateLeft,
    IdleRotateRight: IdleRotateRight,
    JumpIdle: JumpIdle,
    JumpRunning: JumpRunning,
    Sprint: Sprint,
    StartWalkBase: StartWalkBase,
    StartWalkBackLeft: StartWalkBackLeft,
    StartWalkBackRight: StartWalkBackRight,
    StartWalkForward: StartWalkForward,
    StartWalkLeft: StartWalkLeft,
    StartWalkRight: StartWalkRight,
    Walk: Walk
};