import * as THREE from 'three';
import * as CANNON from 'cannon';

import { Utilities as Utils } from '../sketchbook/Utilities';
import { Springs } from '../simulation/Springs';

import { Controls } from '../sketchbook/Controls';
import { CharacterAI } from './CharacterAI';
import { CharacterStates } from './CharacterStates';
import { GameModes } from '../sketchbook/GameModes';
import { ObjectPhysics } from '../objects/ObjectPhysics';
import { Object } from '../objects/Object';

//Character class
export class Character extends THREE.Object3D
{
    constructor(options)
    {
        let defaults = {
            position: new THREE.Vector3(),
            height: 1
        };
        options = Utils.setDefaults(options, defaults);

        super();

        this.isCharacter = true;

        // Geometry
        this.height = options.height;
        this.modelOffset = new THREE.Vector3();

        // The visuals group is centered for easy character tilting
        this.visuals = new THREE.Group();
        this.add(this.visuals);

        // Model container is used to reliably ground the character, as animation can alter the position of the model itself
        this.modelContainer = new THREE.Group();
        this.modelContainer.position.y = -this.height / 2;
        this.visuals.add(this.modelContainer);//

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

        // Animation mixer - gets set when calling setModel()
        this.mixer;
        this.animations = [];

        // Movement
        this.acceleration = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.arcadeVelocityInfluence = new THREE.Vector3();
        this.arcadeVelocityIsAdditive = false;
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
            up: new Controls.EventControl(),
            down: new Controls.EventControl(),
            left: new Controls.EventControl(),
            right: new Controls.EventControl(),
            run: new Controls.EventControl(),
            jump: new Controls.EventControl(),
            use: new Controls.EventControl(),
            primary: new Controls.EventControl(),
            secondary: new Controls.EventControl(),
            tertiary: new Controls.EventControl(),
            lastControl: new Controls.EventControl()
        };

        // Physics
        // Player Capsule
        let capsulePhysics = new ObjectPhysics.Capsule({
            mass: 1,
            position: new CANNON.Vec3().copy(options.position),
            height: 0.5,
            radius: 0.25,
            segments: 8,
            friction: 0
        });
        this.characterCapsule = new Object();
        this.characterCapsule.setPhysics(capsulePhysics);

        // Pass reference to character for callbacks
        this.characterCapsule.physics.physical.character = this;

        // Move character to different collision group for raycasting
        this.characterCapsule.physics.physical.collisionFilterGroup = 2;

        // Disable character rotation
        this.characterCapsule.physics.physical.fixedRotation = true;
        this.characterCapsule.physics.physical.updateMassProperties();

        // Ray casting
        this.rayResult = new CANNON.RaycastResult();
        this.rayHasHit = false;
        this.rayCastLength = 0.60;
        this.raySafeOffset = 0.01;
        this.wantsToJump = false;
        this.initJumpSpeed = -1;
        this.groundImpactData = {
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
        this.characterCapsule.physics.physical.preStep = this.physicsPreStep;
        this.characterCapsule.physics.physical.postStep = this.physicsPostStep;
    }

    setAnimations(animations)
    {
        this.animations = animations;
    }

    setModel(model)
    {
        this.modelContainer.remove(this.characterModel);
        this.characterModel = model;
        this.modelContainer.add(this.characterModel);

        this.mixer = new THREE.AnimationMixer(this.characterModel);
        this.setState(CharacterStates.Idle);
        this.charState.changeState();
    }

    setArcadeVelocityInfluence(x, y = x, z = x)
    {
        this.arcadeVelocityInfluence.set(x, y, z);
    }

    setModelOffset(offset)
    {
        this.modelOffset.copy(offset);
    }

    setViewVector(vector)
    {
        this.viewVector.copy(vector).normalize();
    }

    /**
     * Set state to the player. Pass state class (function) name.
     * @param {function} State 
     */
    setState(State)
    {
        this.charState = new State(this);
    }

    setPosition(x, y, z)
    {
        this.characterCapsule.physics.physical.position = new CANNON.Vec3(x, y, z);
    }

    setArcadeVelocity(velZ, velX = 0, velY = 0)
    {
        this.velocity.z = velZ;
        this.velocity.x = velX;
        this.velocity.y = velY;
    }

    setArcadeVelocityTarget(velZ, velX = 0, velY = 0)
    {
        this.velocityTarget.z = velZ;
        this.velocityTarget.x = velX;
        this.velocityTarget.y = velY;
    }

    setOrientationTarget(vector)
    {
        this.orientationTarget.copy(vector).setY(0).normalize();
    }

    setBehaviour(behaviour)
    {
        behaviour.character = this;
        this.behaviour = behaviour;
    }

