import * as THREE from 'three';
import * as CANNON from 'cannon';

import { CameraOperator } from './CameraOperator';
import { FXAAShader } from '../../lib/shaders/FXAAShader';
import EffectComposer, {
    RenderPass,
    ShaderPass,
} from '@johh/three-effectcomposer';
import * as Sky from 'three-sky';

import { Detector } from '../../lib/utils/Detector';
import { Stats } from '../../lib/utils/Stats';
import * as GUI from '../../lib/utils/dat.gui';
import * as _ from 'lodash';
import { InputManager } from './InputManager';
import { SBObject } from '../objects/SBObject';
import { Character } from '../characters/Character';
import { ObjectPhysics } from '../sketchbook';
import { IWorldEntity } from '../interfaces/IWorldEntity';

export class World
{
    public renderer: THREE.WebGLRenderer;
    public camera: THREE.Camera;
    public composer: EffectComposer;
    public stats: Stats;
    public graphicsWorld: THREE.Scene;
    public sun: THREE.Vector3;
    public dirLight: THREE.DirectionalLight;
    public physicsWorld: CANNON.World;
    public parallelPairs: any[];
    public physicsFrameRate: number;
    public physicsFrameTime: number;
    public physicsMaxPrediction: number;
    public clock: THREE.Clock;
    public renderDelta: number;
    public logicDelta: number;
    public sinceLastFrame: number;
    public justRendered: boolean;
    public params: { Pointer_Lock: boolean; Mouse_Sensitivity: number; FPS_Limit: number; Time_Scale: number; Shadows: boolean; FXAA: boolean; Draw_Physics: boolean; RayCast_Debug: boolean; };
    public inputManager: InputManager;
    public cameraOperator: CameraOperator;
    public timeScaleTarget: number;

    public objects: SBObject[];
    public characters: Character[];
    public balls: any[];
    public vehicles: any[];

    constructor()
    {
        const scope = this;

        //#region HTML

        // WebGL not supported
        if (!Detector.webgl)
        {
            Detector.addGetWebGLMessage();
        }

        // Renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        this.renderer.domElement.id = 'canvas';

        // Auto window resize
        function onWindowResize(): void
        {
            scope.camera['aspect'] = window.innerWidth / window.innerHeight;
            scope.camera['updateProjectionMatrix']();
            scope.renderer.setSize(window.innerWidth, window.innerHeight);
            effectFXAA.uniforms.resolution.value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
            scope.composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
        }
        window.addEventListener('resize', onWindowResize, false);

        // Stats (FPS, Frame time, Memory)
        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        //#endregion

        //#region Graphics

        this.graphicsWorld = new THREE.Scene();

        // Fog
        // this.graphicsWorld.fog = new THREE.FogExp2(0xC8D3D5, 0.25);

        // Camera
        this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 120);

