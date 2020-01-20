import * as THREE from 'three';
import * as CANNON from 'cannon';
import * as _ from 'lodash';

import * as Utils from '../core/Utilities';

import { KeyBinding } from '../core/KeyBinding';
import { SBObject } from '../objects/SBObject';
import { VectorSpringSimulator } from '../simulation/VectorSpringSimulator';
import { RelativeSpringSimulator } from '../simulation/RelativeSpringSimulator';
import { Idle } from './character_states/Idle';
import { CapsulePhysics } from '../objects/object_physics/CapsulePhysics';
import { ICharacterAI } from '../interfaces/ICharacterAI';
import { World } from '../core/World';
import { IControllable } from '../interfaces/IControllable';
import { ICharacterState } from '../interfaces/ICharacterState';
import { EnteringVehicle } from './character_states/vehicles/EnteringVehicle';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { VehicleSeat } from '../vehicles/VehicleSeat';
import { ExitingVehicle } from './character_states/vehicles/ExitingVehicle';
import { OpenVehicleDoor as OpenVehicleDoor } from './character_states/vehicles/OpenVehicleDoor';
import { Sitting } from './character_states/Sitting';
import { Vehicle } from '../vehicles/Vehicle';

export class Character extends THREE.Object3D implements IWorldEntity
{
    public isCharacter: boolean = true;
    public height: number = 0;
    public tiltContainer: THREE.Group;
    public modelContainer: THREE.Group;
    public mixer: THREE.AnimationMixer;
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
    public actions: { [action: string]: KeyBinding };
    public characterCapsule: SBObject;

    // Ray casting
    public rayResult: CANNON.RaycastResult = new CANNON.RaycastResult();
    public rayHasHit: boolean = false;
    public rayCastLength: number = 0.60;
    public raySafeOffset: number = 0.03;
    public wantsToJump: boolean = false;
    public initJumpSpeed: number = -1;
    public groundImpactData: Utils.GroundImpactData = new Utils.GroundImpactData();

    public controlledObject: IControllable;
    public controlledObjectSeat: VehicleSeat;

    public raycastBox: THREE.Mesh;
    public charState: ICharacterState;
    public behaviour: ICharacterAI;
    public world: World;

    public help1: THREE.AxesHelper;
    public help2: THREE.AxesHelper;
    public help3: THREE.AxesHelper;

    // Data for entering vehicles, should probably be
    // grouped together a little better e.g. as a class instance
    public isRunningTowardsVehicle: boolean = false;
    public targetSeat: VehicleSeat;

    private physicsEnabled: boolean = true;

    constructor(gltf: any)
    {
        super();

        this.readCharacterData(gltf);
        this.setAnimations(gltf.animations);

        this.help1 = new THREE.AxesHelper(1);
        this.help2 = new THREE.AxesHelper(2);
        this.help3 = new THREE.AxesHelper(3);

        // The visuals group is centered for easy character tilting
        this.tiltContainer = new THREE.Group();
        this.add(this.tiltContainer);

        // Model container is used to reliably ground the character, as animation can alter the position of the model itself
        this.modelContainer = new THREE.Group();
        this.modelContainer.position.y = -0.57;
        this.tiltContainer.add(this.modelContainer);
        this.modelContainer.add(gltf.scene);

        this.mixer = new THREE.AnimationMixer(gltf.scene);

        this.velocitySimulator = new VectorSpringSimulator(60, this.defaultVelocitySimulatorMass, this.defaultVelocitySimulatorDamping);
        this.rotationSimulator = new RelativeSpringSimulator(60, this.defaultRotationSimulatorMass, this.defaultRotationSimulatorDamping);

        this.viewVector = new THREE.Vector3();

        // Actions
        this.actions = {
            'up': new KeyBinding('KeyW'),
            'down': new KeyBinding('KeyS'),
            'left': new KeyBinding('KeyA'),
            'right': new KeyBinding('KeyD'),
            'run': new KeyBinding('ShiftLeft'),
            'jump': new KeyBinding('Space'),
            'use': new KeyBinding('KeyE'),
            'enter': new KeyBinding('KeyF'),
            'primary': new KeyBinding('Mouse0'),
            'secondary': new KeyBinding('Mouse1'),
        };

        // Physics
        // Player Capsule
        let capsulePhysics = new CapsulePhysics({
            mass: 1,
            position: new CANNON.Vec3(),
            height: 0.5,
            radius: 0.25,
            segments: 8,
            friction: 0.1
        });
        this.characterCapsule = new SBObject();
        this.characterCapsule.setPhysics(capsulePhysics);

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
        this.characterCapsule.physics.physical.preStep = (body: CANNON.Body) => { this.physicsPreStep(body, this); };
        this.characterCapsule.physics.physical.postStep = (body: CANNON.Body) => { this.physicsPostStep(body, this); };

        // States
        this.setState(new Idle(this));
    }

