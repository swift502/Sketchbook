import * as THREE from 'three';
import * as CANNON from 'cannon';
import * as _ from 'lodash';

import * as Utils from '../core/Utilities';

import { InputController } from '../core/InputController';
import { SBObject } from '../objects/SBObject';
import { VectorSpringSimulator } from '../simulation/VectorSpringSimulator';
import { RelativeSpringSimulator } from '../simulation/RelativeSpringSimulator';
import { CharacterControls } from '../game_modes/CharacterControls';
import { Idle } from './character_states/Idle';
import { CapsulePhysics } from '../objects/object_physics/CapsulePhysics';
import { ICharacterState } from '../interfaces/ICharacterState';
import { ICharacterAI } from '../interfaces/ICharacterAI';
import { World } from '../core/World';

export class Character extends THREE.Object3D
{
    public isCharacter: boolean = true;
    public height: number = 1;
    public modelOffset: THREE.Vector3;
    public visuals: THREE.Group;
    public modelContainer: THREE.Group;
    public characterModel: THREE.Mesh;
    public mixer: any;
    public animations: any[];

    // Movement
    public acceleration: THREE.Vector3 = new THREE.Vector3();
    public velocity: THREE.Vector3 = new THREE.Vector3();
    public arcadeVelocityInfluence: THREE.Vector3 = new THREE.Vector3();
    public velocityTarget: THREE.Vector3 = new THREE.Vector3();
    public arcadeVelocityIsAdditive: boolean = false;

    public defaultVelocitySimulatorDamping: number = 0.8;
    public defaultVelocitySimulatorMass: number = 50;
    public velocitySimulator: VectorSpringSimulator;
    public moveSpeed: number = 4;
    public angularVelocity: number = 0;
    public orientation: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
    public orientationTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
    public defaultRotationSimulatorDamping: number = 0.5;
    public defaultRotationSimulatorMass: number = 10;
    public rotationSimulator: RelativeSpringSimulator;
    public viewVector: THREE.Vector3;
    public actions: any;
    public characterCapsule: SBObject;

    // Ray casting
    public rayResult: CANNON.RaycastResult = new CANNON.RaycastResult();
    public rayHasHit: boolean = false;
    public rayCastLength: number = 0.60;
    public raySafeOffset: number = 0.03;
    public wantsToJump: boolean = false;
    public initJumpSpeed: number = -1;
    public groundImpactData: Utils.GroundImpactData = new Utils.GroundImpactData();

    public raycastBox: THREE.Mesh;
    public charState: any;
    public behaviour: any;
    public world: any;
    public character: any;
    
