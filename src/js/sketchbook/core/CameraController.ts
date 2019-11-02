import * as THREE from 'three';
import { World } from './World';
import { IInputReceiver } from '../interfaces/IInputReceiver';
import { KeyBinding } from './KeyBinding';

export class CameraController implements IInputReceiver
{
    public world: World;
    public camera: THREE.Camera;
    public target: THREE.Vector3;
    public sensitivity: THREE.Vector2;
    public radius: number = 1;
    public theta: number;
    public phi: number;
    public onMouseDownPosition: THREE.Vector2;
    public onMouseDownTheta: any;
    public onMouseDownPhi: any;
    public targetRadius: number = 1;

    public previousGameMode: any;
    public movementSpeed: number;
    public actions: { [action: string]: KeyBinding };

    public upVelocity: number = 0;
    public forwardVelocity: number = 0;
    public rightVelocity: number = 0;

    constructor(world: World, camera: THREE.Camera, sensitivityX: number = 1, sensitivityY: number = sensitivityX)
    {
        this.world = world;
        this.camera = camera;
        this.target = new THREE.Vector3();
        this.sensitivity = new THREE.Vector2(sensitivityX, sensitivityY);

        this.movementSpeed = 0.06;
        this.radius = 3;
        this.theta = 0;
        this.phi = 0;

        this.onMouseDownPosition = new THREE.Vector2();
        this.onMouseDownTheta = this.theta;
        this.onMouseDownPhi = this.phi;

        this.actions = {
            'forward': new KeyBinding('KeyW'),
            'back': new KeyBinding('KeyS'),
            'left': new KeyBinding('KeyA'),
            'right': new KeyBinding('KeyD'),
            'up': new KeyBinding('KeyE'),
            'down': new KeyBinding('KeyQ'),
            'fast': new KeyBinding('ShiftLeft'),
        };
    }

    public setSensitivity(sensitivityX: number, sensitivityY: number = sensitivityX): void
    {
        this.sensitivity = new THREE.Vector2(sensitivityX, sensitivityY);
    }

    public setRadius(value: number): void
    {
        this.targetRadius = Math.max(0.001, value);
    }

    public move(deltaX: number, deltaY: number): void
    {
        this.theta -= deltaX * this.sensitivity.x;
        this.theta %= 720;
        this.phi += deltaY * this.sensitivity.y;
        this.phi = Math.min(170, Math.max(-170, this.phi));
    }

    public update(): void
    {
        this.radius = THREE.Math.lerp(this.radius, this.targetRadius, 0.1);

        this.camera.position.x = this.target.x + this.radius * Math.sin(this.theta * Math.PI / 360) * Math.cos(this.phi * Math.PI / 360);
        this.camera.position.y = this.target.y + this.radius * Math.sin(this.phi * Math.PI / 360);
        this.camera.position.z = this.target.z + this.radius * Math.cos(this.theta * Math.PI / 360) * Math.cos(this.phi * Math.PI / 360);
        this.camera.updateMatrix();
        this.camera.lookAt(this.target);
    }

    public handleKey(code: string, pressed: boolean): void
    {
        for (const action in this.actions) {
            if (this.actions.hasOwnProperty(action)) {
                const binding = this.actions[action];

                if (code === binding.keyCode)
                {
                    binding.value = pressed;
                }
            }
        }
    }

    public handleScroll(value: number): void
    {
        this.world.scrollTheTimeScale(value);
    }

    public handleMouseMove(deltaX: number, deltaY: number): void
    {
        this.move(deltaX, deltaY);
    }

    public inputReceiverInit(): void
    {
        this.target.copy(this.camera.position);
        this.setRadius(0);
        this.world.dirLight.target = this.world.camera;
    }

    public inputReceiverUpdate(): void
    {
        // Make light follow camera (for shadows)
        this.world.dirLight.position.set(
            this.world.camera.position.x + this.world.sun.x * 15,
            this.world.camera.position.y + this.world.sun.y * 15,
            this.world.camera.position.z + this.world.sun.z * 15
        );

        // Set fly speed
        let speed = this.movementSpeed * (this.actions.fast.value ? 5 : 1);

        const elements = this.world.cameraController.camera.matrix.elements;
        let up = new THREE.Vector3(elements[4], elements[5], elements[6]);
        let forward = new THREE.Vector3(-elements[8], -elements[9], -elements[10]);
        let right = new THREE.Vector3(elements[0], elements[1], elements[2]);

        this.upVelocity = THREE.Math.lerp(this.upVelocity, +this.actions.up.value - +this.actions.down.value, 0.3);
        this.forwardVelocity = THREE.Math.lerp(this.forwardVelocity, +this.actions.forward.value - +this.actions.back.value, 0.3);
        this.rightVelocity = THREE.Math.lerp(this.rightVelocity, +this.actions.right.value - +this.actions.left.value, 0.3);

        this.world.cameraController.target.add(up.multiplyScalar(speed * this.upVelocity));
        this.world.cameraController.target.add(forward.multiplyScalar(speed * this.forwardVelocity));
        this.world.cameraController.target.add(right.multiplyScalar(speed * this.rightVelocity));
    }
}