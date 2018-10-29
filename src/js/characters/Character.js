import * as THREE from 'three';
import * as CANNON from 'cannon';

import { Utilities as Utils } from '../sketchbook/Utilities';
import { Springs } from '../simulation/Springs';

import { Controls } from '../sketchbook/Controls';
import { CharacterAI } from './CharacterAI';
import { CharacterStates } from './CharacterStates';
import { GameModes } from '../sketchbook/GameModes';

//Character class
export class Character extends THREE.Object3D {
    
    constructor(world) {

        super();

        this.world = world;

        // Geometry
        this.height = 1;
        this.modelOffset = new THREE.Vector3();

        // The visuals group is centered for easy character tilting
        this.visuals = new THREE.Group();
        this.add(this.visuals);

        // Model container is used to reliably ground the character, as animation can alter the position of the model itself
        this.modelContainer = new THREE.Group();
        this.modelContainer.position.y = -this.height/2;
        this.visuals.add(this.modelContainer);//

        // Default model
        let capsuleGeometry = Utils.createCapsuleGeometry(this.height/4, this.height/2, 8);

        let capsule = new THREE.Mesh(
            capsuleGeometry,
            new THREE.MeshLambertMaterial({ color: 0xffffff })
        );
        capsule.position.set(0, this.height/2, 0);
        capsule.castShadow = true;

        // Assign model to character
        this.characterModel = capsule;
        // Attach model to model container
        this.modelContainer.add(capsule);

        // Animation mixer - gets set when calling setModel()
        this.mixer;
        this.animations = [];

        // Movement
        this.acceleration = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.simulatedVelocityInfluence = new THREE.Vector3();
        this.velocityTarget = new THREE.Vector3();
        // Velocity spring simulator
        this.defaultVelocitySimulatorDamping = 0.8;
        this.defaultVelocitySimulatorMass = 50;
        this.velocitySimulator = new Springs.VectorSpringSimulator(60, this.defaultVelocitySimulatorMass, this.defaultVelocitySimulatorDamping);
        this.moveSpeed = 8;

        // Rotation
        this.angularVelocity = 0;
        this.orientation = new THREE.Vector3(0, 0, 1);
        this.orientationTarget = new THREE.Vector3(0, 0, 1);
        // Rotation spring simulator
        this.defaultRotationSimulatorDamping = 0.5;
        this.defaultRotationSimulatorMass = 10;
        this.rotationSimulator = new Springs.RelativeSpringSimulator(60, this.defaultRotationSimulatorMass, this.defaultRotationSimulatorDamping);

        // States
        this.setState(CharacterStates.Idle);
        this.viewVector = new THREE.Vector3();

        // Controls
        this.setBehaviour(new CharacterAI.Default());
        this.controls = {
            up:          new Controls.EventControl(),
            down:        new Controls.EventControl(),
            left:        new Controls.EventControl(),
            right:       new Controls.EventControl(),
            run:         new Controls.EventControl(),
            jump:        new Controls.EventControl(),
            use:         new Controls.EventControl(),
            primary:     new Controls.EventControl(),
            secondary:   new Controls.EventControl(),
            tertiary:    new Controls.EventControl(),
            lastControl: new Controls.EventControl()
        };

        // Physics
        // Player Capsule
        this.characterCapsule = world.spawnCapsulePrimitive({
            mass: 1,
            position: new CANNON.Vec3(0, 0, 0),
            height: 0.5,
            radius: 0.25,
            segments: 8,
            friction: 0,
            visible: false
        });
        this.characterCapsule.visual.visible = false;

        // Pass reference to character for callbacks
        this.characterCapsule.physical.character = this;

        // Move character to different collision group for raycasting
        this.characterCapsule.physical.collisionFilterGroup = 2;

        // Disable character rotation
        this.characterCapsule.physical.fixedRotation = true;
        this.characterCapsule.physical.updateMassProperties();

        // Ray casting
        this.rayResult = new CANNON.RaycastResult();
        this.rayHasHit = false;
        this.rayCastLength = 0.63;
        this.raySafeOffset = 0.03;
        this.wantsToJump = false;
        this.justJumped = false;
        this.initJumpSpeed = -1;
        this.lastGroundImpactData = {
            velocity: new CANNON.Vec3()
        };

        // Ray cast debug
        const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const boxMat = new THREE.MeshLambertMaterial({
            color: 0xff0000
        });
        this.raycastBox = new THREE.Mesh(boxGeo, boxMat);
        this.raycastBox.visible = false;

        // Physics pre/post step callback bindings
        this.characterCapsule.physical.preStep = this.physicsPreStep;
        this.characterCapsule.physical.postStep = this.physicsPostStep;
    }

