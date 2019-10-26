import * as THREE from 'three';
import * as CANNON from'cannon';
import { GameModes } from './_export';
import { GameModesBase } from './GameModesBase';
import * as _ from 'lodash';
import { SBObject } from '../objects/Object';
import { ObjectPhysics } from '../objects/object_physics/_export';

/**
 * Character controls game mode. Allows player to control a character.
 * @param {Character} character Character to control 
 */
export class CharacterControls extends GameModesBase
{
    character: any;
    keymap: any;
    world: any;

    constructor(character)
    {
        super();

        this.character = character;

        // Keymap
        this.keymap = {
            '87': { action: 'up' },
            '83': { action: 'down' },
            '65': { action: 'left' },
            '68': { action: 'right' },
            '16': { action: 'run' },
            '32': { action: 'jump' },
            '69': { action: 'use' },
            // Mouse events are generated in the input manager
            // 'mouse' + event.button
            'mouse0': { action: 'primary' },
            'mouse1': { action: 'secondary' },
            'mouse2': { action: 'tertiary' }
        };
    }

    init()
    {
        this.checkIfWorldIsSet();

        this.world.cameraController.setRadius(1.8);
        this.world.cameraDistanceTarget = 1.8;
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

        super.handleAction(event, key, value);

        if(key == '86' && value == true)
        {
            if(this.world.cameraDistanceTarget > 1.8)
            {
                this.world.cameraDistanceTarget = 1.1;
            }
            else if(this.world.cameraDistanceTarget > 1.3)
            {
                this.world.cameraDistanceTarget = 2.1;
            }
            else if(this.world.cameraDistanceTarget > 0)
            {
                this.world.cameraDistanceTarget = 1.6;
            }
        }
        else if(key == '70' && value == true) 
        {
            let forward_three = new THREE.Vector3().copy(this.character.orientation);
            let forward = new CANNON.Vec3(forward_three.x, forward_three.y, forward_three.z);
            let ball = new SBObject();
            ball.setPhysics(new ObjectPhysics.Sphere({
                mass: 1,
                radius: 0.3,
                position: new CANNON.Vec3().copy(this.character.position).vadd(forward),
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

        //Free cam
        if (key == '67' && value == true && event.shiftKey == true)
        {
            this.character.resetControls();
            this.world.setGameMode(new GameModes.FreeCameraControls(this));
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
            this.world.setGameMode(new GameModes.FreeCameraControls());
        }
        else
        {
            // Look in camera's direction
            this.character.viewVector = new THREE.Vector3().subVectors(this.character.position, this.world.camera.position);

            // Make light follow player (for shadows)
            this.world.dirLight.position.set(
                this.character.position.x + this.world.sun.x * 15,
                this.character.position.y + this.world.sun.y * 15,
                this.character.position.z + this.world.sun.z * 15);

            // Position camera
            this.world.cameraController.target.set(
                this.character.position.x,
                this.character.position.y + this.character.height / 1.7,
                this.character.position.z
            );
        }
    }
}