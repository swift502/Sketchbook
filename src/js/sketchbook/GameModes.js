import * as THREE from 'three';
import { Controls } from './Controls';
import _ from 'lodash';

class GameModeBase
{
    init() { }
    update() { }

    handleAction(event, action, value) { }
    handleScroll(event, value) { }
    handleMouseMove(event, deltaX, deltaY) { }

    checkIfWorldIsSet()
    {
        if(this.world === undefined)
        {
            console.error('Calling gameMode init() without having specified gameMode\'s world first: ' + this);
        }
    }

    scrollTheTimeScale(scrollAmount) {

        // Changing time scale with scroll wheel
        const timeScaleBottomLimit = 0.003;
        const timeScaleChangeSpeed = 1.3;
    
        if (scrollAmount > 0)
        {
            this.world.timeScaleTarget /= timeScaleChangeSpeed;
            if (this.world.timeScaleTarget < timeScaleBottomLimit) this.world.timeScaleTarget = 0;
        }
        else
        {
            this.world.timeScaleTarget *= timeScaleChangeSpeed;
            if (this.world.timeScaleTarget < timeScaleBottomLimit) this.world.timeScaleTarget = timeScaleBottomLimit;
            this.world.timeScaleTarget = Math.min(this.world.timeScaleTarget, 1);
            if (this.world.params.Time_Scale > 0.9) this.world.params.Time_Scale *= timeScaleChangeSpeed;
        }
    }
}

/**
 * Free camera game mode.
 * @param {Character} character Character to control 
 */

class FreeCameraControls extends GameModeBase
{
    constructor(previousGameMode = undefined)
    {
        super();

        // Remember previous game mode to return to when pressing shift + C
        this.previousGameMode = previousGameMode;
        
        this.movementSpeed = 0.06;

        // Keymap
        this.keymap = {
            'w': { action: 'forward' },
            's': { action: 'back' },
            'a': { action: 'left' },
            'd': { action: 'right' },
            'e': { action: 'up' },
            'q': { action: 'down' },
            'shift': { action: 'fast' }
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
        // Shift modifier fix
        key = key.toLowerCase();

        // Turn off free cam
        if (this.previousGameMode !== undefined && key == 'c' && value == true && event.shiftKey == true)
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
            this.world.camera.position.x + this.world.sun.x * 5,
            this.world.camera.position.y + this.world.sun.y * 5,
            this.world.camera.position.z + this.world.sun.z * 5
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

/**
 * Character controls game mode. Allows player to control a character.
 * @param {Character} character Character to control 
 */
class CharacterControls extends GameModeBase
{
    constructor(character)
    {
        super();

        this.character = character;

        // Keymap
        this.keymap = {
            'w': { action: 'up' },
            's': { action: 'down' },
            'a': { action: 'left' },
            'd': { action: 'right' },
            'shift': { action: 'run' },
            ' ': { action: 'jump' },
            'e': { action: 'use' },
            'mouse0': { action: 'primary' },
            'mouse2': { action: 'secondary' },
            'mouse1': { action: 'tertiary' }
        };
    }

    init()
    {
        this.checkIfWorldIsSet();

        this.world.cameraController.setRadius(1.8);
        this.world.dirLight.target = this.character;
    }

    /**
     * Handles game keys based on supplied inputs.
     * @param {*} event Keyboard or mouse event
     * @param {char} key Key or button pressed
     * @param {boolean} value Value to be assigned to action
     */
    handleAction(event, key, value)
    {
        // Shift modifier fix
        key = key.toLowerCase();

        //Free cam
        if (key == 'c' && value == true && event.shiftKey == true)
        {
            this.character.resetControls();
            this.world.setGameMode(new FreeCameraControls(this));
        }
        // Is key bound to action
        if (key in this.keymap)
        {
            this.character.setControl(this.keymap[key].action, value);
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
        if(!_.includes(this.world.characters, this.character))
        {
            this.world.setGameMode(new FreeCameraControls());
        }
        else
        {
            // Look in camera's direction
            this.character.viewVector = new THREE.Vector3().subVectors(this.character.position, this.world.camera.position);

            // Make light follow player (for shadows)
            this.world.dirLight.position.set(
                this.character.position.x + this.world.sun.x * 5,
                this.character.position.y + this.world.sun.y * 5,
                this.character.position.z + this.world.sun.z * 5);

            // Position camera
            this.world.cameraController.target.set(
                this.character.position.x,
                this.character.position.y + this.character.height / 1.7,
                this.character.position.z
            );
        }
    }
}

export let GameModes = {
    FreeCameraControls: FreeCameraControls,
    CharacterControls: CharacterControls
};