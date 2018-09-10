import * as THREE from 'three';
import * as CANNON from 'cannon';

import { Object3D } from 'three';
import { Utilities as Utils } from '../sketchbook/Utilities';

import * as Springs from '../simulation/SpringSimulation';
import * as Controls from '../sketchbook/Controls';
import * as CharacterAI from './CharacterAI';
import * as CharacterStates from './CharacterStates';

//Character class
export class Character extends Object3D {
    
    constructor(world) {

        super();

        // Save "this" for nested functions
        const scope = this;
    
        this.world = world;

        // Geometry
        this.height = 1;
        this.modelOffset = new THREE.Vector3();

        // Default model
        const loader = new THREE.FBXLoader();
        loader.load('resources/models/game_man/game_man.fbx', function (object) {

            object.traverse( function ( child ) {
                if ( child.isMesh ) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
                if( child.name == 'game_man') {
                    child.material = new THREE.MeshLambertMaterial({
                        map: new THREE.TextureLoader().load('resources/models/game_man/game_man.png' ),
                        skinning: true
                    });
                }
            } );

            // Create visual groups
            // The visual hierarchy goes:
            // this->visuals->modelContainer->characterModel

            // The visuals group is centered for easy character tilting
            scope.visuals = new THREE.Group();
            scope.add(scope.visuals);

            // Model container is used to reliably ground the character, as animation can alter the position of the model itself
            scope.modelContainer = new THREE.Group();
            scope.modelContainer.position.y = -scope.height/2;
            scope.visuals.add(scope.modelContainer);

            // Assign model to character
            scope.characterModel = object;
            // Attach model to model container
            scope.modelContainer.add(object);
        
            // Animation
            scope.mixer = new THREE.AnimationMixer(object);

            // scope.player.setModel(object);
            scope.setModelOffset(new THREE.Vector3(0, -0.1, 0));
            scope.setState(CharacterStates.CharacterState_Idle);
        } );

        // Movement
        this.acceleration = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.velocityTarget = new THREE.Vector3();
        // Velocity spring simulator
        this.defaultVelocitySimulatorDamping = 0.8;
        this.defaultVelocitySimulatorMass = 50;
        this.velocitySimulator = new Springs.VectorSpringSimulator(60, this.defaultVelocitySimulatorMass, this.defaultVelocitySimulatorDamping);
        this.moveSpeed = 4;

        // Rotation
        this.angularVelocity = 0;
        this.orientation = new THREE.Vector3(0, 0, 1);
        this.orientationTarget = new THREE.Vector3(0, 0, 1);
        // Rotation spring simulator
        this.defaultRotationSimulatorDamping = 0.5;
        this.defaultRotationSimulatorMass = 10;
        this.rotationSimulator = new Springs.RelativeSpringSimulator(60, this.defaultRotationSimulatorMass, this.defaultRotationSimulatorDamping);

        // States
        this.setState(CharacterStates.CharacterState_DefaultState);
        this.viewVector = new THREE.Vector3();

        // Controls
        this.behaviour = new CharacterAI.CharacterAI_Default(this);
        this.controls = {
            up:        new Controls.Control_EventControl(),
            down:      new Controls.Control_EventControl(),
            left:      new Controls.Control_EventControl(),
            right:     new Controls.Control_EventControl(),
            run:       new Controls.Control_EventControl(),
            jump:      new Controls.Control_EventControl(),
            use:       new Controls.Control_EventControl(),
            primary:   new Controls.Control_EventControl(),
            secondary: new Controls.Control_EventControl(),
            tertiary:  new Controls.Control_EventControl(),
            lastControl: new Controls.Control_EventControl()
        };

        // Physics
        // Player Capsule
        const characterMass = 1;
        const initPosition = new CANNON.Vec3(0, 0, 0);
        const characterHeight = 0.5;
        const characterRadius = 0.25;
        const characterSegments = 12;
        const characterFriction = 0;
        const characterCollisionGroup = 2;
        this.characterCapsule = world.createCharacterCapsule(characterMass, initPosition, characterHeight, characterRadius, characterSegments, characterFriction);
        this.characterCapsule.visual.visible = false;

        // Pass reference to character for callbacks
        this.characterCapsule.physical.character = this;

        // Move character to different collision group for raycasting
        this.characterCapsule.physical.collisionFilterGroup = characterCollisionGroup;

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

        // Ray cast debug
        const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const boxMat = new THREE.MeshLambertMaterial({
            color: 0xff0000
        });
        this.raycastBox = new THREE.Mesh(boxGeo, boxMat);
        this.raycastBox.visible = false;

        // PreStep event
        this.characterCapsule.physical.preStep = function() {

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
                this.character.characterCapsule.physical.velocity.y += 4;
                this.character.characterCapsule.physical.position.y += this.character.raySafeOffset;
                this.character.justJumped = true;
            }
            this.character.wantsToJump = false;
        };

