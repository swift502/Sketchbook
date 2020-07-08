import * as THREE from 'three';
import * as CANNON from 'cannon';

import { CameraOperator } from './CameraOperator';
import { FXAAShader } from '../../lib/shaders/FXAAShader';
import EffectComposer, {
    RenderPass,
    ShaderPass,
} from '@johh/three-effectcomposer';
import { default as CSM } from '../../lib/utils/three-csm.module.js';

import { WaterShader } from '../../lib/shaders/WaterShader';

import { Detector } from '../../lib/utils/Detector';
import { Stats } from '../../lib/utils/Stats';
import * as GUI from '../../lib/utils/dat.gui';
import * as _ from 'lodash';
import { InputManager } from './InputManager';
import { SBObject } from '../objects/SBObject';
import { Character } from '../characters/Character';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { Sky } from './Sky';
import { BoxPhysics } from '../objects/object_physics/BoxPhysics';
import * as Utils from './Utilities';
import { TrimeshPhysics } from '../objects/object_physics/TrimeshPhysics';
import { Grass } from '../objects/Grass';
import { Path } from '../objects/Path';
import { CollisionGroups } from '../enums/CollisionGroups';
import { LoadingManager } from './LoadingManager';
import { WelcomeScreen } from "./WelcomeScreen";
import { Car } from '../vehicles/Car';
import { Airplane } from '../vehicles/Airplane';
import { Helicopter } from '../vehicles/Helicopter';

export class World
{
    public renderer: THREE.WebGLRenderer;
    public camera: THREE.PerspectiveCamera;
    public composer: EffectComposer;
    public stats: Stats;
    public graphicsWorld: THREE.Scene;
    public sky: Sky;
    // public sun: THREE.Vector3;
    // public dirLight: THREE.DirectionalLight;
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
    public params: any;
    public inputManager: InputManager;
    public cameraOperator: CameraOperator;
    public timeScaleTarget: number;
    public csm: CSM;
    public loadingManager: LoadingManager;
    public welcomeScreen: WelcomeScreen;

    public objects: SBObject[];
    public characters: Character[];
    public balls: any[];
    public vehicles: any[];
    public paths: {[id: string]: Path} = {};

    constructor()
    {
        const scope = this;

        // WebGL not supported
        if (!Detector.webgl)
        {
            Detector.addGetWebGLMessage();
        }

        this.loadingManager = new LoadingManager();
        this.welcomeScreen = new WelcomeScreen();

        // Renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
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

        // Three.js scene
        this.graphicsWorld = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 610);
        this.sky = new Sky(this);
        this.graphicsWorld.add(this.sky);

        let splitsCallback = (amount, near, far) =>
        {
            return [
                Math.pow(1 / 3, 3),
                Math.pow(1 / 3, 2),
                Math.pow(1 / 3, 1),
                Math.pow(1 / 3, 0)
            ];
        };

        this.csm = new CSM({
            fov: 80,
            far: 300,
            lightIntensity: 2.3,
            cascades: 4,
            shadowMapSize: 2048,
            camera: this.camera,
            parent: this.graphicsWorld,
            mode: 'custom',
            customSplitsCallback: splitsCallback
        });

