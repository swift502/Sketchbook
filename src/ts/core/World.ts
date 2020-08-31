import * as THREE from 'three';
import * as CANNON from 'cannon';

import { CameraOperator } from './CameraOperator';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader  } from 'three/examples/jsm/shaders/FXAAShader';
import { default as CSM } from 'three-csm';

import { WaterShader } from '../../lib/shaders/WaterShader';

import { Detector } from '../../lib/utils/Detector';
import { Stats } from '../../lib/utils/Stats';
import * as GUI from '../../lib/utils/dat.gui';
import * as _ from 'lodash';
import { InputManager } from './InputManager';
import { Character } from '../characters/Character';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { Sky } from './Sky';
import * as Utils from './FunctionLibrary';
import { Grass } from './Grass';
import { Path } from './Path';
import { CollisionGroups } from '../enums/CollisionGroups';
import { LoadingManager } from './LoadingManager';
import { LoadingScreen } from '../ui/LoadingScreen';
import { BoxCollider } from '../physics/colliders/BoxCollider';
import { TrimeshCollider } from '../physics/colliders/TrimeshCollider';
import { CannonDebugRenderer } from '../../lib/cannon/CannonDebugRenderer';
import { Vehicle } from '../vehicles/Vehicle';
import { Scenario } from './Scenario';
import { CustomConsole } from '../ui/CustomConsole';

export class World
{
	public renderer: THREE.WebGLRenderer;
	public camera: THREE.PerspectiveCamera;
	public composer: any;
	public stats: Stats;
	public graphicsWorld: THREE.Scene;
	public sky: Sky;
	public physicsWorld: CANNON.World;
	public parallelPairs: any[];
	public physicsFrameRate: number;
	public physicsFrameTime: number;
	public physicsMaxPrediction: number;
	public clock: THREE.Clock;
	public renderDelta: number;
	public logicDelta: number;
	public requestDelta: number;
	public sinceLastFrame: number;
	public justRendered: boolean;
	public params: any;
	public inputManager: InputManager;
	public cameraOperator: CameraOperator;
	public timeScaleTarget: number = 1;
	public csm: CSM;
	public loadingManager: LoadingManager;
	public loadingScreen: LoadingScreen;
	public customConsole: CustomConsole;
	public cannonDebugRenderer: CannonDebugRenderer;
	public scenarios: Scenario[] = [];
	public characters: Character[] = [];
	public vehicles: Vehicle[] = [];
	public paths: Path[] = [];
	public scenarioGUIFolder: any;

	private lastScenarioID: string;

	constructor()
	{
		const scope = this;

		// WebGL not supported
		if (!Detector.webgl)
		{
			Detector.addGetWebGLMessage();
		}

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
			scope.camera.aspect = window.innerWidth / window.innerHeight;
			scope.camera.updateProjectionMatrix();
			scope.renderer.setSize(window.innerWidth, window.innerHeight);
			fxaaPass.uniforms['resolution'].value.set(1 / (window.innerWidth * pixelRatio), 1 / (window.innerHeight * pixelRatio));
			scope.composer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
		}
		window.addEventListener('resize', onWindowResize, false);

		// Stats (FPS, Frame time, Memory)
		this.stats = Stats();
		// document.body.appendChild(this.stats.dom);

