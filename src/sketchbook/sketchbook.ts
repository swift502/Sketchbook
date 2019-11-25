import "../css/dat.gui.css";
import "../css/main.css";
import * as THREEImport from "three";
import * as CANNONImport from 'cannon';

import { FollowCharacter } from './characters/character_ai/FollowCharacter';
import { FollowObject } from './characters/character_ai/FollowObject';
import { RandomBehaviour } from './characters/character_ai/RandomBehaviour';

export const CharacterAI = {
    FollowCharacter,
    FollowObject,
    RandomBehaviour,
};

import { BoxPhysics } from './objects/object_physics/BoxPhysics';
import { CapsulePhysics } from './objects/object_physics/CapsulePhysics';
import { ConvexPhysics } from './objects/object_physics/ConvexPhysics';
import { SpherePhysics } from './objects/object_physics/SpherePhysics';
import { TrimeshPhysics } from './objects/object_physics/TrimeshPhysics';
export const ObjectPhysics = {
    BoxPhysics,
    CapsulePhysics,
    ConvexPhysics,
    SpherePhysics,
    TrimeshPhysics,
};

export {Airplane} from './vehicles/Airplane';
export {Car} from './vehicles/Car';
export {Helicopter} from './vehicles/Helicopter';
export {Wheel} from './vehicles/Wheel';
export {Seat} from './vehicles/Seat';

import * as statesLibrary from './characters/character_states/_stateLibrary';
export const CharacterStates = statesLibrary;

export { Character } from "./characters/Character";
export { KeyBinding as InputController } from "./core/KeyBinding";
export { SBObject } from "./objects/SBObject";
export { World } from "./core/World";

export let THREE = THREEImport;
export let CANNON = CANNONImport;
export { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
export { FBXLoader } from "../lib/utils/FBXLoader";