    public setAnimations(animations: []): void
    {
        this.animations = animations;
    }

    public setArcadeVelocityInfluence(x: number, y: number = x, z: number = x): void
    {
        this.arcadeVelocityInfluence.set(x, y, z);
    }

    public setViewVector(vector: THREE.Vector3): void
    {
        this.viewVector.copy(vector).normalize();
    }

    /**
     * Set state to the player. Pass state class (function) name.
     * @param {function} State 
     */
    public setState(state: ICharacterState): void
    {
        this.charState = state;
        this.charState.onInputChange();
    }

    public setPosition(x: number, y: number, z: number): void
    {
        if (this.physicsEnabled)
        {
            this.characterCapsule.physics.physical.position = new CANNON.Vec3(x, y, z);
            this.characterCapsule.physics.physical.interpolatedPosition = new CANNON.Vec3(x, y, z);
        }
        else
        {
            this.position.x = x;
            this.position.y = y;
            this.position.z = z;
        }
    }

    public resetVelocity(): void
    {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.velocity.z = 0;

        this.characterCapsule.physics.physical.velocity.x = 0;
        this.characterCapsule.physics.physical.velocity.y = 0;
        this.characterCapsule.physics.physical.velocity.z = 0;

        this.velocitySimulator.init();
    }

    public setArcadeVelocityTarget(velZ: number, velX: number = 0, velY: number = 0): void
    {
        this.velocityTarget.z = velZ;
        this.velocityTarget.x = velX;
        this.velocityTarget.y = velY;
    }

    public setOrientation(vector: THREE.Vector3, instantly: boolean = false): void
    {
        let lookVector = new THREE.Vector3().copy(vector).setY(0).normalize();
        this.orientationTarget.copy(lookVector);
        
        if (instantly)
        {
            this.orientation.copy(lookVector);
        }
    }

    public resetOrientation(): void
    {
        const elements = this.matrix.elements;
        let forward = new THREE.Vector3(elements[8], elements[9], elements[10]);

        this.setOrientation(forward, true);
    }

    public setBehaviour(behaviour: ICharacterAI): void
    {
        behaviour.character = this;
        this.behaviour = behaviour;
    }

    public setPhysicsEnabled(value: boolean): void {
        this.physicsEnabled = value;

        if (value === true)
        {
            this.world.physicsWorld.addBody(this.characterCapsule.physics.physical);
        }
        else
        {
            this.world.physicsWorld.remove(this.characterCapsule.physics.physical);
        }
    }

    public readCharacterData(gltf: any): void
    {
        gltf.scene.traverse((child) => {

            if (child.isMesh)
            {
                child.castShadow = true;
                child.receiveShadow = true;
            }

            if (child.hasOwnProperty('userData'))
            {
                if (child.userData.hasOwnProperty('texture'))
                {
                    child.material = new THREE.MeshLambertMaterial({
                        map: new THREE.TextureLoader().load('../build/graphics/' + child.userData.texture)
                    });

                    if (child.userData.hasOwnProperty('skinning'))
                    {
                        if (child.userData.skinning === 'true')
                        {
                            child.material.skinning = true;
                        }
                    }
                }
            }
        });
    }