    constructor(options: {})
    {
        super();

        let defaults = {
            position: new THREE.Vector3(),
            height: 1
        };
        options = Utils.setDefaults(options, defaults);

        // Geometry
        this.height = options['height'];
        this.modelOffset = new THREE.Vector3();

        // The visuals group is centered for easy character tilting
        this.visuals = new THREE.Group();
        this.add(this.visuals);

        // Model container is used to reliably ground the character, as animation can alter the position of the model itself
        this.modelContainer = new THREE.Group();
        this.modelContainer.position.y = -this.height / 2;
        this.visuals.add(this.modelContainer);

        // Default model
        let capsuleGeometry = Utils.createCapsuleGeometry(this.height / 4, this.height / 2, 8);

        let capsule = new THREE.Mesh(
            capsuleGeometry,
            new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        capsule.position.set(0, this.height / 2, 0);
        capsule.castShadow = true;

        // Assign model to character
        this.characterModel = capsule;
        // Attach model to model container
        this.modelContainer.add(capsule);

        this.velocitySimulator = new VectorSpringSimulator(60, this.defaultVelocitySimulatorMass, this.defaultVelocitySimulatorDamping);
        this.rotationSimulator = new RelativeSpringSimulator(60, this.defaultRotationSimulatorMass, this.defaultRotationSimulatorDamping);

        // States
        this.setState(Idle);
        this.viewVector = new THREE.Vector3();

        // Controls
        this.actions = {
            up: new InputController(),
            down: new InputController(),
            left: new InputController(),
            right: new InputController(),
            run: new InputController(),
            jump: new InputController(),
            use: new InputController(),
            primary: new InputController(),
            secondary: new InputController(),
            tertiary: new InputController(),
            lastControl: new InputController()
        };

        // Physics
        // Player Capsule
        let capsulePhysics = new CapsulePhysics({
            mass: 1,
            position: new CANNON.Vec3().copy(options['position']),
            height: 0.5,
            radius: 0.25,
            segments: 8,
            friction: 0
        });
        this.characterCapsule = new SBObject();
        this.characterCapsule.setPhysics(capsulePhysics);

        // Pass reference to character for callbacks
        this.characterCapsule.physics.physical.character = this;

        // Move character to different collision group for raycasting
        this.characterCapsule.physics.physical.collisionFilterGroup = 2;

        // Disable character rotation
        this.characterCapsule.physics.physical.fixedRotation = true;
        this.characterCapsule.physics.physical.updateMassProperties();

        // Ray cast debug
        const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const boxMat = new THREE.MeshLambertMaterial({
            color: 0xff0000
        });
        this.raycastBox = new THREE.Mesh(boxGeo, boxMat);
        this.raycastBox.visible = false;

        // Physics pre/post step callback bindings
        this.characterCapsule.physics.physical.preStep = this.physicsPreStep;
        this.characterCapsule.physics.physical.postStep = this.physicsPostStep;
    }

    public setAnimations(animations: []): void
    {
        this.animations = animations;
    }

    public setModel(model: THREE.Mesh): void
    {
        this.modelContainer.remove(this.characterModel);
        this.characterModel = model;
        this.modelContainer.add(this.characterModel);

        this.mixer = new THREE.AnimationMixer(this.characterModel);
        this.setState(Idle);
        this.charState.onInputChange();
    }

    public setArcadeVelocityInfluence(x: number, y: number = x, z: number = x): void
    {
        this.arcadeVelocityInfluence.set(x, y, z);
    }

    public setModelOffset(offset: THREE.Vector3): void
    {
        this.modelOffset.copy(offset);
    }

    public setViewVector(vector: THREE.Vector3): void
    {
        this.viewVector.copy(vector).normalize();
    }

    /**
     * Set state to the player. Pass state class (function) name.
     * @param {function} State 
     */
    public setState(State: any): void
    {
        this.charState = new State(this);
    }

    public setPosition(x: number, y: number, z: number): void
    {
        this.characterCapsule.physics.physical.position = new CANNON.Vec3(x, y, z);
    }

    public setArcadeVelocity(velZ: number, velX: number = 0, velY: number = 0): void
    {
        this.velocity.z = velZ;
        this.velocity.x = velX;
        this.velocity.y = velY;
    }

    public setArcadeVelocityTarget(velZ: number, velX: number = 0, velY: number = 0): void
    {
        this.velocityTarget.z = velZ;
        this.velocityTarget.x = velX;
        this.velocityTarget.y = velY;
    }

    public setOrientationTarget(vector: THREE.Vector3): void
    {
        this.orientationTarget.copy(vector).setY(0).normalize();
    }

    public setBehaviour(behaviour: ICharacterAI): void
    {
        behaviour.character = this;
        this.behaviour = behaviour;
    }

    public triggerCharacterAction(actionName: string, value: boolean): void
    {
        // Get action and set it's parameters
        let action = this.actions[actionName];

        if (action.value !== value)
        {
            // Set value
            action.value = value;

            // Set the 'just' attributes
            if (value) action.justPressed = true;
            else action.justReleased = true;

            // Tag control as last activated
            this.actions.lastControl = action;

            // Tell player to handle states according to new input
            this.charState.onInputChange();

            // Reset the 'just' attributes
            action.justPressed = false;
            action.justReleased = false;
        }
    }

    public takeControl(): void
    {
        if (this.world !== undefined)
        {
            this.world.setGameMode(new CharacterControls(this));
        }
        else
        {
            console.warn('Attempting to take control of a character that doesn\'t belong to a world.');
        }
    }

    public resetControls(): void
    {
        this.triggerCharacterAction('up', false);
        this.triggerCharacterAction('down', false);
        this.triggerCharacterAction('left', false);
        this.triggerCharacterAction('right', false);
        this.triggerCharacterAction('run', false);
        this.triggerCharacterAction('jump', false);
        this.triggerCharacterAction('use', false);
        this.triggerCharacterAction('primary', false);
        this.triggerCharacterAction('secondary', false);
        this.triggerCharacterAction('tertiary', false);
    }

    public update(timeStep: number, options: {} = {}): void
    {
        let defaults = {
            rotateModel: true,
            rotationMultiplier: 1,
            springRotation: true,
            springVelocity: true,
            updateAnimation: true
        };
        options = Utils.setDefaults(options, defaults);

        if (this.behaviour !== undefined) {
            this.behaviour.update(timeStep);
        }

        if (this.charState !== undefined) {
            this.charState.update(timeStep);
        }
        
        this.visuals.position.copy(this.modelOffset);
        if (options['springVelocity']) this.springMovement(timeStep);
        if (options['springRotation']) this.springRotation(timeStep, options['rotationMultiplier']);
        if (options['rotateModel']) this.rotateModel();
        if (options['updateAnimation'] && this.mixer !== undefined) this.mixer.update(timeStep);

        this.position.set(
            this.characterCapsule.physics.physical.interpolatedPosition.x,
            this.characterCapsule.physics.physical.interpolatedPosition.y - this.height / 2,
            this.characterCapsule.physics.physical.interpolatedPosition.z
        );
    }

    public setAnimation(clipName: string, fadeIn: number): void
    {
        if (this.mixer !== undefined)
        {
            // gltf
            // let clip = THREE.AnimationClip.findByName( this.animations, clipName );

            let clips = this.characterModel['animations'];
            let clip = THREE.AnimationClip.findByName(clips, clipName);

            let action = this.mixer.clipAction(clip);
            this.mixer.stopAllAction();
            action.fadeIn(fadeIn);
            action.play();

            return action._clip.duration;
            // return 0;
        }
    }

    public springMovement(timeStep: number): void
    {
        // Simulator
        this.velocitySimulator.target.copy(this.velocityTarget);
        this.velocitySimulator.simulate(timeStep);

        // Update values
        this.velocity.copy(this.velocitySimulator.position);
        this.acceleration.copy(this.velocitySimulator.velocity);
    }

    public springRotation(timeStep: number, RotationMultiplier: number): void
    {
        // Spring rotation
        // Figure out angle between current and target orientation
        let angle = Utils.getSignedAngleBetweenVectors(this.orientation, this.orientationTarget);

        // Simulator
        this.rotationSimulator.target = angle * RotationMultiplier;
        this.rotationSimulator.simulate(timeStep);
        let rot = this.rotationSimulator.position;

        // Updating values
        this.orientation.applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
        this.angularVelocity = this.rotationSimulator.velocity;
    }

    public getLocalMovementDirection(): THREE.Vector3
    {
        const positiveX = this.actions.right.value ? -1 : 0;
        const negativeX = this.actions.left.value ? 1 : 0;
        const positiveZ = this.actions.up.value ? 1 : 0;
        const negativeZ = this.actions.down.value ? -1 : 0;

        return new THREE.Vector3(positiveX + negativeX, 0, positiveZ + negativeZ).normalize();
    }

    public getCameraRelativeMovementVector(): THREE.Vector3
    {
        const localDirection = this.getLocalMovementDirection();
        const flatViewVector = new THREE.Vector3(this.viewVector.x, 0, this.viewVector.z).normalize();

        return Utils.appplyVectorMatrixXZ(flatViewVector, localDirection);
    }

    public setCameraRelativeOrientationTarget(): void
    {
        let moveVector = this.getCameraRelativeMovementVector();

        if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0)
        {
            this.setOrientationTarget(this.orientation);
        }
        else
        {
            this.setOrientationTarget(moveVector);
        }
    }