        // PostStep event
        this.characterCapsule.physical.postStep = function() {
        
            // Player ray casting
            // Get velocities
            let simulatedVelocity = new CANNON.Vec3().copy(this.velocity);
            let arcadeVelocity = this.character.velocity.clone().multiplyScalar(this.character.moveSpeed);
            arcadeVelocity = Utils.appplyVectorMatrixXZ(this.character.orientation, arcadeVelocity);

            // If just jumped, don't stick to ground
            if(this.character.justJumped) this.character.justJumped = false;
            else {
                // If we're hitting the ground, stick to ground
                if(this.character.rayHasHit) {
                    if(this.character.raycastBox.visible) this.character.raycastBox.position.copy(this.character.rayResult.hitPointWorld);
                    this.position.y = this.character.rayResult.hitPointWorld.y + this.character.rayCastLength - this.character.raySafeOffset;
                    this.velocity.set(arcadeVelocity.x, 0, arcadeVelocity.z);
                }
                else {
                    // If we're in air, leave vertical velocity to physics
                    if(this.character.raycastBox.visible) this.character.raycastBox.position.set(this.position.x, this.position.y  - this.character.rayCastLength, this.position.z);
                    this.velocity.set(arcadeVelocity.x, simulatedVelocity.y, arcadeVelocity.z);
                }
            }
        };
    }

    setModel(model) {
    
        this.modelContainer.remove(this.characterModel);
        this.characterModel = model;
        this.modelContainer.add(this.characterModel);
    
        this.mixer = new THREE.AnimationMixer(this.characterModel);
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
    
    setVelocity(velZ, velX = 0) {
        this.velocity.z = velZ;
        this.velocity.x = velX;
    }
    
    setVelocityTarget(velZ, velX = 0) {
        this.velocityTarget.z = velZ;
        this.velocityTarget.x = velX;
    }
    
    setOrientationTarget(vector) {
    
        this.orientationTarget.copy(vector).setY(0).normalize();
    }
    
    setBehaviour(bhv) {
        this.behaviour = bhv;
    }
    
    setControl(key, value) {
    
        // Get action and set it's parameters
        let action = this.controls[key];
    
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
    
    
    update(timeStep, parameters) {
    
        //Default values
        if(parameters == undefined) parameters = {};
        if(parameters.SpringRotation == undefined) parameters.SpringRotation = true;
        if(parameters.SpringVelocity == undefined) parameters.SpringVelocity = true;
        if(parameters.rotateModel == undefined) parameters.rotateModel = true;
        if(parameters.updateAnimation == undefined) parameters.updateAnimation = true;
    
        this.visuals.position.copy(this.modelOffset);
    
        if(parameters.SpringVelocity)  this.SpringMovement(timeStep);
        if(parameters.SpringRotation)  this.SpringRotation(timeStep);
        if(parameters.rotateModel)     this.rotateModel();
        if(parameters.updateAnimation) this.mixer.update(timeStep);
        
        this.position.set(this.characterCapsule.physical.interpolatedPosition.x,
            this.characterCapsule.physical.interpolatedPosition.y - this.height/2,
            this.characterCapsule.physical.interpolatedPosition.z);
    }
    
    setAnimation(clipName, fadeIn) {
        
        let clips = this.characterModel.animations;
        let clip = THREE.AnimationClip.findByName( clips, clipName );
        let action = this.mixer.clipAction( clip );
        this.mixer.stopAllAction();
        action.fadeIn(fadeIn);
        action.play();
    
        return action._clip.duration;
    }
    
    SpringMovement(timeStep) {
    
        // Simulator
        this.velocitySimulator.target.copy(this.velocityTarget);
        this.velocitySimulator.simulate(timeStep);
        
        // Update values
        this.velocity.copy(this.velocitySimulator.position);
        this.acceleration.copy(this.velocitySimulator.velocity);
    }
    
    SpringRotation(timeStep) {
    
        //Spring rotation
        //Figure out angle between current and target orientation
        let normal = new THREE.Vector3(0, 1, 0);
        let dot = this.orientation.dot(this.orientationTarget);
    

        let angle = 0;

        // If dot is close to 1, we'll round angle to zero
        let dot_treshold = 0.9995;
        if (dot > dot_treshold) {
            angle = 0;
        }
        // Dot too close to -1
        else if(dot < -dot_treshold) {
            angle = Math.PI / 2;
        }
        else {
            // Get angle difference in radians
            angle = Math.acos(dot);
            // Get vector pointing up or down
            let cross = new THREE.Vector3().crossVectors(this.orientation, this.orientationTarget);
            // Compare cross with normal to find out direction
            if (normal.dot(cross) < 0) {
                angle = -angle;
            }
        }
        
        // Simulator
        this.rotationSimulator.target = angle;
        this.rotationSimulator.simulate(timeStep);
        let rot = this.rotationSimulator.position;
    
        // console.log(this.orientationTarget);
    
        // Updating values
        this.orientation.applyAxisAngle(normal, rot);
        this.angularVelocity = this.rotationSimulator.velocity;
    
    }
    
    setGlobalDirectionGoal() {
        
        const positiveX = this.controls.right.value ? -1 : 0;
        const negativeX = this.controls.left.value  ?  1 : 0;
        const positiveZ = this.controls.up.value    ?  1 : 0;
        const negativeZ = this.controls.down.value  ? -1 : 0;
        
        const localDirection = new THREE.Vector3(positiveX + negativeX, 0, positiveZ + negativeZ);
        const flatViewVector = new THREE.Vector3(this.viewVector.x, 0, this.viewVector.z);
    
        // If no direction is pressed, set target as current orientation
        // if(positiveX == 0 && negativeX == 0 && positiveZ == 0 && negativeZ == 0) {
        if((localDirection.x == 0 && localDirection.y == 0 && localDirection.z == 0) ||
           (flatViewVector.x == 0 && flatViewVector.y == 0 && flatViewVector.z == 0)) {
            this.setOrientationTarget(this.orientation);
        }
        else {
            this.setOrientationTarget(Utils.appplyVectorMatrixXZ(flatViewVector, localDirection));
        }
    }
    
    rotateModel() {
        this.visuals.lookAt(this.orientation.x, this.visuals.position.y, this.orientation.z);
        this.visuals.rotateX(this.acceleration.z * 3);
        this.visuals.rotateZ(-this.angularVelocity * 2.3);
        this.visuals.position.setY(this.visuals.position.y + Math.cos(Math.abs(this.angularVelocity * 2.3)) / 2);
    }
    
    jump() {
        this.wantsToJump = true;
    }
}