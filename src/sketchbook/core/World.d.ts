import * as THREE from 'three';
import * as CANNON from 'cannon';
import { CameraController } from './CameraController';
import EffectComposer from '@johh/three-effectcomposer';
import { Stats } from '../../lib/utils/Stats';
import { InputManager } from './InputManager';
import { SBObject } from '../objects/SBObject';
import { Character } from '../characters/Character';
export declare class World {
    renderer: THREE.WebGLRenderer;
    camera: THREE.Camera;
    composer: EffectComposer;
    stats: Stats;
    graphicsWorld: THREE.Scene;
    sun: THREE.Vector3;
    dirLight: THREE.DirectionalLight;
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
    params: {
        Pointer_Lock: boolean;
        Mouse_Sensitivity: number;
        FPS_Limit: number;
        Time_Scale: number;
        Shadows: boolean;
        FXAA: boolean;
        Draw_Physics: boolean;
        RayCast_Debug: boolean;
    };
    inputManager: InputManager;
    cameraController: CameraController;
    timeScaleTarget: number;
    cameraDistanceTarget: number;
    objects: SBObject[];
    characters: Character[];
    balls: any[];
    vehicles: any[];
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
    add(object: any): void;
    remove(object: any): void;
    scrollTheTimeScale(scrollAmount: number): void;
}
