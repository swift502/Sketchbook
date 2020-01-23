import * as THREE from 'three';
import * as CANNON from 'cannon';
import { CameraOperator } from './CameraOperator';
import EffectComposer from '@johh/three-effectcomposer';
import { Stats } from '../../lib/utils/Stats';
import { InputManager } from './InputManager';
import { SBObject } from '../objects/SBObject';
import { Character } from '../characters/Character';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { Sky } from './Sky';
import { Path } from '../objects/Path';
export declare class World {
    renderer: THREE.WebGLRenderer;
    camera: THREE.Camera;
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
    objects: SBObject[];
    characters: Character[];
    balls: any[];
    vehicles: any[];
    paths: {
        [id: string]: Path;
    };
    constructor();
    update(timeStep: number): void;
    updatePhysics(timeStep: number): void;
    /**
     * Rendering loop.
     * Implements fps limiter and frame-skipping
     * Calls world's "update" function before rendering.
     * @param {World} world
     */
    render(world: World): void;
    add(object: IWorldEntity): void;
    remove(object: IWorldEntity): void;
    loadScene(gltf: any): void;
    addFloor(): void;
    scrollTheTimeScale(scrollAmount: number): void;
    updateControls(controls: any): void;
    private getGUI;
}
