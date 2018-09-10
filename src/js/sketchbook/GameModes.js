import * as THREE from 'three';
import { Controls } from './Controls';

/**
 * Free camera game mode.
 * @param {Character} character Character to control 
 */

class FreeCameraControls {

    constructor(sketchbook) {
        this.sketchbook = sketchbook;
        this.camera = sketchbook.camera;
        this.previousGameMode = sketchbook.gameMode;
        this.movementSpeed = 0.06;
    
        this.init();
        // sketchbook.cameraControls.update();
    
        // Keymap
        this.keymap = {
            'w':      { action: 'forward'  },
            's':      { action: 'back'     },
            'a':      { action: 'left'     },
            'd':      { action: 'right'    },
            'e':      { action: 'up'       },
            'q':      { action: 'down'     },
            'shift':  { action: 'fast'     }
        };
    
        this.controls = {
            forward:   new Controls.LerpControl(),
            left:      new Controls.LerpControl(),
            right:     new Controls.LerpControl(),
            up:        new Controls.LerpControl(),
            back:      new Controls.LerpControl(),
            down:      new Controls.LerpControl(),
            fast:      new Controls.LerpControl()
        };
    }
    
    init() {
        this.sketchbook.cameraControls.target.copy(this.sketchbook.camera.position);
        this.sketchbook.cameraControls.setRadius(0);
        this.sketchbook.dirLight.target = this.camera;
    }
    
    /**
     * Handles game actions based on supplied inputs.
     * @param {*} event Keyboard or mouse event
     * @param {char} key Key or button pressed
     * @param {boolean} value Value to be assigned to action
     */
    handleKey(event, key, value) {
    
        // Shift modifier fix
        key = key.toLowerCase();
    
        // Turn off free cam
        if(this.previousGameMode != undefined && key == 'c' && value == true && event.shiftKey == true) {
            this.sketchbook.gameMode = this.previousGameMode;
            this.sketchbook.gameMode.init();
        }
        // Is key bound to action
        else if (key in this.keymap) {
    
            // Get action and set it's parameters
            let action = this.controls[this.keymap[key].action];
            action.value = value;
        }
    }
    
    update() {
        
        // Make light follow camera (for shadows)
        this.sketchbook.dirLight.position.set(this.camera.position.x + this.sketchbook.sun.x * 5, this.camera.position.y + this.sketchbook.sun.y * 5, this.camera.position.z + this.sketchbook.sun.z * 5);
    
        for(let key in this.controls){
            let ctrl = this.controls[key];
            ctrl.floatValue = Math.lerp(ctrl.floatValue, +ctrl.value , 0.3);
        }
    
        let forward = new THREE.Vector3(  0,  0, -1 ).applyQuaternion(this.camera.quaternion);
        let back    = new THREE.Vector3(  0,  0,  1 ).applyQuaternion(this.camera.quaternion);
        let left    = new THREE.Vector3( -1,  0,  0 ).applyQuaternion(this.camera.quaternion);
        let right   = new THREE.Vector3(  1,  0,  0 ).applyQuaternion(this.camera.quaternion);
        let up      = new THREE.Vector3(  0,  1,  0 ).applyQuaternion(this.camera.quaternion);
        let down    = new THREE.Vector3(  0, -1,  0 ).applyQuaternion(this.camera.quaternion);
        
        let speed = this.movementSpeed * (this.controls.fast.value ? 3 : 1);
    
        this.sketchbook.cameraControls.target.add(forward.multiplyScalar(speed * this.controls.forward.floatValue));
        this.sketchbook.cameraControls.target.add(back.multiplyScalar(speed * this.controls.back.floatValue));
        this.sketchbook.cameraControls.target.add(left.multiplyScalar(speed * this.controls.left.floatValue));
        this.sketchbook.cameraControls.target.add(right.multiplyScalar(speed * this.controls.right.floatValue));
        this.sketchbook.cameraControls.target.add(up.multiplyScalar(speed * this.controls.up.floatValue));
        this.sketchbook.cameraControls.target.add(down.multiplyScalar(speed * this.controls.down.floatValue));
    }
}

/**
 * Character controls game mode. Allows player to control a character.
 * @param {Character} character Character to control 
 */
class CharacterControls {

    constructor(sketchbook, character) {
        this.sketchbook = sketchbook;
        this.character = character;
    
        this.init();
    
        // Keymap
        this.keymap = {
            'w':      { action: 'up'       },
            's':      { action: 'down'     },
            'a':      { action: 'left'     },
            'd':      { action: 'right'    },
            'shift':  { action: 'run'      },
            ' ':      { action: 'jump'     },
            'e':      { action: 'use'      },
            'mouse0': { action: 'primary'  },
            'mouse2': { action: 'secondary'},
            'mouse1': { action: 'tertiary' }
        };
    }
    
    init() {
        this.sketchbook.cameraControls.setRadius(2);
        this.sketchbook.dirLight.target = this.character;
    }
    
    /**
     * Handles game actions based on supplied inputs.
     * @param {*} event Keyboard or mouse event
     * @param {char} key Key or button pressed
     * @param {boolean} value Value to be assigned to action
     */
    handleKey(event, key, value) {
    
        // Shift modifier fix
        key = key.toLowerCase();
    
        //Free cam
        if(key == 'c' && value == true && event.shiftKey == true) {
            this.character.resetControls();
            this.sketchbook.gameMode = new FreeCameraControls(this.sketchbook, this);
        }
        // Is key bound to action
        if (key in this.keymap) {
            this.character.setControl(this.keymap[key].action, value);
        }
    }
    
    update() {
    
        // Look in camera's direction
        this.character.viewVector = new THREE.Vector3().subVectors(this.character.position, this.sketchbook.camera.position);
        
        // Make light follow player (for shadows)
        this.sketchbook.dirLight.position.set(this.character.position.x + this.sketchbook.sun.x * 5, this.character.position.y + this.sketchbook.sun.y * 5, this.character.position.z + this.sketchbook.sun.z * 5);
        
        // Position camera
        this.sketchbook.cameraControls.target.copy(
            new THREE.Vector3(
                this.character.position.x,
                this.character.position.y + this.character.height / 1.7,
                this.character.position.z)
        );
    }
}

export let GameModes = {
    FreeCameraControls: FreeCameraControls,
    CharacterControls: CharacterControls
};