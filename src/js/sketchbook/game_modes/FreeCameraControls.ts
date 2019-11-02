// import * as THREE from 'three';
// import * as CANNON from 'cannon';
// import { GameModesBase } from './GameModesBase';
// import { KeyBinding } from '../core/KeyBinding';
// import * as _ from 'lodash';
// import { SBObject } from '../objects/SBObject';
// import { SpherePhysics } from '../objects/object_physics/SpherePhysics';
// import { IGameMode } from '../interfaces/IGameMode';
// import { World } from '../core/World';

// /**
//  * Free camera game mode.
//  * @param {Character} character Character to control 
//  */

// export class FreeCameraControls extends GameModesBase implements IGameMode
// {
//     public previousGameMode: any;
//     public movementSpeed: number;
//     public keymap: any;
//     public controls: any;
//     public world: World;

//     public upVelocity: number = 0;
//     public forwardVelocity: number = 0;
//     public rightVelocity: number = 0;

//     constructor(previousGameMode?: IGameMode)
//     {
//         super();

//         // Remember previous game mode to return to when pressing shift + C
//         this.previousGameMode = previousGameMode;
        
//         this.movementSpeed = 0.06;

//         // Keymap
//         this.keymap = {
//             'KeyW': { action: 'forward' },
//             'KeyS': { action: 'back' },
//             'KeyA': { action: 'left' },
//             'KeyD': { action: 'right' },
//             'KeyE': { action: 'up' },
//             'KeyQ': { action: 'down' },
//             'ShiftLeft': { action: 'fast' }
//         };

//         this.controls = {
//             forward: new KeyBinding(),
//             left: new KeyBinding(),
//             right: new KeyBinding(),
//             up: new KeyBinding(),
//             back: new KeyBinding(),
//             down: new KeyBinding(),
//             fast: new KeyBinding()
//         };
//     }

//     public init(): void
//     {
//         this.checkIfWorldIsSet();

//         this.world.cameraController.target.copy(this.world.camera.position);
//         this.world.cameraController.setRadius(0);
//         this.world.dirLight.target = this.world.camera;
//     }

//     /**
//      * Handles game keys based on supplied inputs.
//      * @param {*} event Keyboard or mouse event
//      * @param {string} code Key or button pressed
//      * @param {boolean} pressed Value to be assigned to action
//      */
//     public handleKey(event: KeyboardEvent, code: string, pressed: boolean): void
//     {
//         this.timescaleSwitch(code, pressed);

//         if (code === 'KeyF' && pressed === true) 
//         {
//             const elements = this.world.cameraController.camera.matrix.elements;
//             let forward = new CANNON.Vec3(-elements[8], -elements[9], -elements[10]);
//             let ball = new SBObject();
//             ball.setPhysics(new SpherePhysics({
//                 mass: 1,
//                 radius: 0.3,
//                 position: new CANNON.Vec3(this.world.camera.position.x, this.world.camera.position.y, this.world.camera.position.z).vadd(forward)
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

//         // Turn off free cam
//         if (this.previousGameMode !== undefined && code === 'KeyC' && pressed === true && event.shiftKey === true)
//         {
//             this.world.gameMode = this.previousGameMode;
//             this.world.gameMode.init();
//         }
//         // Is key bound to action
//         else if (code in this.keymap)
//         {

//             // Get control and set it's parameters
//             let control = this.controls[this.keymap[code].action];
//             control.value = pressed;
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
//         // Make light follow camera (for shadows)
//         this.world.dirLight.position.set(
//             this.world.camera.position.x + this.world.sun.x * 15,
//             this.world.camera.position.y + this.world.sun.y * 15,
//             this.world.camera.position.z + this.world.sun.z * 15
//         );

//         // Set fly speed
//         let speed = this.movementSpeed * (this.controls.fast.value ? 5 : 1);

//         const elements = this.world.cameraController.camera.matrix.elements;
//         let up = new THREE.Vector3(elements[4], elements[5], elements[6]);
//         let forward = new THREE.Vector3(-elements[8], -elements[9], -elements[10]);
//         let right = new THREE.Vector3(elements[0], elements[1], elements[2]);

//         this.upVelocity = THREE.Math.lerp(this.upVelocity, +this.controls.up.value - +this.controls.down.value, 0.3);
//         this.forwardVelocity = THREE.Math.lerp(this.forwardVelocity, +this.controls.forward.value - +this.controls.back.value, 0.3);
//         this.rightVelocity = THREE.Math.lerp(this.rightVelocity, +this.controls.right.value - +this.controls.left.value, 0.3);

//         this.world.cameraController.target.add(up.multiplyScalar(speed * this.upVelocity));
//         this.world.cameraController.target.add(forward.multiplyScalar(speed * this.forwardVelocity));
//         this.world.cameraController.target.add(right.multiplyScalar(speed * this.rightVelocity));
//     }
// }