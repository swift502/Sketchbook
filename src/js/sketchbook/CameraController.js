import * as THREE from 'three';

export class CameraController
{
    constructor(camera, sensitivityX = 1, sensitivityY = sensitivityX)
    {
        this.camera = camera;
        this.target = new THREE.Vector3();
        this.sensitivity = new THREE.Vector2(sensitivityX, sensitivityY);

        this.radius = 3;
        this.theta = 0;
        this.phi = 0;

        this.onMouseDownPosition = new THREE.Vector2();
        this.onMouseDownTheta = this.theta;
        this.onMouseDownPhi = this.phi;
    }

    setSensitivity(sensitivityX, sensitivityY = sensitivityX)
    {
        this.sensitivity = new THREE.Vector2(sensitivityX, sensitivityY);
    }

    setRadius(value)
    {
        this.radius = Math.max(0.001, value);
    }

    move(deltaX, deltaY)
    {
        this.theta -= deltaX * this.sensitivity.x;
        this.theta %= 720;
        this.phi += deltaY * this.sensitivity.y;
        this.phi = Math.min(170, Math.max(-170, this.phi));
    }

    update()
    {
        this.camera.position.x = this.target.x + this.radius * Math.sin(this.theta * Math.PI / 360) * Math.cos(this.phi * Math.PI / 360);
        this.camera.position.y = this.target.y + this.radius * Math.sin(this.phi * Math.PI / 360);
        this.camera.position.z = this.target.z + this.radius * Math.cos(this.theta * Math.PI / 360) * Math.cos(this.phi * Math.PI / 360);
        this.camera.updateMatrix();
        this.camera.lookAt(this.target);
    }
}