    setAnimations(animations) {
        this.animations = animations;
    }

    setModel(model) {
    
        this.modelContainer.remove(this.characterModel);
        this.characterModel = model;
        this.modelContainer.add(this.characterModel);
    
        this.mixer = new THREE.AnimationMixer(this.characterModel);
        this.setState(CharacterStates.Idle);
        this.charState.changeState();
    }

    setSimulatedVelocityInfluence(x, y = x, z = x) {
        this.simulatedVelocityInfluence.set(x, y, z);
    }
    
    setModelOffset(offset) {
        this.modelOffset.copy(offset);
    }
    
    setViewVector(vector) {
        this.viewVector.copy(vector).normalize();
    }
    
    /**
     * Set state to the player. Pass state class (function) name.
     * @param {function} State 
     */
    setState(State) {
        this.charState = new State(this);
    }
    
    setPosition(x, y, z) {
        this.characterCapsule.physical.position = new CANNON.Vec3(x, y, z);
    }
    
    setArcadeVelocity(velZ, velX = 0) {
        this.velocity.z = velZ;
        this.velocity.x = velX;
    }
    
    setArcadeVelocityTarget(velZ, velX = 0) {
        this.velocityTarget.z = velZ;
        this.velocityTarget.x = velX;
    }
    
    setOrientationTarget(vector) {
    
        this.orientationTarget.copy(vector).setY(0).normalize();
    }
    
    setBehaviour(behaviour) {
        behaviour.character = this;
        this.behaviour = behaviour;
    }
    
    setControl(key, value) {
    
        // Get action and set it's parameters
        let action = this.controls[key];
    
        if(action.value !== value){

            // Set value
            action.value = value;
        
            // Set the 'just' attributes
            if(value) action.justPressed = true;
            else action.justReleased = true;
        
            // Tag control as last activated
            this.controls.lastControl = action;
        
            // Tell player to handle states according to new input
            this.charState.changeState();
        
            // Reset the 'just' attributes
            action.justPressed = false;
            action.justReleased = false;
        }
    }
    
    takeControl() {
        this.world.gameMode = new GameModes.CharacterControls(this.world, this);
    }

    resetControls() {
        this.setControl('up', false);
        this.setControl('down', false);
        this.setControl('left', false);
        this.setControl('right', false);
        this.setControl('run', false);
        this.setControl('jump', false);
        this.setControl('use', false);
        this.setControl('primary', false);
        this.setControl('secondary', false);
        this.setControl('tertiary', false);
    }
    
    update(timeStep, options) {
    
        let defaults = {
            springRotation: true,
            rotationMultiplier: 1,
            springVelocity: true,
            rotateModel:  true,
            updateAnimation: true
        };
        options = Utils.setDefaults(options, defaults);

        this.visuals.position.copy(this.modelOffset);
        if(options.springVelocity)  this.springMovement(timeStep);
        if(options.springRotation)  this.springRotation(timeStep, options.rotationMultiplier);
        if(options.rotateModel)     this.rotateModel();
        if(options.updateAnimation && this.mixer != undefined) this.mixer.update(timeStep);
        
        this.position.set(
            this.characterCapsule.physical.interpolatedPosition.x,
            this.characterCapsule.physical.interpolatedPosition.y - this.height/2,
            this.characterCapsule.physical.interpolatedPosition.z
        );
    }
    
    setAnimation(clipName, fadeIn) {
        
        if(this.mixer != undefined) {
            let clip = THREE.AnimationClip.findByName( this.animations, clipName );
            let action = this.mixer.clipAction( clip );
            this.mixer.stopAllAction();
            action.fadeIn(fadeIn);
            action.play();
        
            return action._clip.duration;
        }
    }
    
    springMovement(timeStep) {
    
        // Simulator
        this.velocitySimulator.target.copy(this.velocityTarget);
        this.velocitySimulator.simulate(timeStep);
        
        // Update values
        this.velocity.copy(this.velocitySimulator.position);
        this.acceleration.copy(this.velocitySimulator.velocity);
    }
    
    springRotation(timeStep, RotationMultiplier) {
    
        //Spring rotation
        //Figure out angle between current and target orientation
        let angle = Utils.getAngleBetweenVectors(this.orientation, this.orientationTarget);

        // Simulator
        this.rotationSimulator.target = angle * RotationMultiplier;
        this.rotationSimulator.simulate(timeStep);
        let rot = this.rotationSimulator.position;
    
        // Updating values
        this.orientation.applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
        this.angularVelocity = this.rotationSimulator.velocity;
    
    }