    public handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void
    {
        if (this.controlledObject !== undefined)
        {
            this.controlledObject.handleKeyboardEvent(event, code, pressed);
        }
        else
        {
            // Free camera
            if (code === 'KeyC' && pressed === true && event.shiftKey === true)
            {
                this.resetControls();
                this.world.cameraOperator.characterCaller = this;
                this.world.inputManager.setInputReceiver(this.world.cameraOperator);
            }
            else
            {
                for (const action in this.actions) {
                    if (this.actions.hasOwnProperty(action)) {
                        const binding = this.actions[action];
    
                        if (_.includes(binding.eventCodes, code))
                        {
                            this.triggerAction(action, pressed);
                        }
                    }
                }
            }
        }
    }

    public handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void
    {
        if (this.controlledObject !== undefined)
        {
            this.controlledObject.handleMouseButton(event, code, pressed);
        }
        else
        {
            for (const action in this.actions) {
                if (this.actions.hasOwnProperty(action)) {
                    const binding = this.actions[action];

                    if (_.includes(binding.eventCodes, code))
                    {
                        this.triggerAction(action, pressed);
                    }
                }
            }
        }
    }

    public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void
    {
        if (this.controlledObject !== undefined)
        {
            this.controlledObject.handleMouseMove(event, deltaX, deltaY);
        }
        else
        {
            this.world.cameraOperator.move(deltaX, deltaY);
        }
    }
    
    public handleMouseWheel(event: WheelEvent, value: number): void
    {
        if (this.controlledObject !== undefined)
        {
            this.controlledObject.handleMouseWheel(event, value);
        }
        else
        {
            this.world.scrollTheTimeScale(value);
        }
    }

    public triggerAction(actionName: string, value: boolean): void
    {
        // Get action and set it's parameters
        let action = this.actions[actionName];

        if (action.isPressed !== value)
        {
            // Set value
            action.isPressed = value;

            // Reset the 'just' attributes
            action.justPressed = false;
            action.justReleased = false;

            // Set the 'just' attributes
            if (value) action.justPressed = true;
            else action.justReleased = true;

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
            this.world.inputManager.setInputReceiver(this);
        }
        else
        {
            console.warn('Attempting to take control of a character that doesn\'t belong to a world.');
        }
    }

    public resetControls(): void
    {
        for (const action in this.actions) {
            if (this.actions.hasOwnProperty(action)) {
                this.triggerAction(action, false);
            }
        }
    }

    public update(timeStep: number): void
    {
        if (this.behaviour !== undefined) {
            this.behaviour.update(timeStep);
        }

        if (this.isRunningTowardsVehicle === true) {
            let entryPoint = new THREE.Vector3();
            this.targetSeat.entryPoint.getWorldPosition(entryPoint);
            let viewVector = new THREE.Vector3().subVectors(entryPoint, this.position);
            this.setOrientation(viewVector);

            let heightDifference = viewVector.y;
            viewVector.y = 0;
            if (this.charState.canEnterVehicles && viewVector.length() < 0.2 && heightDifference < 2) {
                this.enterVehicle(this.targetSeat);
            }
        }

        if (this.charState !== undefined) {
            this.charState.update(timeStep);
        }

        // this.visuals.position.copy(this.modelOffset);
        if (this.physicsEnabled) this.springMovement(timeStep);
        if (this.physicsEnabled) this.springRotation(timeStep);
        if (this.physicsEnabled) this.rotateModel();
        if (this.mixer !== undefined) this.mixer.update(timeStep);

        // Sync physics/graphics
        if (this.physicsEnabled)
        {
            this.position.set(
                this.characterCapsule.physics.physical.interpolatedPosition.x,
                this.characterCapsule.physics.physical.interpolatedPosition.y,
                this.characterCapsule.physics.physical.interpolatedPosition.z
            );
        }
        else {
            let newPos = new THREE.Vector3();
            this.getWorldPosition(newPos);

            this.characterCapsule.physics.physical.position.copy(Utils.cannonVector(newPos));
            this.characterCapsule.physics.physical.interpolatedPosition.copy(Utils.cannonVector(newPos));
        }

        // Debug
        this.help1.position.copy(this.position);
        this.help1.quaternion.copy(this.quaternion);
        this.modelContainer.getWorldPosition(this.help2.position);
        this.modelContainer.getWorldQuaternion(this.help2.quaternion);
        this.tiltContainer.getWorldPosition(this.help3.position);
        this.tiltContainer.getWorldQuaternion(this.help3.quaternion);
        document.getElementById('state-debug').innerHTML = this.charState['constructor'].name;
    }

