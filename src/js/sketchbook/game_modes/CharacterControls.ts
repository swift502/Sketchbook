// import * as THREE from 'three';
// import * as CANNON from 'cannon';
// import { GameModesBase } from './GameModesBase';
// import * as _ from 'lodash';
// import { SBObject } from '../objects/SBObject';
// import { FreeCameraControls } from './FreeCameraControls';
// import { SpherePhysics } from '../objects/object_physics/SpherePhysics';
// import { IGameMode } from '../interfaces/IGameMode';
// import { Character } from '../characters/Character';

// /**
//  * Character controls game mode. Allows player to control a character.
//  * @param {Character} character Character to control 
//  */
// export class CharacterControls extends GameModesBase implements IGameMode
// {
//     public character: Character;
//     public keymap: any;

//     constructor(character: Character)
//     {
//         super();

//         this.character = character;

//         // Keymap
//         this.keymap = {
//             'KeyW': { action: 'up' },
//             'KeyS': { action: 'down' },
//             'KeyA': { action: 'left' },
//             'KeyD': { action: 'right' },
//             'ShiftLeft': { action: 'run' },
//             'Space': { action: 'jump' },
//             'KeyE': { action: 'use' },
//             'Mouse0': { action: 'primary' },
//             'Mouse1': { action: 'secondary' },
//             'Mouse2': { action: 'tertiary' }
//         };
//     }

//     public init(): void
//     {
//         this.checkIfWorldIsSet();

//         this.world.cameraController.setRadius(1.8);
//         this.world.dirLight.target = this.character;
//     }

//     /**
//      * Handles game keys based on supplied inputs.
//      * @param {*} event Keyboard or mouse event
//      * @param {char} code Key or button pressed
//      * @param {boolean} pressed Value to be assigned to action
//      */
//     public handleKey(event: KeyboardEvent, code: string, pressed: boolean): void
//     {
//         this.timescaleSwitch(code, pressed);

//         if (code === 'KeyC' && pressed === true)
//         {
//             if (this.world.cameraController.targetRadius > 1.8)
//             {
//                 this.world.cameraController.setRadius(1.3);
//             }
//             else if (this.world.cameraController.targetRadius > 1.3)
//             {
//                 this.world.cameraController.setRadius(2.3);
//             }
//             else if (this.world.cameraController.targetRadius > 0)
//             {
//                 this.world.cameraController.setRadius(1.8);
//             }
//         }
//         else if (code === 'KeyF' && pressed === true) 
//         {
//             let forward = new CANNON.Vec3(this.character.orientation.x, this.character.orientation.y, this.character.orientation.z);
//             let ball = new SBObject();
//             ball.setPhysics(new SpherePhysics({
//                 mass: 1,
//                 radius: 0.3,
//                 position: new CANNON.Vec3(this.character.position.x, this.character.position.y, this.character.position.z).vadd(forward),
//             }));
//             ball.setModelFromPhysicsShape();
//             this.world.add(ball);

//             this.world.balls.push(ball);

//             if (this.world.balls.length > 10)
//             {
//                 this.world.remove(this.world.balls[0]);
//                 _.pull(this.world.balls, this.world.balls[0]);
//             }
//         }

//         // Free cam
//         if (code === 'KeyC' && pressed === true && event.shiftKey === true)
//         {
//             this.character.resetControls();
//             this.world.setGameMode(new FreeCameraControls(this));
//         }
//         // Is key bound to action
//         if (code in this.keymap)
//         {
//             this.character.triggerAction(this.keymap[code].action, pressed);
//         }
//     }

//     public handleScroll(event: WheelEvent, value: number): void
//     {
//         this.scrollTheTimeScale(value);
//     }

//     public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void
//     {
//         this.world.cameraController.move(deltaX, deltaY);
//     }

//     public update(timeStep: number): void
//     {
//         if (!_.includes(this.world.characters, this.character))
//         {
//             this.world.setGameMode(new FreeCameraControls());
//         }
//         else
//         {
//             // Look in camera's direction
//             this.character.viewVector = new THREE.Vector3().subVectors(this.character.position, this.world.camera.position);

//             // Make light follow player (for shadows)
//             this.world.dirLight.position.set(
//                 this.character.position.x + this.world.sun.x * 15,
//                 this.character.position.y + this.world.sun.y * 15,
//                 this.character.position.z + this.world.sun.z * 15);

//             // Position camera
//             this.world.cameraController.target.set(
//                 this.character.position.x,
//                 this.character.position.y + this.character.height / 1.7,
//                 this.character.position.z
//             );
//         }
//     }
// }