import '../css/main.css';
import * as THREEImport from 'three';
import * as CANNONImport from 'cannon';

import { FollowTarget } from './characters/character_ai/FollowTarget';
import { FollowPath } from './characters/character_ai/FollowPath';
import { RandomBehaviour } from './characters/character_ai/RandomBehaviour';

export const CharacterAI = {
	FollowTarget,
	FollowPath,
	RandomBehaviour,
};

export {Airplane} from './vehicles/Airplane';
export {Car} from './vehicles/Car';
export {Helicopter} from './vehicles/Helicopter';
export {Wheel} from './vehicles/Wheel';
export {SeatPoint as VehicleSeat} from './data/SeatPoint';
export {VehicleDoor} from './vehicles/VehicleDoor';

import * as statesLibrary from './characters/character_states/_stateLibrary';
export const CharacterStates = statesLibrary;

export { Character } from './characters/Character';
export { KeyBinding } from './core/KeyBinding';
export { World } from './core/World';

export let THREE = THREEImport;
export let CANNON = CANNONImport;
export { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
export { LoadingManager } from './core/LoadingManager';
export { LoadingScreen as WelcomeScreen } from './ui/LoadingScreen';
