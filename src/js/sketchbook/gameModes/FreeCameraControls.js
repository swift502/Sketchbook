import * as THREE from 'three';
import * as CANNON from'cannon';
import { GameModesBase } from './GameModesBase';
import { Controls } from '../core/Controls';
import _ from 'lodash';
import { Object } from '../objects/Object';
import { ObjectPhysics } from '../objects/ObjectPhysics';

/**
 * Free camera game mode.
 * @param {Character} character Character to control 
 */

export class FreeCameraControls extends GameModesBase
{
    constructor(previousGameMode = undefined)
    {
        super();

        // Remember previous game mode to return to when pressing shift + C
        this.previousGameMode = previousGameMode;
        
        this.movementSpeed = 0.06;

        // Keymap
        this.keymap = {
            '87': { action: 'forward' },
            '83': { action: 'back' },
            '65': { action: 'left' },
            '68': { action: 'right' },
            '69': { action: 'up' },
            '81': { action: 'down' },
            '16': { action: 'fast' }
        };

        this.controls = {
            forward: new Controls.LerpControl(),
            left: new Controls.LerpControl(),
            right: new Controls.LerpControl(),
            up: new Controls.LerpControl(),
            back: new Controls.LerpControl(),
            down: new Controls.LerpControl(),
            fast: new Controls.LerpControl()
        };
    }

    init()
    {
        this.checkIfWorldIsSet();

        this.world.cameraController.target.copy(this.world.camera.position);
        this.world.cameraController.setRadius(0);
        this.world.cameraDistanceTarget = 0.001;
        this.world.dirLight.target = this.world.camera;
    }

    /**
     * Handles game keys based on supplied inputs.
     * @param {*} event Keyboard or mouse event
     * @param {char} key Key or button pressed
     * @param {boolean} value Value to be assigned to action
     */
    handleAction(event, key, value)
    {
        super.handleAction(event, key, value);

        // Shift modifier fix
        key = event.keyCode;

        if(key == '70' && value == true) 
        {
            let forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.world.camera.quaternion);
            let ball = new Object();
            ball.setPhysics(new ObjectPhysics.Sphere({
                mass: 1,
                radius: 0.3,
                position: new CANNON.Vec3().copy(this.world.camera.position).vadd(forward)
            }));
            ball.setModelFromPhysicsShape();
            this.world.add(ball);

            this.world.balls.push(ball);

            if(this.world.balls.length > 10)
            {
                this.world.remove(this.world.balls[0]);
                _.pull(this.world.balls, this.world.balls[0]);
            }
        }

        // Turn off free cam
        if (this.previousGameMode !== undefined && key == '67' && value == true && event.shiftKey == true)
        {
            this.world.gameMode = this.previousGameMode;
            this.world.gameMode.init();
        }
        // Is key bound to action
        else if (key in this.keymap)
        {

            // Get control and set it's parameters
            let control = this.controls[this.keymap[key].action];
            control.value = value;
        }
    }

    handleScroll(event, value)
    {
        this.scrollTheTimeScale(value);
    }

    handleMouseMove(event, deltaX, deltaY)
    {
        this.world.cameraController.move(deltaX, deltaY);
    }

    update()
    {
        // Make light follow camera (for shadows)
        this.world.dirLight.position.set(
            this.world.camera.position.x + this.world.sun.x * 15,
            this.world.camera.position.y + this.world.sun.y * 15,
            this.world.camera.position.z + this.world.sun.z * 15
        );

        // Lerp all controls
        for (let key in this.controls)
        {
            let ctrl = this.controls[key];
            ctrl.floatValue = THREE.Math.lerp(ctrl.floatValue, +ctrl.value, 0.3);
        }

        // Set fly speed
        let speed = this.movementSpeed * (this.controls.fast.value ? 5 : 1);

        let up = new THREE.Vector3(0, 1, 0);
        let forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.world.camera.quaternion);
        let right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.world.camera.quaternion);

        this.world.cameraController.target.add(forward.multiplyScalar(speed * (this.controls.forward.floatValue - this.controls.back.floatValue)));
        this.world.cameraController.target.add(right.multiplyScalar(speed * (this.controls.right.floatValue - this.controls.left.floatValue)));
        this.world.cameraController.target.add(up.multiplyScalar(speed * (this.controls.up.floatValue - this.controls.down.floatValue)));
    }
}