    public rotateModel(): void
    {
        this.visuals.lookAt(this.position.x + this.orientation.x, this.position.y + this.visuals.position.y, this.position.z + this.orientation.z);
        this.visuals.rotateZ(-this.angularVelocity * 2.3 * this.velocity.length());
        this.visuals.position.setY(this.visuals.position.y + (Math.cos(Math.abs(this.angularVelocity * 2.3 * this.velocity.length())) / 2));
    }

    public jump(initJumpSpeed: number = -1): void
    {
        this.wantsToJump = true;
        this.initJumpSpeed = initJumpSpeed;
    }

    /**
     * Gets called with the call() function by the CANNON.Body caller
     * "this" in this functions actually refers to CANNON.Body
     */
    public physicsPreStep(): void
    {
        // Player ray casting
        // Create ray
        const start = new CANNON.Vec3(this.position.x, this.position.y, this.position.z);
        const end = new CANNON.Vec3(this.position.x, this.position.y - this.character.rayCastLength - this.character.raySafeOffset, this.position.z);
        // Raycast options
        const rayCastOptions = {
            collisionFilterMask: ~2, /* cast against everything except second collision group (player) */
            skipBackfaces: true      /* ignore back faces */
        };
        // Cast the ray
        this.character.rayHasHit = this.character.world.physicsWorld.raycastClosest(start, end, rayCastOptions, this.character.rayResult);

        // Raycast debug
        if (this.character.rayHasHit)
        {
            if (this.character.raycastBox.visible) {
                this.character.raycastBox.position.copy(this.character.rayResult.hitPointWorld);
            }
        }
        else
        {
            if (this.character.raycastBox.visible) {
                this.character.raycastBox.position.set(this.position.x, this.position.y - this.character.rayCastLength - this.character.raySafeOffset, this.position.z);
            }
        }
    }

