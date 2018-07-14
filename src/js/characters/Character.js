
//Character class
//The visual hierarchy goes:
//  this->visuals->modelContainer->characterModel
function Character() {
    
    THREE.Object3D.call(this);

    // Geometry
    this.height = 1;

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
    this.velocitySimulator = new BounceSimulator(60, 80, 0.8);
    this.moveSpeed = 4;

    // Rotation
    this.angularVelocity = 0;
    this.orientation = new THREE.Vector3(0, 0, 1);
    this.orientationTarget = new THREE.Vector3(0, 0, 1);
    this.rotationSimulator = new RotationSimulator(60, 10, 0.5);

    // States
    this.charState = CharStates.defaultState;

    // Physics
    // Player Capsule
    var playerMass = 1;
    var playerHeight = 0.5;
    var playerRadius = 0.25;
    var playerSegments = 12;
    var playerFriction = 0;
    var playerCollisionGroup = 2;
    this.characterCapsule = addParallelCapsule(playerMass, new CANNON.Vec3(1, 1, 1), playerHeight, playerRadius, playerSegments, playerFriction);

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
    this.rayCastLength = 0.6;
    this.wantToJump = false;
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
        if(this.character.wantToJump && this.character.rayHasHit) {
            this.character.characterCapsule.physical.velocity.y += 4;
            this.character.wantToJump = false;
            this.character.justJumped = true;
        }
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
                this.position.y = this.character.rayResult.hitPointWorld.y + this.character.rayCastLength;
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

    // helper = new THREE.AxesHelper(1);
    // this.visuals.add(helper);
}

Character.prototype.setModelOffset = function(offset) {
    this.visuals.position.copy(offset);
}

Character.prototype.setState = function(state) {
    this.charState = state;
    state.init(this);
}

Character.prototype.setOrientationTarget = function(vector) {
    if(vector.x != 0 || vector.y != 0 || vector.z != 0) {
        this.orientationTarget = vector;
    }
    // else {
    //     this.setState(CharStates.End);
    // }
}

Character.prototype.update = function(timeStep, parameters) {

    //Default values
    if(parameters == undefined) parameters = {};
    if(parameters.bounceRotation == undefined) parameters.bounceRotation = true;
    if(parameters.bounceVelocity == undefined) parameters.bounceVelocity = true;
    if(parameters.rotateModel == undefined) parameters.rotateModel = true;
    if(parameters.updateAnimation == undefined) parameters.updateAnimation = true;

    if(parameters.bounceRotation)  this.bounceMovement(timeStep);
    if(parameters.bounceVelocity)  this.bounceRotation(timeStep);
    if(parameters.rotateModel)     this.rotateModel();
    if(parameters.updateAnimation) this.mixer.update(timeStep);
    
    this.position.set(this.characterCapsule.physical.interpolatedPosition.x,
        this.characterCapsule.physical.interpolatedPosition.y - 0.5,
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

Character.prototype.bounceMovement = function(timeStep) {

    // Simulator
    this.velocitySimulator.target = this.velocityTarget;
    this.velocitySimulator.simulate(timeStep);
    this.velocity = this.velocitySimulator.position;

    this.acceleration = this.velocitySimulator.velocity;
}

Character.prototype.bounceRotation = function(timeStep) {

    //Bounce rotation
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

Character.prototype.rotateModel = function() {
    this.visuals.lookAt(this.orientation.x, this.visuals.position.y, this.orientation.z);
    // console.log(this.visuals);
    this.visuals.rotateX(this.acceleration * 3);
    this.visuals.rotateZ(-this.angularVelocity * 2.3);
    this.visuals.position.setY(Math.cos(Math.abs(this.angularVelocity * 2.3)) / 2);
}

Character.prototype.jump = function() {
    this.wantToJump = true;
}

// Character.prototype.doJump = function() {
//     playerCapsule.physical.velocity.y += 4;
//     playerCapsule.physical.position.y += 0.02;
// }