		// Three.js scene
		this.graphicsWorld = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1010);
		this.sky = new Sky(this);
		this.graphicsWorld.add(this.sky);

		// New version
		// let splitsCallback = (amount, near, far, target) =>
		// {
		// 	for (let i = amount - 1; i >= 0; i--)
		// 	{
		// 		target.push(Math.pow(1 / 3, i));
		// 	}
		// };

		// Legacy
		let splitsCallback = (amount, near, far) =>
		{
			let arr = [];

			for (let i = amount - 1; i >= 0; i--)
			{
				arr.push(Math.pow(1 / 3, i));
			}

			return arr;
		};

		this.csm = new CSM({
			fov: 80,
			far: 300,	// maxFar
			lightIntensity: 2.5,
			cascades: 4,
			shadowMapSize: 2048,
			camera: this.camera,
			parent: this.graphicsWorld,
			mode: 'custom',
			customSplitsCallback: splitsCallback
		});
		this.csm.fade = true;

		// Passes
		let renderPass = new RenderPass( this.graphicsWorld, this.camera );
		let fxaaPass = new ShaderPass( FXAAShader );

		// FXAA
		let pixelRatio = this.renderer.getPixelRatio();
		fxaaPass.material['uniforms'].resolution.value.x = 1 / ( window.innerWidth * pixelRatio );
		fxaaPass.material['uniforms'].resolution.value.y = 1 / ( window.innerHeight * pixelRatio );

		// Composer
		this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( renderPass );
		this.composer.addPass( fxaaPass );

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
		this.params = {
			Pointer_Lock: true,
			Mouse_Sensitivity: 0.3,
			Time_Scale: 1,
			Shadows: true,
			FXAA: true,
			Draw_Physics: false,
			Sun_Phi: 60,
			Sun_Theta: 225,
		};

		let gui = this.getGUI(scope);
		gui.open();

		//#endregion

		// Initialization
		this.cameraOperator = new CameraOperator(this, this.camera, this.params.Mouse_Sensitivity);
		this.inputManager = new InputManager(this, this.renderer.domElement);
		this.loadingManager = new LoadingManager(this);

		// UI
		this.loadingScreen = new LoadingScreen(this);
		this.customConsole = new CustomConsole();

		this.render(this);
	}

	// Update
	// Handles all logic updates.
	public update(timeStep: number, unscaledTimeStep: number): void
	{
		this.updatePhysics(timeStep);

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

		this.inputManager.update(timeStep, unscaledTimeStep);
		this.loadingManager.update(unscaledTimeStep);

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
		}

		this.sky.update();

		this.csm.update(this.camera.matrix);
		this.csm.lightDirection = new THREE.Vector3(-this.sky.sun.position.x, -this.sky.sun.position.y, -this.sky.sun.position.z).normalize();

		// UI
		this.customConsole.update(timeStep);

		// let awake = 0;
		// let sleepy = 0;
		// let asleep = 0;
		// this.physicsWorld.bodies.forEach((body) =>
		// {
		//     if (body.sleepState === 0) awake++;
		//     if (body.sleepState === 1) sleepy++;
		//     if (body.sleepState === 2) asleep++;
		// });

		if (this.params.Draw_Physics) this.cannonDebugRenderer.update();

		// document.getElementById('car-debug').innerHTML = '';
		// document.getElementById('car-debug').innerHTML += 'awake: ' + awake;
		// document.getElementById('car-debug').innerHTML += '<br>';
		// document.getElementById('car-debug').innerHTML += 'sleepy: ' + sleepy;
		// document.getElementById('car-debug').innerHTML += '<br>';
		// document.getElementById('car-debug').innerHTML += 'asleep: ' + asleep;
	}

	public updatePhysics(timeStep: number): void
	{
		// Step the physics world
		this.physicsWorld.step(this.physicsFrameTime, timeStep);

		this.characters.forEach((char) => {
			if (this.isOutOfBounds(char.characterCapsule.body.position))
			{
				this.outOfBoundsRespawn(char.characterCapsule.body);
			}
		});

		this.vehicles.forEach((vehicle) => {
			if (this.isOutOfBounds(vehicle.rayCastVehicle.chassisBody.position))
			{
				let worldPos = new THREE.Vector3();
				vehicle.spawnPoint.getWorldPosition(worldPos);
				worldPos.y += 1;
				this.outOfBoundsRespawn(vehicle.rayCastVehicle.chassisBody, Utils.cannonVector(worldPos));
			}
		});
	}

	public isOutOfBounds(position: CANNON.Vec3): boolean
	{
		let inside = position.x > -211.882 && position.x < 211.882 &&
					position.z > -169.098 && position.z < 153.232 &&
					position.y > 0.107;
		let belowSeaLevel = position.y < 14.989;

		return !inside && belowSeaLevel;
	}

	public outOfBoundsRespawn(body: CANNON.Body, position?: CANNON.Vec3): void
	{
		let newPos = position || new CANNON.Vec3(0, 16, 0);
		let newQuat = new CANNON.Quaternion(0, 0, 0, 1);

		body.position.copy(newPos);
		body.interpolatedPosition.copy(newPos);
		body.quaternion.copy(newQuat);
		body.interpolatedQuaternion.copy(newQuat);
		body.velocity.setZero();
		body.angularVelocity.setZero();
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
		// if (this.justRendered)
		// {
		// 	this.justRendered = false;
		// 	this.stats.begin();
		// }

		this.requestDelta = this.clock.getDelta();

		requestAnimationFrame(() =>
		{
			world.render(world);
		});

		// Getting timeStep
		let unscaledTimeStep = (this.requestDelta + this.renderDelta + this.logicDelta) ;
		let timeStep = unscaledTimeStep * this.params.Time_Scale;
		timeStep = Math.min(timeStep, 1 / 30);    // min 30 fps

		// Logic
		world.update(timeStep, unscaledTimeStep);

		// Measuring logic time
		this.logicDelta = this.clock.getDelta();

		// Frame limiting
		let interval = 1 / 60;
		this.sinceLastFrame += this.requestDelta + this.renderDelta + this.logicDelta;
		this.sinceLastFrame %= interval;

		// Stats end
		this.stats.end();
		this.stats.begin();

		// Actual rendering with a FXAA ON/OFF switch
		if (this.params.FXAA) this.composer.render();
		else this.renderer.render(this.graphicsWorld, this.camera);

		// Measuring render time
		this.renderDelta = this.clock.getDelta();
	}

	public setTimeScale(value: number): void
	{
		this.params.Time_Scale = value;
		this.timeScaleTarget = value;
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
							// Convex doesn't work! Stick to boxes!
							if (child.userData.type === 'box')
							{
								let phys = new BoxCollider({size: new THREE.Vector3(child.scale.x, child.scale.y, child.scale.z)});
								phys.body.position.copy(Utils.cannonVector(child.position));
								phys.body.quaternion.copy(Utils.cannonQuat(child.quaternion));
								phys.body.computeAABB();

								phys.body.shapes.forEach((shape) => {
									shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
								});

								this.physicsWorld.addBody(phys.body);
							}
							else if (child.userData.type === 'trimesh')
							{
								let phys = new TrimeshCollider(child, {});
								this.physicsWorld.addBody(phys.body);
							}

							child.visible = false;
						}
					}

					if (child.userData.data === 'path')
					{
						this.paths.push(new Path(child));
					}

					if (child.userData.data === 'scenario')
					{
						this.scenarios.push(new Scenario(child, this));
					}
				}
			}
		});

		this.graphicsWorld.add(gltf.scene);

		// Launch default scenario
		for (const scenario of this.scenarios) {
			if (scenario.default || scenario.spawnAlways) {
				if (scenario.default) this.lastScenarioID = scenario.id;
				scenario.launch(this);
			}
		}
	}
	
	public launchScenario(scenarioID: string): void
	{
		this.lastScenarioID = scenarioID;

		this.clearEntities();

		// Launch default scenario
		for (const scenario of this.scenarios) {
			if (scenario.id === scenarioID || scenario.spawnAlways) {
				scenario.launch(this);
			}
		}
	}

	public restartScenario(): void
	{
		if (this.lastScenarioID !== undefined) this.launchScenario(this.lastScenarioID);
		else console.warn('Can\'t restart scenario. Last scenarioID is undefined.');
	}

	public clearEntities(): void
	{
		for (let i = 0; i < this.characters.length; i++) {
			this.remove(this.characters[i]);
			i--;
		}

		for (let i = 0; i < this.vehicles.length; i++) {
			this.remove(this.vehicles[i]);
			i--;
		}
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
		}
	}

	public updateControls(controls: any): void
	{
		let html = '';
		html += '<h2>Controls:</h2>';

		controls.forEach((row) =>
		{
			html += '<div class="ctrl-row">';
			row.keys.forEach((key) => {
				if (key === '+' || key === 'and' || key === 'or' || key === '&') html += '&nbsp;' + key + '&nbsp;';
				else html += '<span class="ctrl-key">' + key + '</span>';
			});

			html += '<span class="ctrl-desc">' + row.desc + '</span></div>';
		});

		document.getElementById('controls').innerHTML = html;
	}

	private getGUI(scope: World): GUI
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
				scope.cameraOperator.setSensitivity(value, value * 0.8);
			});

		// Graphics
		let graphicsFolder = gui.addFolder('Rendering');
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
		graphicsFolder.add(this.params, 'Draw_Physics')
			.onChange((enabled) =>
			{
				if (enabled)
				{
					this.cannonDebugRenderer = new CannonDebugRenderer( this.graphicsWorld, this.physicsWorld );
				}
				else
				{
					this.cannonDebugRenderer.clearMeshes();
					this.cannonDebugRenderer = undefined;
				}

				scope.characters.forEach((char) =>
				{
					char.raycastBox.visible = enabled;
				});
			});
			
		// Sky
		let worldFolder = gui.addFolder('World');
		worldFolder.add(this.params, 'Time_Scale', 0, 1).listen()
		.onChange((value) =>
		{
			scope.timeScaleTarget = value;
		});
		worldFolder.add(this.params, 'Sun_Phi', 0, 180).listen()
			.onChange((value) =>
			{
				scope.sky.phi = value;
			});
		worldFolder.add(this.params, 'Sun_Theta', 0, 360).listen()
			.onChange((value) =>
			{
				scope.sky.theta = value;
			});

		this.scenarioGUIFolder = gui.addFolder('Scenarios');
		this.scenarioGUIFolder.open();

		return gui;
	}
}