        // FXAA
        let effectFXAA = new ShaderPass(FXAAShader);
        let dpr = (window.devicePixelRatio !== undefined) ? window.devicePixelRatio : 1;
        effectFXAA.uniforms.resolution.value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));

        // Setup composer
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.graphicsWorld, this.camera));
        this.composer.addPass(effectFXAA);
        
        // Sky
        let sky = new Sky();
        sky.scale.setScalar(100);
        this.graphicsWorld.add(sky);

        // Sun helper
        this.sun = new THREE.Vector3();
        this.sun.x = -0.5;
        this.sun.y = 1;
        this.sun.z = -0.5;
        sky.material.uniforms.sunPosition.value.copy(this.sun);

        // Lighting
        let ambientLight = new THREE.AmbientLight(0xaaaaaa); // soft white light
        this.graphicsWorld.add(ambientLight);

        // Sun light with shadowmap
        let dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
        this.dirLight = dirLight;
        dirLight.castShadow = true;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 1;
        dirLight.shadow.camera.far = 50;

        dirLight.shadow.camera.top = 15;
        dirLight.shadow.camera.right = 15;
        dirLight.shadow.camera.bottom = -15;
        dirLight.shadow.camera.left = -15;

        this.graphicsWorld.add(dirLight);

        //#endregion

        // Physics
        this.physicsWorld = new CANNON.World();
        this.physicsWorld.gravity.set(0, -9.81, 0);
        this.physicsWorld.broadphase = new CANNON.NaiveBroadphase();
        this.physicsWorld.solver.iterations = 10;

        this.parallelPairs = [];
        this.physicsFrameRate = 60;
        this.physicsFrameTime = 1 / this.physicsFrameRate;
        this.physicsMaxPrediction = this.physicsFrameRate;

        // RenderLoop
        this.clock = new THREE.Clock();
        this.renderDelta = 0;
        this.logicDelta = 0;
        this.sinceLastFrame = 0;
        this.justRendered = false;

        //#region ParamGUI

        // Variables
        let params = {
            Pointer_Lock: true,
            Mouse_Sensitivity: 0.3,
            FPS_Limit: 60,
            Time_Scale: 1,
            Shadows: true,
            FXAA: true,
            Draw_Physics: false,
            RayCast_Debug: false
        };
        this.params = params;

        let gui = this.getGUI(scope);
        gui.open();

        // Changing time scale with scroll wheel
        this.timeScaleTarget = 1;

        //#endregion

        // Initialization
        this.balls = [];
        this.objects = [];
        this.characters = [];
        this.vehicles = [];
        this.cameraOperator = new CameraOperator(this, this.camera, this.params.Mouse_Sensitivity);
        this.inputManager = new InputManager(this, this.renderer.domElement);

        this.render(this);
    }

    // Update
    // Handles all logic updates.
    public update(timeStep: number): void
    {
        this.updatePhysics(timeStep);

        // Objects
        this.objects.forEach((obj) =>
        {
            obj.update(timeStep);
        });
                    
        // Characters
        this.characters.forEach((char) =>
        {
            char.update(timeStep);
            char.updateMatrixWorld();
        });

        this.vehicles.forEach((vehicle) => {
            vehicle.update(timeStep);
            // vehicle.updateMatrixWorld();
        });

        this.inputManager.update(timeStep);

        // Lerp parameters
        this.params.Time_Scale = THREE.Math.lerp(this.params.Time_Scale, this.timeScaleTarget, 0.2);

        // Rotate and position camera
        this.cameraOperator.update();
    }

    public updatePhysics(timeStep: number): void
    {
        // Step the physics world
        this.physicsWorld.step(this.physicsFrameTime, timeStep, this.physicsMaxPrediction);

        // Sync physics/visuals
        this.objects.forEach((obj) =>
        {
            if (obj.physics.physical !== undefined)
            {
                if (obj.physics.physical.position.y < -5)
                {
                    obj.physics.physical.position.x = 1.13;
                    obj.physics.physical.position.y = 5;
                    obj.physics.physical.position.z = -2.2;

                    obj.physics.physical.interpolatedPosition.x = 1.13;
                    obj.physics.physical.interpolatedPosition.y = 5;
                    obj.physics.physical.interpolatedPosition.z = -2.2;
                }

                obj.position.copy(obj.physics.physical.position);
                obj.quaternion.copy(obj.physics.physical.quaternion);
                
                //entering vehicles
                // obj.position.copy(obj.physics.physical.interpolatedPosition);
                // obj.quaternion.copy(obj.physics.physical.interpolatedQuaternion);
            }
        });
    }

    /**
     * Rendering loop.
     * Implements fps limiter and frame-skipping
     * Calls world's "update" function before rendering.
     * @param {World} world 
     */
    public render(world: World): void
    {
        // Stats begin
        if (this.justRendered)
        {
            this.justRendered = false;
            this.stats.begin();
        }

        requestAnimationFrame(() =>
        {
            world.render(world);
        });

        // Measuring render time
        this.renderDelta = this.clock.getDelta();

        // Getting timeStep
        let timeStep = (this.renderDelta + this.logicDelta) * this.params.Time_Scale;

        // Logic
        world.update(timeStep);

        // Measuring logic time
        this.logicDelta = this.clock.getDelta();

        // Frame limiting
        let interval = 1 / this.params.FPS_Limit;
        this.sinceLastFrame += this.renderDelta + this.logicDelta;
        if (this.sinceLastFrame > interval)
        {
            this.sinceLastFrame %= interval;

            // Actual rendering with a FXAA ON/OFF switch
            if (this.params.FXAA) this.composer.render();
            else this.renderer.render(this.graphicsWorld, this.camera);

            // Stats end
            this.stats.end();
            this.justRendered = true;
        }
    }

    public add(object: IWorldEntity): void
    {
        object.addToWorld(this);
    }

    public remove(object: IWorldEntity): void
    {
        object.removeFromWorld(this);
    }

    public addFloor(): void {
        let SBobj = new SBObject();
        let phys = new ObjectPhysics.BoxPhysics({size: new THREE.Vector3(100, 1, 100)});
        SBobj.setPhysics(phys);
        SBobj.setModelFromPhysicsShape();
        this.add(SBobj);
    }

    public scrollTheTimeScale(scrollAmount: number): void
    {
        // Changing time scale with scroll wheel
        const timeScaleBottomLimit = 0.003;
        const timeScaleChangeSpeed = 1.3;
    
        if (scrollAmount > 0)
        {
            this.timeScaleTarget /= timeScaleChangeSpeed;
            if (this.timeScaleTarget < timeScaleBottomLimit) this.timeScaleTarget = 0;
        }
        else
        {
            this.timeScaleTarget *= timeScaleChangeSpeed;
            if (this.timeScaleTarget < timeScaleBottomLimit) this.timeScaleTarget = timeScaleBottomLimit;
            this.timeScaleTarget = Math.min(this.timeScaleTarget, 1);
            if (this.params.Time_Scale > 0.9) this.params.Time_Scale *= timeScaleChangeSpeed;
        }
    }

    private getGUI(scope): GUI
    {
        const gui = new GUI.GUI();

        // Input
        let inputFolder = gui.addFolder('Input');
        inputFolder.add(this.params, 'Pointer_Lock')
            .onChange((enabled) =>
            {
                scope.inputManager.setPointerLock(enabled);
            });
        inputFolder.add(this.params, 'Mouse_Sensitivity', 0, 1)
            .onChange((value) =>
            {
                scope.cameraController.setSensitivity(value, value * 0.8);
            });

        // Graphics
        let graphicsFolder = gui.addFolder('Rendering');
        graphicsFolder.add(this.params, 'FPS_Limit', 0, 60);
        graphicsFolder.add(this.params, 'Time_Scale', 0, 1).listen()
            .onChange((value) =>
            {
                scope.timeScaleTarget = value;
            });
        graphicsFolder.add(this.params, 'Shadows')
            .onChange((enabled) =>
            {
                if (enabled)
                {
                    this.dirLight.castShadow = true;
                }
                else
                {
                    this.dirLight.castShadow = false;
                }
            });
        graphicsFolder.add(this.params, 'FXAA');

        // Debug
        let debugFolder = gui.addFolder('Debug');
        debugFolder.add(this.params, 'Draw_Physics')
            .onChange((enabled) =>
            {
                scope.objects.forEach((obj) =>
                {
                    if (obj.physics.visual !== undefined)
                    {
                        if (enabled) obj.physics.visual.visible = true;
                        else obj.physics.visual.visible = false;
                    }
                });
            });
        debugFolder.add(this.params, 'RayCast_Debug')
            .onChange((enabled) =>
            {
                scope.characters.forEach((char) =>
                {
                    if (enabled) char.raycastBox.visible = true;
                    else char.raycastBox.visible = false;
                });
            });

        return gui;
    }
}