    getLocalMovementDirection() {

        const positiveX = this.controls.right.value ? -1 : 0;
        const negativeX = this.controls.left.value  ?  1 : 0;
        const positiveZ = this.controls.up.value    ?  1 : 0;
        const negativeZ = this.controls.down.value  ? -1 : 0;
        
        return new THREE.Vector3(positiveX + negativeX, 0, positiveZ + negativeZ);
    }
    
    getCameraRelativeMovementVector() {
        
        const localDirection = this.getLocalMovementDirection();
        const flatViewVector = new THREE.Vector3(this.viewVector.x, 0, this.viewVector.z);

        return Utils.appplyVectorMatrixXZ(flatViewVector, localDirection);
    }

    setCameraRelativeOrientationTarget() {
        
        let moveVector = this.getCameraRelativeMovementVector();

        if(moveVector.x == 0 && moveVector.y == 0 && moveVector.z == 0) {
            this.setOrientationTarget(this.orientation);
        }
        else {
            this.setOrientationTarget(moveVector);
        }
    }
    
    rotateModel() {

        this.visuals.lookAt(this.orientation.x, this.visuals.position.y, this.orientation.z);
        // this.visuals.rotateX(this.acceleration.z * 3);
        this.visuals.rotateZ(-this.angularVelocity * 2.3 * this.velocity.length());
        this.visuals.position.setY(this.visuals.position.y + Math.cos(Math.abs(this.angularVelocity * 2.3)) / 2);
    }
    
    jump(initJumpSpeed = -1) {
        
        this.wantsToJump = true;
        this.initJumpSpeed = initJumpSpeed;
    }

    physicsPreStep() {

        // Player ray casting
        // Create ray
        const start = new CANNON.Vec3(this.position.x, this.position.y, this.position.z);
        const end = new CANNON.Vec3(this.position.x, this.position.y - this.character.rayCastLength, this.position.z);
        // Raycast options
        const rayCastOptions = {
            collisionFilterMask: ~2 /* cast against everything except second collision group (player) */,
            skipBackfaces: true     /* ignore back faces */
        };
        // Cast the ray
        this.character.rayHasHit = this.character.world.physicsWorld.raycastClosest(start, end, rayCastOptions, this.character.rayResult); 
        
        // Jumping
        if(this.character.wantsToJump && this.character.rayHasHit) {

            // If initJumpSpeed is set
            if(this.character.initJumpSpeed > -1) {
                
                // Flatten velocity
                this.velocity.y = 0;
                
                // Velocity needs to be at least as much as initJumpSpeed
                if(this.velocity.lengthSquared() < this.character.initJumpSpeed ** 2) {
                    this.velocity.normalize();
                    this.velocity.mult(this.character.initJumpSpeed, this.velocity);
                }
            }

            // Add positive vertical velocity
            this.velocity.y += 4;
            //Move above ground
            this.position.y += this.character.raySafeOffset;
            // Set flag for postStep and character states
            this.character.justJumped = true;
        }
        //Reset flag
        this.character.wantsToJump = false;
    }

    physicsPostStep() {
        
        // Player ray casting
        // Get velocities
        let simulatedVelocity = new THREE.Vector3().copy(this.velocity);
        let arcadeVelocity = new THREE.Vector3().copy(this.character.velocity).multiplyScalar(this.character.moveSpeed);
        arcadeVelocity = Utils.appplyVectorMatrixXZ(this.character.orientation, arcadeVelocity);

        let newVelocity = new THREE.Vector3(
            THREE.Math.lerp(arcadeVelocity.x, simulatedVelocity.x, this.character.simulatedVelocityInfluence.x),
            THREE.Math.lerp(arcadeVelocity.y, simulatedVelocity.y, this.character.simulatedVelocityInfluence.y),
            THREE.Math.lerp(arcadeVelocity.z, simulatedVelocity.z, this.character.simulatedVelocityInfluence.z),
        );

        // If just jumped, don't stick to ground
        if(this.character.justJumped) this.character.justJumped = false;
        else {
            // If we're hitting the ground, stick to ground
            if(this.character.rayHasHit) {
                if(this.character.raycastBox.visible) this.character.raycastBox.position.copy(this.character.rayResult.hitPointWorld);
                this.position.y = this.character.rayResult.hitPointWorld.y + this.character.rayCastLength - this.character.raySafeOffset;
                this.velocity.set(newVelocity.x, 0, newVelocity.z);
            }
            else {
                // If we're in air
                if(this.character.raycastBox.visible) this.character.raycastBox.position.set(this.position.x, this.position.y  - this.character.rayCastLength, this.position.z);
               
                this.velocity.copy(newVelocity);
                this.character.lastGroundImpactData.velocity.copy(this.velocity);
            }
        }
    }
}