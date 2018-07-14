//
// Default state
//
function CS_DefaultState(character) {
    this.character = character;
}
CS_DefaultState.prototype.update = function(timeStep) {}
CS_DefaultState.prototype.changeState = function() {}

//
// Idle
//
function CS_Idle(character) {
    CS_DefaultState.call(this, character);

    this.character.setAnimation('idle', 0.3);
    this.character.orientationTarget = this.character.orientation;
}
CS_Idle.prototype = Object.create(CS_DefaultState.prototype);
CS_Idle.prototype.update = function(timeStep) {
    this.character.velocityTarget = 0;
    this.character.update(timeStep);
}
CS_Idle.prototype.changeState = function() {
    if(controls.lastControl == controls.jump && controls.lastControl.justPressed) {
        this.character.jump();
    }

    if(controls.lastControl.isDirection()) {
        this.character.setState(new CS_Start(this.character));
    }
}

//
// Walk
//
function CS_Walk(character) {
    CS_DefaultState.call(this, character);

    this.character.setAnimation('run', 0.1);
    this.character.velocitySimulator.mass = 50;

    if(noDirection()) {
        this.character.setState(new CS_End(this.character));
    }
}
CS_Walk.prototype = Object.create(CS_DefaultState.prototype);
CS_Walk.prototype.update = function(timeStep) {
    this.character.orientationTarget = getMoveDirections();
    // character.setOrientationTarget(getMoveDirections());
    this.character.velocityTarget = 0.8;
    this.character.update(timeStep);
}
CS_Walk.prototype.changeState = function() {
    if(controls.lastControl == controls.jump && controls.lastControl.justPressed) {
        this.character.jump();
    }

    if(noDirection()) {
        this.character.setState(new CS_End(this.character));
    }
}

//
// Start
//
function CS_Start(character) {
    CS_DefaultState.call(this, character);

    var duration = character.setAnimation('start_forward', 0.1);
    this.time = duration;
    this.timer = 0;
    this.character.velocitySimulator.mass = 30;
}
CS_Start.prototype = Object.create(CS_DefaultState.prototype);
CS_Start.prototype.update = function(timeStep) {
    this.timer += timeStep;
    if(this.timer > this.time - timeStep) this.character.setState(new CS_Walk(this.character));

    this.character.setOrientationTarget(getMoveDirections());
    this.character.velocityTarget = 0.8;

    this.character.update(timeStep);
}
CS_Start.prototype.changeState = function() {
    if(controls.lastControl == controls.jump && controls.lastControl.justPressed) {
        this.character.jump();
    }

    if(noDirection()) {
        this.character.setState(new CS_End(this.character));
    }
}

//
// End
//
function CS_End(character) {
    CS_DefaultState.call(this, character);

    var duration = character.setAnimation('stop', 0.1);
    this.time = duration;
    this.timer = 0;
    this.character.orientationTarget = character.orientation;
    this.character.velocitySimulator.mass = 50;
}
CS_End.prototype = Object.create(CS_DefaultState.prototype);
CS_End.prototype.update = function(timeStep) {
    this.timer += timeStep;
    if(this.timer > this.time - timeStep) this.character.setState(new CS_Idle(this.character));
    
    this.character.velocityTarget = 0;

    this.character.update(timeStep);
}
CS_End.prototype.changeState = function() {
    if(controls.lastControl == controls.jump && controls.lastControl.justPressed) {
        this.character.jump();
    }

    if(anyDirection()) {
        this.character.setState(new CS_Start(this.character));
    }
}

function getMoveDirections() {
    
    var positiveX = controls.right.value ? -1 : 0;
    var negativeX = controls.left.value  ?  1 : 0;
    var positiveZ = controls.up.value    ?  1 : 0;
    var negativeZ = controls.down.value  ? -1 : 0;
    
    var localDirection = new THREE.Vector3(positiveX + negativeX, 0, positiveZ + negativeZ);

    var vCamera = new THREE.Vector3(camera.position.x, 0, camera.position.z);
    var vPlayer = new THREE.Vector3(player.position.x, 0, player.position.z);

    var vertical = new THREE.Vector3().subVectors(vPlayer, vCamera).normalize();
    var horizontal = new THREE.Vector3(vertical.z, 0, -vertical.x).normalize();

    vertical.multiplyScalar(localDirection.z);
    horizontal.multiplyScalar(localDirection.x);
    var worldDirection = new THREE.Vector3().addVectors(vertical, horizontal).normalize();;
    return worldDirection;
}

function noDirection() {
    return !controls.up.value && !controls.down.value && !controls.left.value && !controls.right.value;
}

function anyDirection() {
    return controls.up.value || controls.down.value || controls.left.value || controls.right.value;
}

function getDefaultState() {
    return Object.assign({}, CharStates.defaultState);
}