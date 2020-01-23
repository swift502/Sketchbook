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
    }

    private _phi: number = 60;
    private _theta: number = 225;

    private sunTarget: THREE.Object3D;
    private ambientLight: THREE.AmbientLight;
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
            side: THREE.BackSide,
        });

        this.skyMesh = new THREE.Mesh(
            new THREE.SphereBufferGeometry(600, 32, 15),
            this.skyMaterial
        );
        this.attach(this.skyMesh);

        // Lighting
        this.ambientLight = new THREE.AmbientLight(0xaaaaaa); // soft white light
        this.attach(this.ambientLight);

        // Sun light with shadowmap
        this.sun = new THREE.DirectionalLight(0xffffff, 0.6);
        this.sun.castShadow = true;

        this.sun.shadow.mapSize.width = 2048;
        this.sun.shadow.mapSize.height = 2048;
        this.sun.shadow.camera.near = 1;
        this.sun.shadow.camera.far = 50;

        this.sun.shadow.camera.top = 15;
        this.sun.shadow.camera.right = 15;
        this.sun.shadow.camera.bottom = -15;
        this.sun.shadow.camera.left = -15;

        this.attach(this.sun);

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
}