    /**
     * Gets called with the call() function by the CANNON.Body caller
     * "this" in this functions actually refers to CANNON.Body
     */
    public physicsPostStep(): void
    {
        // Get velocities
        let simulatedVelocity = new THREE.Vector3().copy(this.velocity);

        // Take local velocity
        let arcadeVelocity = new THREE.Vector3().copy(this.character.velocity).multiplyScalar(this.character.moveSpeed);
        // Turn local into global
        arcadeVelocity = Utils.appplyVectorMatrixXZ(this.character.orientation, arcadeVelocity);

        let newVelocity = new THREE.Vector3();

        // Additive velocity mode
        if (this.character.arcadeVelocityIsAdditive)
        {
            newVelocity.copy(simulatedVelocity);

            let globalVelocityTarget = Utils.appplyVectorMatrixXZ(this.character.orientation, this.character.velocityTarget);
            let add = new THREE.Vector3().copy(arcadeVelocity).multiply(this.character.arcadeVelocityInfluence);

            if (Math.abs(simulatedVelocity.x) < Math.abs(globalVelocityTarget.x * this.character.moveSpeed) || Utils.haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)) { newVelocity.x += add.x; }
            if (Math.abs(simulatedVelocity.y) < Math.abs(globalVelocityTarget.y * this.character.moveSpeed) || Utils.haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)) { newVelocity.y += add.y; }
            if (Math.abs(simulatedVelocity.z) < Math.abs(globalVelocityTarget.z * this.character.moveSpeed) || Utils.haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)) { newVelocity.z += add.z; }
        }
        else
        {
            newVelocity = new THREE.Vector3(
                THREE.Math.lerp(simulatedVelocity.x, arcadeVelocity.x, this.character.arcadeVelocityInfluence.x),
                THREE.Math.lerp(simulatedVelocity.y, arcadeVelocity.y, this.character.arcadeVelocityInfluence.y),
                THREE.Math.lerp(simulatedVelocity.z, arcadeVelocity.z, this.character.arcadeVelocityInfluence.z),
            );
        }

        // If we're hitting the ground, stick to ground
        if (this.character.rayHasHit)
        {
            // Flatten velocity
            newVelocity.y = 0;

            // Measure the normal vector offset from direct "up" vector
            // and transform it into a matrix
            let up = new THREE.Vector3(0, 1, 0);
            let normal = new THREE.Vector3().copy(this.character.rayResult.hitNormalWorld);
            let q = new THREE.Quaternion().setFromUnitVectors(up, normal);
            let m = new THREE.Matrix4().makeRotationFromQuaternion(q);

            // Rotate the velocity vector
            newVelocity.applyMatrix4(m);

            // Compensate for gravity
            newVelocity.y -= this.world.gravity.y / this.character.world.physicsFrameRate;

            // Apply velocity
            this.velocity.copy(newVelocity);
            // Ground character
            this.position.y = this.character.rayResult.hitPointWorld.y + this.character.rayCastLength + (newVelocity.y / this.character.world.physicsFrameRate);
        }
        else
        {
            // If we're in air
            this.velocity.copy(newVelocity);
            // Save last in-air information
            this.character.groundImpactData.velocity.copy(this.velocity);
        }

        // Jumping
        if (this.character.wantsToJump)
        {
            // If initJumpSpeed is set
            if (this.character.initJumpSpeed > -1)
            {
                // Flatten velocity
                this.velocity.y = 0;

                // Velocity needs to be at least as much as initJumpSpeed
                if (this.velocity['lengthSquared']() < this.character.initJumpSpeed ** 2)
                {
                    this.velocity.normalize();
                    this.velocity['mult'](this.character.initJumpSpeed, this.velocity);
                }
            }

            // Add positive vertical velocity 
            this.velocity.y += 4;
            // Move above ground by 2x safe offset value
            this.position.y += this.character.raySafeOffset * 2;
            // Reset flag
            this.character.wantsToJump = false;
        }
    }

    public addToWorld(world: World): void
    {
        if (_.includes(world.characters, this))
        {
            console.warn('Adding character to a world in which it already exists.');
        }
        else
        {
            // Set world
            this.world = world;

            // Register character
            world.characters.push(this);

            // Register physics
            world.physicsWorld.addBody(this.characterCapsule.physics.physical);

            // Add to graphicsWorld
            world.graphicsWorld.add(this);
            world.graphicsWorld.add(this.characterCapsule.physics.visual);
            world.graphicsWorld.add(this.raycastBox);

            // Register characters physical capsule object
            world.objects.push(this.characterCapsule);
        }
    }

    public removeFromWorld(world: World): void
    {
        if (!_.includes(world.characters, this))
        {
            console.warn('Removing character from a world in which it isn\'t present.');
        }
        else
        {
            this.world = undefined;

            // Remove from characters
            _.pull(world.characters, this);

            // Remove physics
            world.physicsWorld.remove(this.characterCapsule.physics.physical);

            // Remove visuals
            world.graphicsWorld.remove(this);
            world.graphicsWorld.remove(this.characterCapsule.physics.visual);
            world.graphicsWorld.remove(this.raycastBox);

            // Remove capsule object
            _.pull(world.objects, this.characterCapsule);
        }
    }
}