/**
 * Character AI classes are high-level controllers for characters.
 * They should only interact with characters just as a real person
 * would press keys on a keyboard and move the mouse while controlling
 * the character via the CharacterControls game mode. Consequently,
 * they shouldn't call any functions that aren't accessible to a
 * real person while playing the CharacterControls game mode.
 * 
 * It's the AI's responsibility to call for an update of the character's state.
 */

import { Idle } from './Idle';
import { FollowCharacter } from './FollowCharacter';
import { Random } from './Random';

export let CharacterAI = {
    Idle: Idle,
    FollowCharacter: FollowCharacter,
    Random: Random
};