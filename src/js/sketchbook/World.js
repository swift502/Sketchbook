import * as THREE from 'three';
import * as CANNON from 'cannon';

import { CameraController } from './CameraController';
import { GameModes } from './GameModes';
import { Utilities as Utils } from './Utilities';
import { Shaders } from '../lib/shaders/Shaders';

import { Detector } from '../lib/utils/Detector';
import { Stats } from '../lib/utils/Stats';
import { GUI } from '../lib/utils/dat.gui';
import _ from 'lodash';
import { InputManager } from './InputManager';

export class World
{
    constructor()
    {
        const scope = this;

        //#region HTML

        // WebGL not supported
        if (!Detector.webgl) Detector.addGetWebGLMessage();

        // Renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        this.renderer.domElement.id = 'canvas';

        // Auto window resize
        function onWindowResize()
        {
            scope.camera.aspect = window.innerWidth / window.innerHeight;
            scope.camera.updateProjectionMatrix();
            scope.renderer.setSize(window.innerWidth, window.innerHeight);
            effectFXAA.uniforms['resolution'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
            scope.composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
        }
        window.addEventListener('resize', onWindowResize, false);

        // Stats (FPS, Frame time, Memory)
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        //#endregion

        //#region Graphics

        this.graphicsWorld = new THREE.Scene();

        // Fog
        // this.graphicsWorld.fog = new THREE.FogExp2(0xC8D3D5, 0.25);

        // Camera
        this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 120);

        // Scene render pass
        let renderScene = new Shaders.RenderPass(this.graphicsWorld, this.camera);

        // DPR for FXAA
        let dpr = 1;
        if (window.devicePixelRatio !== undefined)
        {
            dpr = window.devicePixelRatio;
        }
        // FXAA
        let effectFXAA = new Shaders.ShaderPass(Shaders.FXAAShader);
        effectFXAA.uniforms['resolution'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
        effectFXAA.renderToScreen = true;

        // Composer
        this.composer = new Shaders.EffectComposer(this.renderer);
        this.composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
        this.composer.addPass(renderScene);
        this.composer.addPass(effectFXAA);

        // Sky
        let sky = new Shaders.Sky();
        sky.scale.setScalar(100);
        this.graphicsWorld.add(sky);

        // Sun helper
        this.sun = new THREE.Vector3();
        this.sun.x = -1;
        this.sun.y = 1;
        this.sun.z = -1;
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

        dirLight.shadow.camera;
        this.graphicsWorld.add(dirLight);

        //#endregion

        //#region Physics

        this.physicsWorld = new CANNON.World();
        this.physicsWorld.gravity.set(0, -9.81, 0);
        this.physicsWorld.broadphase = new CANNON.NaiveBroadphase();
        this.physicsWorld.solver.iterations = 10;

        this.parallelPairs = [];
        this.physicsFrameRate = 60;
        this.physicsFrameTime = 1 / this.physicsFrameRate;
        this.physicsMaxPrediction = this.physicsFrameRate;

        //#endregion

        //#region RenderLoop

        this.clock = new THREE.Clock();
        this.renderDelta = 0;
        this.logicDelta = 0;
        this.sinceLastFrame = 0;
        this.justRendered = false;

        //#endregion

        //#region ParamGUI

        // Variables
        let params = {
            Pointer_Lock: true,
            Mouse_Sensitivity: 0.3,
            FPS_Limit: 60,
            Time_Scale: 1,
            Shadows: true,
            FXAA: false,
            Draw_Physics: false,
            RayCast_Debug: false
        };
        this.params = params;

        let gui = new GUI();
        // Input
        let input_folder = gui.addFolder('Input');
        input_folder.add(params, 'Pointer_Lock')
            .onChange(function (enabled)
            {
                scope.inputManager.setPointerLock(enabled);
            });
        input_folder.add(params, 'Mouse_Sensitivity', 0, 1)
            .onChange(function (value)
            {
                scope.cameraController.setSensitivity(value, value * 0.8);
            });

        // Graphics
        let graphics_folder = gui.addFolder('Rendering');
        graphics_folder.add(params, 'FPS_Limit', 0, 60);
        graphics_folder.add(params, 'Time_Scale', 0, 1).listen()
            .onChange(function (value)
            {
                scope.timeScaleTarget = value;
            });
        graphics_folder.add(params, 'Shadows')
            .onChange(function (enabled)
            {
                if (enabled)
                {
                    dirLight.castShadow = true;
                }
                else
                {
                    dirLight.castShadow = false;
                }
            });
        graphics_folder.add(params, 'FXAA');

        // Debug
        let debug_folder = gui.addFolder('Debug');
        debug_folder.add(params, 'Draw_Physics')
            .onChange(function (enabled)
            {
                scope.objects.forEach(obj =>
                {
                    if (obj.physics.visual != undefined)
                    {
                        if (enabled) obj.physics.visual.visible = true;
                        else obj.physics.visual.visible = false;
                    }
                });
            });
        debug_folder.add(params, 'RayCast_Debug')
            .onChange(function (enabled)
            {
                scope.characters.forEach(char =>
                {
                    if (enabled) char.raycastBox.visible = true;
                    else char.raycastBox.visible = false;
                });
            });

        gui.open();

        // Changing time scale with scroll wheel
        this.timeScaleTarget = 1;
        this.cameraDistanceTarget = 1.6;

        //#endregion

        //Initialization
        this.balls = [];
        this.objects = [];
        this.characters = [];
        this.vehicles = [];
        this.cameraController = new CameraController(this.camera, this.params.Mouse_Sensitivity, this.params.Mouse_Sensitivity * 0.7);
        this.inputManager = new InputManager(this, this.renderer.domElement);
        this.setGameMode(new GameModes.FreeCameraControls());

        this.render(this);
    }

    setGameMode(gameMode) {
        gameMode.world = this;
        this.gameMode = gameMode;
        gameMode.init();
    }

    // Update
    // Handles all logic updates.
    update(timeStep)
    {
        this.updatePhysics(timeStep);

        // Objects
        this.objects.forEach(obj =>
        {
            obj.update(timeStep);
        });
                    
        // Characters
        this.characters.forEach(char =>
        {
            char.behaviour.update(timeStep);
            char.updateMatrixWorld();
        });

        this.gameMode.update(timeStep);

        // Lerp parameters
        this.params.Time_Scale = THREE.Math.lerp(this.params.Time_Scale, this.timeScaleTarget, 0.2);
        this.cameraController.radius = THREE.Math.lerp(this.cameraController.radius, this.cameraDistanceTarget, 0.1);

        // Rotate and position camera
        this.cameraController.update();
    }

    updatePhysics(timeStep)
    {
        // Step the physics world
        this.physicsWorld.step(this.physicsFrameTime, timeStep, this.physicsMaxPrediction);

        // Sync physics/visuals
        this.objects.forEach(obj =>
        {
            if (obj.physics.physical != undefined)
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

                obj.position.copy(obj.physics.physical.interpolatedPosition);
                obj.quaternion.copy(obj.physics.physical.interpolatedQuaternion);
            }
        });
    }

