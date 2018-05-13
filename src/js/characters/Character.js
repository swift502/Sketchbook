function Character() {
    
    THREE.Object3D.call(this);

    // Default model
    var cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1, 0.5),
        new THREE.MeshLambertMaterial({ color: 0xffffff }));
    cube.position.set(0, 0.5, 0);
    cube.castShadow = true;

    // Create visuals group
    this.visuals = new THREE.Group();
    this.add(this.visuals);
    this.visuals.conteiner = new THREE.Group();
    this.visuals.conteiner.position.set(0, -0.5, 0);
    this.visuals.add(this.visuals.conteiner);
    // helper = new THREE.AxesHelper(1);
    // this.visuals.add(helper);

    // Attach model to visuals
    this.visuals.model = cube;
    this.visuals.conteiner.add(cube);

    // Animation
    this.mixer = new THREE.AnimationMixer(this.visuals);

    // Movement
    this.acceleration = 0;
    this.velocity = 0;
    this.velocityTarget = 0;
    this.velocitySimulator = new BounceSimulator(60, 80, 0.8);

    // Rotation
    this.angularVelocity = 0;
    this.orientation = new THREE.Vector3(0, 0, 1);
    this.orientationTarget = new THREE.Vector3(0, 0, 1);
    this.rotationSimulator = new RotationSimulator(60, 100, 0.9);

    // States
    this.charState = CharStates.defaultState;
};

Character.prototype = Object.create(THREE.Object3D.prototype);

Character.prototype.setModel = function(model) {
    this.visuals.conteiner.remove(this.visuals.model);

    this.visuals.model = model;
    this.visuals.conteiner.add(model);

    this.mixer = new THREE.AnimationMixer(model);

    // helper = new THREE.AxesHelper(1);
    // model.add(helper);
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
    
}

Character.prototype.setAnimation = function(clipName, fadeIn) {
    var clips = this.visuals.model.animations;
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

    // Updating values
    this.position.add(new THREE.Vector3().copy(this.orientation).multiplyScalar(this.velocity * getMoveSpeed(timeStep)));
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