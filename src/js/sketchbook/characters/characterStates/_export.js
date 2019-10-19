/**
 * Character states are a general way to control how characters behave.
 * They have a complete control of what happens to the character.
 * They're a low-level layer in between the high-level character AI and the
 * characters themselves. States should be independent and not rely on anything
 * other than the character and it's properties. They should be able to start
 * functioning at any point time without any input parameters.
 */

import {Idle} from './Idle';
import {Walk} from './Walk';
import {Sprint} from './Sprint';
import {Falling} from './Falling';
import {DropIdle} from './DropIdle';
import {DropRolling} from './DropRolling';
import {DropRunning} from './DropRunning';
import {StartWalkBackLeft} from './StartWalkBackLeft';
import {StartWalkBackRight} from './StartWalkBackRight';
import {StartWalkLeft} from './StartWalkLeft';
import {StartWalkRight} from './StartWalkRight';
import {StartWalkForward} from './StartWalkForward';
import {EndWalk} from './EndWalk';
import {JumpIdle} from './JumpIdle';
import {JumpRunning} from './JumpRunning';
import {CharacterStateBase} from './CharacterStateBase';

export let CharacterStates = {
    Idle: Idle,
    Walk: Walk,
    Sprint: Sprint,
    StartWalkForward: StartWalkForward,
    StartWalkLeft: StartWalkLeft,
    StartWalkBackLeft: StartWalkBackLeft,
    StartWalkRight: StartWalkRight,
    StartWalkBackRight: StartWalkBackRight,
    EndWalk: EndWalk,
    JumpIdle: JumpIdle,
    JumpRunning: JumpRunning,
    Falling: Falling,
    DropIdle: DropIdle,
    DropRunning: DropRunning,
    DropRolling: DropRolling,
    CharacterStateBase: CharacterStateBase
};