    public inputReceiverInit(): void
    {
        if (this.controlledObject !== undefined)
        {
            this.controlledObject.inputReceiverInit();
            return;
        }

        this.world.cameraOperator.setRadius(1.6, true);
        this.world.cameraOperator.followMode = false;
        // this.world.dirLight.target = this;

        this.world.updateControls([
            {
                keys: ['W', 'A', 'S', 'D'],
                desc: 'Movement'
            },
            {
                keys: ['Space'],
                desc: 'Jump'
            },
            {
                keys: ['Shift'],
                desc: 'Sprint'
            },
            {
                keys: ['F'],
                desc: 'Enter vehicle'
            },
            {
                keys: ['Shift', '+', 'C'],
                desc: 'Free camera'
            },
        ]);
    }

    public inputReceiverUpdate(timeStep: number): void
    {
        if (this.controlledObject !== undefined)
        {
            this.controlledObject.inputReceiverUpdate(timeStep);
        }
        else
        {
            // Look in camera's direction
            this.viewVector = new THREE.Vector3().subVectors(this.position, this.world.camera.position);

            // TODO: Make global property
            let globalPos = new THREE.Vector3();
            this.getWorldPosition(globalPos);

            this.getWorldPosition(this.world.cameraOperator.target);
        }
        
    }

