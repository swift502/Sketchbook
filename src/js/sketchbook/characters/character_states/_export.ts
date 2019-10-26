/**
 * Character states are a general way to control how characters behave.
 * They have a complete control of what happens to the character.
 * They're a low-level layer in between the high-level character AI and the
 * characters themselves. States should be independent and not rely on anything
 * other than the character and it's properties. They should be able to start
 * functioning at any point time without any input parameters.
 */

import * as library from './_stateLibrary';
export let CharacterStates = library;