    /**
     * Rendering loop.
     * Implements custom fps limit and frame-skipping
     * Calls the "update" function before rendering.
     * @param {World} world 
     */
    render(world)
    {
        // Stats begin
        if (this.justRendered)
        {
            this.justRendered = false;
            this.stats.begin();
        }

        requestAnimationFrame(function ()
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

    add(object)
    {
        if (object.isObject)
        {
            if(_.includes(this.objects, object))
            {
                console.warn('Adding object to a world in which it already exists.');
            }
            else 
            {
                this.objects.push(object);

                if (object.physics.physical !== undefined)
                {
                    this.physicsWorld.addBody(object.physics.physical);
                }

                if (object.physics.visual !== undefined)
                {
                    this.graphicsWorld.add(object.physics.visual);
                }

                if (object.model !== undefined)
                {
                    this.graphicsWorld.add(object.model);
                }
            }
        }
        else if (object.isCharacter)
        {

            const character = object;

            if(_.includes(this.characters, character))
            {
                console.warn('Adding character to a world in which it already exists.');
            }
            else
            {
                // Set world
                character.world = this;

                // Register character
                this.characters.push(character);

                // Register physics
                this.physicsWorld.addBody(character.characterCapsule.physics.physical);

                // Add to graphicsWorld
                this.graphicsWorld.add(character);
                this.graphicsWorld.add(character.characterCapsule.physics.visual);
                this.graphicsWorld.add(character.raycastBox);

                // Register characters physical capsule object
                this.objects.push(character.characterCapsule);

                return character;
            }
        }
        else
        {
            console.error('Object type not supported: ' + object);
        }
    }

    remove(object)
    {
        if (object.isObject)
        {
            if(!_.includes(this.objects, object))
            {
                console.warn('Removing object from a world in which it isn\'t present.');
            }
            else 
            {
                _.pull(this.objects, object);

                if (object.physics.physical !== undefined)
                {
                    this.physicsWorld.removeBody(object.physics.physical);
                }

                if (object.physics.visual !== undefined)
                {
                    this.graphicsWorld.remove(object.physics.visual);
                }

                if (object.model !== undefined)
                {
                    this.graphicsWorld.remove(object.model);
                }
            }
        }
        else if (object.isCharacter)
        {
            const character = object;

            if(!_.includes(this.characters, character))
            {
                console.warn('Removing character from a world in which it isn\'t present.');
            }
            else
            {
                character.world = undefined;

                // Remove from characters
                _.pull(this.characters, character);

                // Remove physics
                this.physicsWorld.removeBody(character.characterCapsule.physics.physical);

                // Remove visuals
                this.graphicsWorld.remove(character);
                this.graphicsWorld.remove(character.characterCapsule.physics.visual);
                this.graphicsWorld.remove(character.raycastBox);

                // Remove capsule object
                _.pull(this.objects, character.characterCapsule);

                return character;
            }
        }
        else
        {
            console.error('Object type not supported: ' + object);
        }
    }
}