    public setAnimation(clipName: string, fadeIn: number): void
    {
        if (this.mixer !== undefined)
        {
            // gltf
            let clip = THREE.AnimationClip.findByName( this.animations, clipName );

            let action = this.mixer.clipAction(clip);
            this.mixer.stopAllAction();
            action.fadeIn(fadeIn);
            action.play();

            return action['_clip'].duration;
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

    public springRotation(timeStep: number): void
    {
        // Spring rotation
        // Figure out angle between current and target orientation
        let angle = Utils.getSignedAngleBetweenVectors(this.orientation, this.orientationTarget);

        // Simulator
        this.rotationSimulator.target = angle;
        this.rotationSimulator.simulate(timeStep);
        let rot = this.rotationSimulator.position;

        // Updating values
        this.orientation.applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
        this.angularVelocity = this.rotationSimulator.velocity;
    }

    public getLocalMovementDirection(): THREE.Vector3
    {
        const positiveX = this.actions.right.isPressed ? -1 : 0;
        const negativeX = this.actions.left.isPressed ? 1 : 0;
        const positiveZ = this.actions.up.isPressed ? 1 : 0;
        const negativeZ = this.actions.down.isPressed ? -1 : 0;

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
        if (this.isRunningTowardsVehicle === false)
        {
            let moveVector = this.getCameraRelativeMovementVector();
    
            if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0)
            {
                this.setOrientation(this.orientation);
            }
            else
            {
                this.setOrientation(moveVector);
            }
        }
    }

    public rotateModel(): void
    {
        this.lookAt(this.position.x + this.orientation.x, this.position.y + this.orientation.y, this.position.z + this.orientation.z);

        this.tiltContainer.rotation.z = (-this.angularVelocity * 2.3 * this.velocity.length());
        this.tiltContainer.position.setY((Math.cos(Math.abs(this.angularVelocity * 2.3 * this.velocity.length())) / 2) - 0.5);
    }

    public jump(initJumpSpeed: number = -1): void
    {
        this.wantsToJump = true;
        this.initJumpSpeed = initJumpSpeed;
    }

    public findVehicleToEnter(): void
    {
        // TODO follow a path (generated using a navmesh?)
        // TODO identify a seat to get into
        let bestVehicle: IControllable;
        let bestDistance = Number.POSITIVE_INFINITY;
        let maxDistance = 10;

        this.world.vehicles.forEach((vehicle) => {
           
            let distance = new THREE.Vector3().subVectors(this.position, vehicle.position).lengthSq();

            if (distance < maxDistance && distance < bestDistance)
            {
                bestVehicle = vehicle;
            }
        });

        if (bestVehicle !== undefined)
        {
            this.isRunningTowardsVehicle = true;
            this.targetSeat = bestVehicle.seats[0];
            this.triggerAction('up', true);
        }
        else {
            console.error('World has no vehicles');
        }
    }

    public enterVehicle(seat: VehicleSeat): void
    {
        this.resetControls();

        if (seat.isDoorOpen())
        {
            this.setState(new EnteringVehicle(this, this.targetSeat));
        }
        else
        {
            this.setState(new OpenVehicleDoor(this, seat));
        }

        this.isRunningTowardsVehicle = false;
        this.targetSeat = undefined;
    }

    public teleportToVehicle(vehicle: Vehicle, seat: any): void
    {
        this.resetVelocity();
        this.rotateModel();
        this.setPhysicsEnabled(false);
        (vehicle as unknown as THREE.Object3D).attach(this);

        this.setPosition(seat.seatPoint.position.x, seat.seatPoint.position.y + 0.6, seat.seatPoint.position.z);
        this.quaternion.copy(seat.seatPoint.quaternion);

        this.setState(new Sitting(this));
    }

    public startControllingVehicle(vehicle: any, seat: any): void
    {
        this.controlledObject = vehicle;
        vehicle.inputReceiverInit();

        this.controlledObjectSeat = seat;
        vehicle.controllingCharacter = this;
    }

    public exitVehicle(): void
    {
        this.setState(new ExitingVehicle(this, this.controlledObject, this.controlledObjectSeat));
        this.controlledObject.controllingCharacter = undefined;
        this.controlledObject.resetControls();
        this.controlledObject = undefined;
        this.inputReceiverInit();
    }

    public physicsPreStep(body: CANNON.Body, character: Character): void
    {
        // Player ray casting
        // Create ray
        const start = new CANNON.Vec3(body.position.x, body.position.y, body.position.z);
        const end = new CANNON.Vec3(body.position.x, body.position.y - character.rayCastLength - character.raySafeOffset, body.position.z);
        // Raycast options
        const rayCastOptions = {
            collisionFilterMask: ~2, /* cast against everything except second collision group (player) */
            skipBackfaces: true      /* ignore back faces */
        };
        // Cast the ray
        character.rayHasHit = character.world.physicsWorld.raycastClosest(start, end, rayCastOptions, character.rayResult);

        // Raycast debug
        if (character.rayHasHit)
        {
            if (character.raycastBox.visible) {
                character.raycastBox.position.x = character.rayResult.hitPointWorld.x;
                character.raycastBox.position.y = character.rayResult.hitPointWorld.y;
                character.raycastBox.position.z = character.rayResult.hitPointWorld.z;
            }
        }
        else
        {
            if (character.raycastBox.visible) {
                character.raycastBox.position.set(body.position.x, body.position.y - character.rayCastLength - character.raySafeOffset, body.position.z);
            }
        }
    }

    public physicsPostStep(body: CANNON.Body, character: Character): void
    {
        // Get velocities
        let simulatedVelocity = new THREE.Vector3(body.velocity.x, body.velocity.y, body.velocity.z);

        // Take local velocity
        let arcadeVelocity = new THREE.Vector3().copy(character.velocity).multiplyScalar(character.moveSpeed);
        // Turn local into global
        arcadeVelocity = Utils.appplyVectorMatrixXZ(character.orientation, arcadeVelocity);

        let newVelocity = new THREE.Vector3();

        // Additive velocity mode
        if (character.arcadeVelocityIsAdditive)
        {
            newVelocity.copy(simulatedVelocity);

            let globalVelocityTarget = Utils.appplyVectorMatrixXZ(character.orientation, character.velocityTarget);
            let add = new THREE.Vector3().copy(arcadeVelocity).multiply(character.arcadeVelocityInfluence);

            if (Math.abs(simulatedVelocity.x) < Math.abs(globalVelocityTarget.x * character.moveSpeed) || Utils.haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)) { newVelocity.x += add.x; }
            if (Math.abs(simulatedVelocity.y) < Math.abs(globalVelocityTarget.y * character.moveSpeed) || Utils.haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)) { newVelocity.y += add.y; }
            if (Math.abs(simulatedVelocity.z) < Math.abs(globalVelocityTarget.z * character.moveSpeed) || Utils.haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)) { newVelocity.z += add.z; }
        }
        else
        {
            newVelocity = new THREE.Vector3(
                THREE.Math.lerp(simulatedVelocity.x, arcadeVelocity.x, character.arcadeVelocityInfluence.x),
                THREE.Math.lerp(simulatedVelocity.y, arcadeVelocity.y, character.arcadeVelocityInfluence.y),
                THREE.Math.lerp(simulatedVelocity.z, arcadeVelocity.z, character.arcadeVelocityInfluence.z),
            );
        }

        // If we're hitting the ground, stick to ground
        if (character.rayHasHit)
        {
            // Flatten velocity
            newVelocity.y = 0;

            // Measure the normal vector offset from direct "up" vector
            // and transform it into a matrix
            let up = new THREE.Vector3(0, 1, 0);
            let normal = new THREE.Vector3(character.rayResult.hitNormalWorld.x, character.rayResult.hitNormalWorld.y, character.rayResult.hitNormalWorld.z);
            let q = new THREE.Quaternion().setFromUnitVectors(up, normal);
            let m = new THREE.Matrix4().makeRotationFromQuaternion(q);

            // Rotate the velocity vector
            newVelocity.applyMatrix4(m);

            // Compensate for gravity
            // newVelocity.y -= body.world.physicsWorld.gravity.y / body.character.world.physicsFrameRate;

            // Apply velocity
            body.velocity.x = newVelocity.x;
            body.velocity.y = newVelocity.y;
            body.velocity.z = newVelocity.z;
            // Ground character
            body.position.y = character.rayResult.hitPointWorld.y + character.rayCastLength + (newVelocity.y / character.world.physicsFrameRate);
        }
        else
        {
            // If we're in air
            body.velocity.x = newVelocity.x;
            body.velocity.y = newVelocity.y;
            body.velocity.z = newVelocity.z;

            // Save last in-air information
            character.groundImpactData.velocity.x = body.velocity.x;
            character.groundImpactData.velocity.y = body.velocity.y;
            character.groundImpactData.velocity.z = body.velocity.z;
        }

        // Jumping
        if (character.wantsToJump)
        {
            // If initJumpSpeed is set
            if (character.initJumpSpeed > -1)
            {
                // Flatten velocity
                body.velocity.y = 0;

                // Velocity needs to be at least as much as initJumpSpeed
                if (body.velocity.lengthSquared() < character.initJumpSpeed ** 2)
                {
                    body.velocity.normalize();
                    body.velocity.mult(character.initJumpSpeed, body.velocity);
                }
            }

            // Add positive vertical velocity 
            body.velocity.y += 4;
            // Move above ground by 2x safe offset value
            body.position.y += character.raySafeOffset * 2;
            // Reset flag
            character.wantsToJump = false;
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

            world.graphicsWorld.add(this.help1);
            // world.graphicsWorld.add(this.help2);
            // world.graphicsWorld.add(this.help3);
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