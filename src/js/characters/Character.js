
//Character class
//The visual hierarchy goes:
//  this->visuals->modelContainer->characterModel
function Character() {
    
    THREE.Object3D.call(this);

    // Geometry
    this.height = 1;
    this.modelOffset = new THREE.Vector3();

    // Default model
    this.characterModel = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1, 0.5),
        new THREE.MeshLambertMaterial({ color: 0xffffff }));
    this.characterModel.position.set(0, 0.5, 0);
    this.characterModel.castShadow = true;

    // Create visual groups
    // visuals group is centered for easy character tilting
    // modelContainer is used to reliably ground the character, as animation can alter the position of the model itself
    this.visuals = new THREE.Group();
    this.add(this.visuals);
    this.modelContainer = new THREE.Group();
    this.modelContainer.position.y = -this.height/2;
    this.visuals.add(this.modelContainer);

    // Attach model to visuals
    this.modelContainer.add(this.characterModel);

    // Animation
    this.mixer = new THREE.AnimationMixer(this.characterModel);

    // Movement
    this.acceleration = 0;
    this.velocity = 0;
    this.velocityTarget = 0;
    this.velocitySimulator = new SpringSimulator(60, 50, 0.8);
    this.moveSpeed = 4;

    // Rotation
    this.angularVelocity = 0;
    this.orientation = new THREE.Vector3(0, 0, 1);
    this.orientationTarget = new THREE.Vector3(0, 0, 1);
    this.rotationSimulator = new SpringRSimulator(60, 10, 0.5);

    // States
    this.setState(CharStates.DefaultState);

    // Physics
    // Player Capsule
    var playerMass = 1;
    var playerHeight = 0.5;
    var playerRadius = 0.25;
    var playerSegments = 12;
    var playerFriction = 0;
    var playerCollisionGroup = 2;
    this.characterCapsule = addParallelCapsule(playerMass, new CANNON.Vec3(2, 1, 2), playerHeight, playerRadius, playerSegments, playerFriction);
    this.characterCapsule.visual.visible = false;
    // Pass reference to character for callbacks
    this.characterCapsule.physical.character = this;

    // Move character to different collision group for raycasting
    this.characterCapsule.physical.collisionFilterGroup = playerCollisionGroup;

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

    // PreStep event
    this.characterCapsule.physical.preStep = function() {

        // Player ray casting
        // Create ray
        var start = new CANNON.Vec3(this.position.x, this.position.y, this.position.z);
        var end = new CANNON.Vec3(this.position.x, this.position.y - this.character.rayCastLength, this.position.z);
        // Raycast options
        var rayCastOptions = {
            collisionFilterMask: ~2 /* cast against everything except second group (player) */,
            skipBackfaces: true     /* ignore back faces */
        }
        // Cast the ray
        this.character.rayHasHit = physicsWorld.raycastClosest(start, end, rayCastOptions, this.character.rayResult); 
        
        // Jumping
        if(this.character.wantsToJump && this.character.rayHasHit) {
            this.character.characterCapsule.physical.velocity.y += 4;
            this.character.characterCapsule.physical.position.y += this.character.raySafeOffset;
            this.character.justJumped = true;
        }
        this.character.wantsToJump = false;
    }

    // PostStep event
    this.characterCapsule.physical.postStep = function() {
    
        // Player ray casting
        // Get velocities
        var simulatedVelocity = new CANNON.Vec3().copy(this.velocity);
        var arcadeVelocity = new THREE.Vector3().copy(this.character.orientation).multiplyScalar(this.character.velocity * this.character.moveSpeed);
    
        // If just jumped, don't stick to ground
        if(this.character.justJumped) this.character.justJumped = false;
        else {
            // If we're hitting the ground, stick to ground
            if(this.character.rayHasHit) {
                raycastBox.position.copy(this.character.rayResult.hitPointWorld);
                this.position.y = this.character.rayResult.hitPointWorld.y + this.character.rayCastLength - this.character.raySafeOffset;
                this.velocity.set(arcadeVelocity.x, 0, arcadeVelocity.z);
            }
            else {
                // If we're in air, leave vertical velocity to physics
                raycastBox.position.set(this.position.x, this.position.y  - this.character.rayCastLength, this.position.z);
                this.velocity.set(arcadeVelocity.x, simulatedVelocity.y, arcadeVelocity.z);
            }
        }
    }
};

Character.prototype = Object.create(THREE.Object3D.prototype);

Character.prototype.setModel = function(model) {
    this.modelContainer.remove(this.characterModel);
    this.characterModel = model;
    this.modelContainer.add(this.characterModel);

    this.mixer = new THREE.AnimationMixer(this.characterModel);
}

Character.prototype.setModelOffset = function(offset) {
    this.modelOffset.copy(offset);
}