        // FXAA
        let effectFXAA = new ShaderPass(FXAAShader);
        let dpr = (window.devicePixelRatio !== undefined) ? window.devicePixelRatio : 1;
        effectFXAA.uniforms.resolution.value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));

        // Setup composer
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.graphicsWorld, this.camera));
        this.composer.addPass(effectFXAA);

        // Physics
        this.physicsWorld = new CANNON.World();
        this.physicsWorld.gravity.set(0, -9.81, 0);
        this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
        this.physicsWorld.solver.iterations = 10;
        this.physicsWorld.allowSleep = true;

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
            RayCast_Debug: false,
            Phi: 60,
            Theta: 225,
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
        this.params.Time_Scale = THREE.MathUtils.lerp(this.params.Time_Scale, this.timeScaleTarget, 0.2);

        // Rotate and position camera
        this.cameraOperator.update();

        if (this['waterMat'] !== undefined)
        {
            this['waterMat'].uniforms.cameraPos.value.copy(this.camera.position);
            this['waterMat'].uniforms.lightDir.value.copy(new THREE.Vector3().copy(this.sky.sun.position).normalize());
            this['waterMat'].uniforms.iGlobalTime.value += timeStep;
        }

        if (this['grassMat'] !== undefined)
        {
            this['grassMat'].uniforms.time.value += timeStep;

            if (this.characters.length > 0)
            {
                this['grassMat'].uniforms.playerPos.value.copy(this.characters[0].position);
            }

            // console.log(this['grassMat'].uniforms.playerPos.value);
        }

        this.sky.update();

        this.csm.update(this.camera.matrix);
        this.csm.lightDirection = new THREE.Vector3(-this.sky.sun.position.x, -this.sky.sun.position.y, -this.sky.sun.position.z).normalize();

        let awake = 0;
        let sleepy = 0;
        let asleep = 0;
        this.physicsWorld.bodies.forEach((body) =>
        {
            if (body.sleepState === 0) awake++;
            if (body.sleepState === 1) sleepy++;
            if (body.sleepState === 2) asleep++;
        });

        document.getElementById('car-debug').innerHTML = '';
        document.getElementById('car-debug').innerHTML += 'awake: ' + awake;
        document.getElementById('car-debug').innerHTML += '<br>';
        document.getElementById('car-debug').innerHTML += 'sleepy: ' + sleepy;
        document.getElementById('car-debug').innerHTML += '<br>';
        document.getElementById('car-debug').innerHTML += 'asleep: ' + asleep;
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

                obj.position.copy(Utils.threeVector(obj.physics.physical.position));
                obj.quaternion.copy(Utils.threeQuat(obj.physics.physical.quaternion));
                
                // entering vehicles
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

    public loadScene(gltf: any): void
    {
        gltf.scene.traverse((child) => {
            if (child.hasOwnProperty('userData'))
            {
                if (child.type === 'Mesh')
                {
                    Utils.setupMeshProperties(child);
                    this.csm.setupMaterial(child.material);

                    if (child.material.name === 'grass')
                    {
                        let grass = new Grass(child);
                        this.add(grass);

                        // child.material = grass.groundMaterial;
                        this['grassMat'] = grass.grassMaterial;
                    }

                    if (child.material.name === 'ocean')
                    {
                        let uniforms = THREE.UniformsUtils.clone(WaterShader.uniforms);
                        uniforms.iResolution.value.x = window.innerWidth;
                        uniforms.iResolution.value.y = window.innerHeight;

                        child.material = new THREE.ShaderMaterial({
                            uniforms: uniforms,
                            fragmentShader: WaterShader.fragmentShader,
                            vertexShader: WaterShader.vertexShader,
                        });

                        child.material.transparent = true;

                        this['waterMat'] = child.material;
                    }
                }

                if (child.userData.hasOwnProperty('data'))
                {
                    if (child.userData.data === 'physics')
                    {
                        if (child.userData.hasOwnProperty('type')) 
                        {
                            if (child.userData.type === 'box')
                            {
                                let phys2 = new BoxPhysics({size: new THREE.Vector3(child.scale.x, child.scale.y, child.scale.z)});
                                phys2.physical.position.copy(Utils.cannonVector(child.position));
                                phys2.physical.quaternion.copy(Utils.cannonQuat(child.quaternion));
                                phys2.physical.computeAABB();

                                phys2.physical.shapes.forEach((shape) => {
                                    shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
                                });

                                let SBobj = new SBObject();
                                SBobj.setPhysics(phys2);

                                this.add(SBobj);
                            }
                            else if (child.userData.type === 'trimesh')
                            {
                                let phys = new TrimeshPhysics(child, {});

                                let SBobj = new SBObject();
                                SBobj.setPhysics(phys);

                                this.add(SBobj);
                            }

                            child.visible = false;
                        }
                    }

                    if (child.userData.data === 'pathNode')
                    {
                        let pathName = child.userData.path;
                        if (!this.paths.hasOwnProperty(pathName))
                        {
                            this.paths[pathName] = new Path();
                        }

                        this.paths[pathName].addNode(child);
                    }

                    if (child.userData.data === 'spawn')
                    {
                        if (child.userData.type === 'car')
                        {
                            this.loadingManager.loadGLTF('build/assets/car.glb', (model: any) =>
                            {
                                let car = new Car(model);
                                car.setPosition(child.position.x, child.position.y + 1, child.position.z);
                                car.collision.quaternion.copy(Utils.cannonQuat(child.quaternion));
                                this.add(car);
                            });
                        }
                        else if (child.userData.type === 'airplane')
                        {
                            this.loadingManager.loadGLTF('build/assets/airplane.glb', (model: any) =>
                            {
                                let airplane = new Airplane(model);
                                airplane.setPosition(child.position.x, child.position.y + 1, child.position.z);
                                airplane.collision.quaternion.copy(Utils.cannonQuat(child.quaternion));
                                this.add(airplane);
                            });
                        }
                        else if (child.userData.type === 'heli')
                        {
                            this.loadingManager.loadGLTF('build/assets/heli.glb', (model: any) =>
                            {
                                let heli = new Helicopter(model);
                                heli.setPosition(child.position.x, child.position.y + 1, child.position.z);
                                heli.collision.quaternion.copy(Utils.cannonQuat(child.quaternion));
                                this.add(heli);
                            });
                        }
                        else if (child.userData.type === 'player')
                        {
                            this.loadingManager.loadGLTF('build/assets/boxman.glb', (model) =>
                            {
                                let player = new Character(model);
                                player.setPosition(child.position.x, child.position.y, child.position.z);
                                this.add(player);
                                player.setOrientation(new THREE.Vector3(1, 0, 0), true);
                                player.takeControl();
                            });
                        }
                    }
                }
            }
        });

        // Initialize paths
        for (const pathName in this.paths) {
            if (this.paths.hasOwnProperty(pathName)) {
                const path = this.paths[pathName];
                path.connectNodes();
            }
        }

        // console.log(gltf);
        // console.log(this.paths);
        this.graphicsWorld.add(gltf.scene);
    }

    public addFloor(): void {
        let SBobj = new SBObject();
        let phys = new BoxPhysics({size: new THREE.Vector3(100, 1, 100)});
        SBobj.setPhysics(phys);
        SBobj.setModelFromPhysicsShape();
        this.add(SBobj);

        // Ramp
        let SBobj2 = new SBObject();
        let phys2 = new BoxPhysics({size: new THREE.Vector3(10, 1, 10)});
        phys2.physical.position.z = 10;
        phys2.physical.quaternion.setFromEuler(-0.3, 0, 0);
        phys2.physical.computeAABB();
        SBobj2.setPhysics(phys2);
        SBobj2.setModelFromPhysicsShape();
        this.add(SBobj2);

        // Grid helper
        let gridHelper = new THREE.GridHelper( 100, 50, 0x444444, 0xaaaaaa );
        gridHelper.position.y = 1.01;
        this.graphicsWorld.add( gridHelper );
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
            // if (this.params.Time_Scale > 0.9) this.params.Time_Scale *= timeScaleChangeSpeed;
        }
    }

    public updateControls(controls: any): void
    {
        let html = '';
        html += '<div class="info-title">Controls:</div>';

        controls.forEach((row) =>
        {
            html += '<div class="info-row">';
            row.keys.forEach((key) => {
                if (key === '+' || key === 'and' || key === 'or' || key === '&') html += '&nbsp;' + key + '&nbsp;';
                else html += '<span class="key">' + key + '</span>';
            });

            html += '<span class="ctrl-desc">' + row.desc + '</span></div>';
        });

        document.getElementById('controls-menu').innerHTML = html;
    }

    private getGUI(scope: any): GUI
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
                    this.csm.lights.forEach((light) => {
                        light.castShadow = true;
                    });
                }
                else
                {
                    this.csm.lights.forEach((light) => {
                        light.castShadow = false;
                    });
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
            
        // Debug
        let skyFolder = gui.addFolder('Sky');
        skyFolder.add(this.params, 'Phi', 0, 360).listen()
            .onChange((value) =>
            {
                scope.sky.phi = value;
            });
        skyFolder.add(this.params, 'Theta', 0, 360).listen()
            .onChange((value) =>
            {
                scope.sky.theta = value;
            });

        return gui;
    }
}