    setControl(key, value)
    {
        // Get action and set it's parameters
        let action = this.controls[key];

        if (action.value !== value)
        {

            // Set value
            action.value = value;

            // Set the 'just' attributes
            if (value) action.justPressed = true;
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

    takeControl()
    {
        if(this.world !== undefined)
        {
            this.world.setGameMode(new GameModes.CharacterControls(this));
        }
        else
        {
            console.warn('Attempting to take control of a character that doesn\'t belong to a world.');
        }
    }

    resetControls()
    {
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

    update(timeStep, options)
    {
        let defaults = {
            springRotation: true,
            rotationMultiplier: 1,
            springVelocity: true,
            rotateModel: true,
            updateAnimation: true
        };
        options = Utils.setDefaults(options, defaults);

        this.visuals.position.copy(this.modelOffset);
        if (options.springVelocity) this.springMovement(timeStep);
        if (options.springRotation) this.springRotation(timeStep, options.rotationMultiplier);
        if (options.rotateModel) this.rotateModel();
        if (options.updateAnimation && this.mixer != undefined) this.mixer.update(timeStep);

        this.position.set(
            this.characterCapsule.physics.physical.interpolatedPosition.x,
            this.characterCapsule.physics.physical.interpolatedPosition.y - this.height / 2,
            this.characterCapsule.physics.physical.interpolatedPosition.z
        );
    }

    setAnimation(clipName, fadeIn)
    {
        if (this.mixer != undefined)
        {
            //gltf
            // let clip = THREE.AnimationClip.findByName( this.animations, clipName );

            let clips = this.characterModel.animations;
            let clip = THREE.AnimationClip.findByName(clips, clipName);

            let action = this.mixer.clipAction(clip);
            this.mixer.stopAllAction();
            action.fadeIn(fadeIn);
            action.play();

            return action._clip.duration;
        }
    }

    springMovement(timeStep)
    {
        // Simulator
        this.velocitySimulator.target.copy(this.velocityTarget);
        this.velocitySimulator.simulate(timeStep);

        // Update values
        this.velocity.copy(this.velocitySimulator.position);
        this.acceleration.copy(this.velocitySimulator.velocity);
    }

    springRotation(timeStep, RotationMultiplier)
    {
        //Spring rotation
        //Figure out angle between current and target orientation
        let angle = Utils.getSignedAngleBetweenVectors(this.orientation, this.orientationTarget);

        // Simulator
        this.rotationSimulator.target = angle * RotationMultiplier;
        this.rotationSimulator.simulate(timeStep);
        let rot = this.rotationSimulator.position;

        // Updating values
        this.orientation.applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
        this.angularVelocity = this.rotationSimulator.velocity;

    }

    getLocalMovementDirection()
    {
        const positiveX = this.controls.right.value ? -1 : 0;
        const negativeX = this.controls.left.value ? 1 : 0;
        const positiveZ = this.controls.up.value ? 1 : 0;
        const negativeZ = this.controls.down.value ? -1 : 0;

        return new THREE.Vector3(positiveX + negativeX, 0, positiveZ + negativeZ);
    }

    getCameraRelativeMovementVector()
    {
        const localDirection = this.getLocalMovementDirection();
        const flatViewVector = new THREE.Vector3(this.viewVector.x, 0, this.viewVector.z);

        return Utils.appplyVectorMatrixXZ(flatViewVector, localDirection);
    }

    setCameraRelativeOrientationTarget()
    {
        let moveVector = this.getCameraRelativeMovementVector();

        if (moveVector.x == 0 && moveVector.y == 0 && moveVector.z == 0)
        {
            this.setOrientationTarget(this.orientation);
        }
        else
        {
            this.setOrientationTarget(moveVector);
        }
    }

    rotateModel()
    {
        this.visuals.lookAt(this.orientation.x, this.visuals.position.y, this.orientation.z);
        // this.visuals.rotateX(this.acceleration.z * 3);
        this.visuals.rotateZ(-this.angularVelocity * 2.3 * this.velocity.length());
        this.visuals.position.setY(this.visuals.position.y + (Math.cos(Math.abs(this.angularVelocity * 2.3 * this.velocity.length())) / 2));
    }

    jump(initJumpSpeed = -1)
    {
        this.wantsToJump = true;
        this.initJumpSpeed = initJumpSpeed;
    }

    physicsPreStep()
    {
        // Player ray casting
        // Create ray
        const start = new CANNON.Vec3(this.position.x, this.position.y, this.position.z);
        const end = new CANNON.Vec3(this.position.x, this.position.y - this.character.rayCastLength - this.character.raySafeOffset, this.position.z);
        // Raycast options
        const rayCastOptions = {
            collisionFilterMask: ~2 /* cast against everything except second collision group (player) */,
            skipBackfaces: true     /* ignore back faces */
        };
        // Cast the ray
        this.character.rayHasHit = this.character.world.physicsWorld.raycastClosest(start, end, rayCastOptions, this.character.rayResult);

        if (this.character.rayHasHit)
        {
            if (this.character.raycastBox.visible) this.character.raycastBox.position.copy(this.character.rayResult.hitPointWorld);
            this.position.y = this.character.rayResult.hitPointWorld.y + this.character.rayCastLength;
        }
        else
        {
            if (this.character.raycastBox.visible) this.character.raycastBox.position.set(this.position.x, this.position.y - this.character.rayCastLength - this.character.raySafeOffset, this.position.z);
        }
    }

    physicsPostStep()
    {
        // Player ray casting
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

            //Flatten velocity
            newVelocity.y = 0;

            // Measure the normal vector offset from direct "up" vector
            // and transform it into a matrix
            let up = new THREE.Vector3(0, 1, 0);
            let normal = new THREE.Vector3().copy(this.character.rayResult.hitNormalWorld);
            let q = new THREE.Quaternion().setFromUnitVectors(up, normal);
            let m = new THREE.Matrix4().makeRotationFromQuaternion(q);

            // Rotate the velocity vector
            newVelocity.applyMatrix4(m);

            // Apply velocity
            this.velocity.copy(newVelocity);
        }
        else
        {
            // If we're in air
            this.velocity.copy(newVelocity);
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
                if (this.velocity.lengthSquared() < this.character.initJumpSpeed ** 2)
                {
                    this.velocity.normalize();
                    this.velocity.mult(this.character.initJumpSpeed, this.velocity);
                }
            }

            // Add positive vertical velocity 
            this.velocity.y += 4;
            //Move above ground by 1x safe offset value
            this.position.y += this.character.raySafeOffset * 2;
            //Reset flag
            this.character.wantsToJump = false;
        }
    }
}