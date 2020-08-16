import { SkyShader } from '../../lib/shaders/SkyShader';
import * as THREE from 'three';
import { World } from './World';

export class Sky extends THREE.Object3D
{
	public sun: THREE.DirectionalLight;

	set theta(value: number) {
		this._theta = value;
		this.refreshSunPosition();
	}

	set phi(value: number) {
		this._phi = value;
		this.refreshSunPosition();
		this.refreshHemiIntensity();
	}

	private _phi: number = 50;
	private _theta: number = 215;

	private hemiLight: THREE.HemisphereLight;
	private maxHemiIntensity: number = 0.9;
	private minHemiIntensity: number = 0.3;

	private sunTarget: THREE.Object3D;
	private skyMesh: THREE.Mesh;
	private skyMaterial: THREE.ShaderMaterial;

	private world: World;

	constructor(world: World)
	{
		super();

		this.world = world;

		this.skyMaterial = new THREE.ShaderMaterial({
			uniforms: THREE.UniformsUtils.clone(SkyShader.uniforms),
			fragmentShader: SkyShader.fragmentShader,
			vertexShader: SkyShader.vertexShader,
			side: THREE.BackSide
		});

		this.skyMesh = new THREE.Mesh(
			new THREE.SphereBufferGeometry(1000, 24, 12),
			this.skyMaterial
		);
		this.attach(this.skyMesh);

		this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.0 );
		this.refreshHemiIntensity();
		this.hemiLight.color.setHSL( 0.59, 0.4, 0.6 );
		this.hemiLight.groundColor.setHSL( 0.095, 0.2, 0.75 );
		this.hemiLight.position.set( 0, 50, 0 );
		this.world.graphicsWorld.add( this.hemiLight );

		// Sun light with shadowmap
		this.sun = new THREE.DirectionalLight(0xffffff);
		this.sun.castShadow = true;

		this.sun.shadow.mapSize.width = 2048;
		this.sun.shadow.mapSize.height = 2048;
		this.sun.shadow.camera.near = 1;
		this.sun.shadow.camera.far = 50;

		this.sun.shadow.camera.top = 15;
		this.sun.shadow.camera.right = 15;
		this.sun.shadow.camera.bottom = -15;
		this.sun.shadow.camera.left = -15;

		this.sunTarget = new THREE.Object3D();
		this.sun.target = this.sunTarget;
		this.attach(this.sunTarget);

		this.refreshSunPosition();
	}

	public update(): void
	{
		this.position.copy(this.world.camera.position);
		this.refreshSunPosition();
	}

	public refreshSunPosition(): void
	{
		const sunDistance = 10;

		this.sun.position.x = sunDistance * Math.sin(this._theta * Math.PI / 180) * Math.cos(this._phi * Math.PI / 180);
		this.sun.position.y = sunDistance * Math.sin(this._phi * Math.PI / 180);
		this.sun.position.z = sunDistance * Math.cos(this._theta * Math.PI / 180) * Math.cos(this._phi * Math.PI / 180);

		this.skyMaterial.uniforms.sunPosition.value.copy(this.sun.position);
		this.skyMaterial.uniforms.cameraPos.value.copy(this.world.camera.position);
	}

	public refreshHemiIntensity(): void
	{
		this.hemiLight.intensity = this.minHemiIntensity + Math.pow(1 - (Math.abs(this._phi - 90) / 90), 0.25) * (this.maxHemiIntensity - this.minHemiIntensity);
	}
}