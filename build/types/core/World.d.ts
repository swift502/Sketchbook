import * as THREE from 'three';
import * as CANNON from 'cannon';
import { CameraOperator } from './CameraOperator';
import EffectComposer from '@johh/three-effectcomposer';
import { default as CSM } from '../../lib/utils/three-csm.module.js';
import { Stats } from '../../lib/utils/Stats';
import { InputManager } from './InputManager';
import { Character } from '../characters/Character';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { Sky } from '../entities/Sky';
import { Path } from '../data/Path';
import { LoadingManager } from './LoadingManager';
import { WelcomeScreen } from "./WelcomeScreen";
import { CannonDebugRenderer } from '../../lib/cannon/CannonDebugRenderer';
import { Vehicle } from '../vehicles/Vehicle';
import { Scenario } from '../data/Scenario';
export declare class World {
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    composer: EffectComposer;
    stats: Stats;
    graphicsWorld: THREE.Scene;
    sky: Sky;
    physicsWorld: CANNON.World;
    parallelPairs: any[];
    physicsFrameRate: number;
    physicsFrameTime: number;
    physicsMaxPrediction: number;
    clock: THREE.Clock;
    renderDelta: number;
    logicDelta: number;
    sinceLastFrame: number;
    justRendered: boolean;
    params: any;
    inputManager: InputManager;
    cameraOperator: CameraOperator;
    timeScaleTarget: number;
    csm: CSM;
    loadingManager: LoadingManager;
    welcomeScreen: WelcomeScreen;
    cannonDebugRenderer: CannonDebugRenderer;
    scenarios: Scenario[];
    characters: Character[];
    vehicles: Vehicle[];
    paths: {
        [id: string]: Path;
    };
    constructor();
    update(timeStep: number): void;
    updatePhysics(timeStep: number): void;
    isOutOfBounds(position: CANNON.Vec3): boolean;
    outOfBoundsRespawn(body: CANNON.Body, position?: CANNON.Vec3): void;
    /**
     * Rendering loop.
     * Implements fps limiter and frame-skipping
     * Calls world's "update" function before rendering.
     * @param {World} world
     */
    render(world: World): void;
    setTimeScale(value: number): void;
    add(object: IWorldEntity): void;
    remove(object: IWorldEntity): void;
    loadScene(gltf: any): void;
    scrollTheTimeScale(scrollAmount: number): void;
    updateControls(controls: any): void;
    private getGUI;
}