Character.prototype.setState = function(state) {

    switch (state) {
        case CharStates.DefaultState:
            this.charState = new CS_DefaultState(this);
            break;
        case CharStates.Idle:
            this.charState = new CS_Idle(this);
            break;
        case CharStates.Walk:
            this.charState = new CS_Walk(this);
            break;
        case CharStates.Sprint:
            this.charState = new CS_Sprint(this);
            break;
        case CharStates.StartWalkForward:
            this.charState = new CS_StartWalkForward(this);
            break;
        case CharStates.EndWalk:
            this.charState = new CS_EndWalk(this);
            break;
        case CharStates.JumpIdle:
            this.charState = new CS_JumpIdle(this);
            break;
        case CharStates.JumpRunning:
            this.charState = new CS_JumpRunning(this);
            break;
        case CharStates.Falling:
            this.charState = new CS_Falling(this);
            break;
        case CharStates.DropIdle:
            this.charState = new CS_DropIdle(this);
            break;
        case CharStates.DropRunning:
            this.charState = new CS_DropRunning(this);
            break;
        default:
            console.log("Unknown state: " + state);
            this.charState = new CS_DefaultState(this); 
    }
}

Character.prototype.update = function(timeStep, parameters) {

    //Default values
    if(parameters == undefined) parameters = {};
    if(parameters.SpringRotation == undefined) parameters.SpringRotation = true;
    if(parameters.SpringVelocity == undefined) parameters.SpringVelocity = true;
    if(parameters.rotateModel == undefined) parameters.rotateModel = true;
    if(parameters.updateAnimation == undefined) parameters.updateAnimation = true;

    this.visuals.position.copy(this.modelOffset);

    if(parameters.SpringRotation)  this.SpringMovement(timeStep);
    if(parameters.SpringVelocity)  this.SpringRotation(timeStep);
    if(parameters.rotateModel)     this.rotateModel();
    if(parameters.updateAnimation) this.mixer.update(timeStep);
    
    this.position.set(this.characterCapsule.physical.interpolatedPosition.x,
        this.characterCapsule.physical.interpolatedPosition.y - this.height/2,
        this.characterCapsule.physical.interpolatedPosition.z);
}

Character.prototype.setAnimation = function(clipName, fadeIn) {
    var clips = this.characterModel.animations;
    var clip = THREE.AnimationClip.findByName( clips, clipName );
    var action = this.mixer.clipAction( clip );
    this.mixer.stopAllAction();
    action.fadeIn(fadeIn);
    action.play();

    return action._clip.duration;
}

Character.prototype.SpringMovement = function(timeStep) {

    // Simulator
    this.velocitySimulator.target = this.velocityTarget;
    this.velocitySimulator.simulate(timeStep);
    this.velocity = this.velocitySimulator.position;

    this.acceleration = this.velocitySimulator.velocity;
}

Character.prototype.SpringRotation = function(timeStep) {

    //Spring rotation
    //Figure out angle between current and target orientation
    var normal = new THREE.Vector3(0, 1, 0);
    var dot = this.orientation.normalize().dot(this.orientationTarget.normalize());

    // If dot is close to 1, we'll round angle to zero
    var dot_treshold = 0.9995;
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
        // Cross product returns vector pointing up or down
        var cross = new THREE.Vector3().crossVectors(this.orientation, this.orientationTarget);
        // Compare cross with normal to find out direction
        if (normal.dot(cross) < 0) {
            angle = -angle;
        }
    }
    
    // Simulator
    this.rotationSimulator.target = angle;
    this.rotationSimulator.simulate(timeStep);
    var rot = this.rotationSimulator.position;

    // Updating values
    // console.log(rot);
    this.orientation.applyAxisAngle(normal, rot);
    this.angularVelocity = this.rotationSimulator.velocity;
    sphere3.position.copy(new THREE.Vector3().copy(this.orientation).add(player.position).multiplyScalar(1));
}

Character.prototype.setGlobalDirectionGoal = function () {
    
    var positiveX = controls.right.value ? -1 : 0;
    var negativeX = controls.left.value  ?  1 : 0;
    var positiveZ = controls.up.value    ?  1 : 0;
    var negativeZ = controls.down.value  ? -1 : 0;
    
    // If no direction is pressed, set target as current orientation
    if(positiveX == 0 && negativeX == 0 && positiveZ == 0 && negativeZ == 0) {
        this.orientationTarget = this.orientation;
    }
    else {
        var localDirection = new THREE.Vector3(positiveX + negativeX, 0, positiveZ + negativeZ);

        var vCamera = new THREE.Vector3(camera.position.x, 0, camera.position.z);
        var vPlayer = new THREE.Vector3(player.position.x, 0, player.position.z);

        var vertical = new THREE.Vector3().subVectors(vPlayer, vCamera).normalize();
        var horizontal = new THREE.Vector3(vertical.z, 0, -vertical.x).normalize();

        vertical.multiplyScalar(localDirection.z);
        horizontal.multiplyScalar(localDirection.x);

        this.orientationTarget = new THREE.Vector3().addVectors(vertical, horizontal).normalize();
    }
}

Character.prototype.rotateModel = function() {
    this.visuals.lookAt(this.orientation.x, this.visuals.position.y, this.orientation.z);
    // console.log(this.visuals);
    this.visuals.rotateX(this.acceleration * 3);
    this.visuals.rotateZ(-this.angularVelocity * 2.3);
    this.visuals.position.setY(this.visuals.position.y + Math.cos(Math.abs(this.angularVelocity * 2.3)) / 2);
}

Character.prototype.jump = function() {
    this.wantsToJump = true;
}

// Character.prototype.doJump = function() {
//     playerCapsule.physical.velocity.y += 4;
//     playerCapsule.physical.position.y += 0.02;
// }