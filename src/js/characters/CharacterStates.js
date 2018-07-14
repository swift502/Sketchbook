var CharStates = {}

CharStates.defaultState = {
    init: function(character) {},
    update: function(character, timeStep) {},
    changeState: function(character) {}
}

//
// IDLE
//
CharStates.Idle = getDefaultState();
CharStates.Idle.init = function(character) {

    character.setAnimation('idle', 0.3);
    character.orientationTarget = character.orientation;
}
CharStates.Idle.update = function(character, timeStep) {

    character.velocityTarget = 0;
    character.update(timeStep);
}
CharStates.Idle.changeState = function(character) {

    if(controls.lastControl == controls.jump && controls.lastControl.justPressed) {
        character.jump();
    }

    if(controls.lastControl.isDirection()) {
        character.setState(CharStates.Start);
    }
}

//
// WALK
//
CharStates.Walk = getDefaultState();
CharStates.Walk.init = function(character) {

    character.setAnimation('run', 0.1);
    character.velocitySimulator.mass = 50;

    if(noDirection()) {
        character.setState(CharStates.End);
    }
}
CharStates.Walk.update = function(character, timeStep) {

    character.orientationTarget = getMoveDirections();
    // character.setOrientationTarget(getMoveDirections());
    character.velocityTarget = 0.8;
    character.update(timeStep);
}
CharStates.Walk.changeState = function(character) {

    if(controls.lastControl == controls.jump && controls.lastControl.justPressed) {
        character.jump();
    }

    if(noDirection()) {
        character.setState(CharStates.End);
    }
}

//
// START
//
CharStates.Start = getDefaultState();
CharStates.Start.init = function(character) {

    var duration = character.setAnimation('start_forward', 0.1);
    CharStates.Start.time = duration;
    CharStates.Start.timer = 0;
    character.velocitySimulator.mass = 30;
}
CharStates.Start.update = function(character, timeStep) {

    CharStates.Start.timer += timeStep;
    if(CharStates.Start.timer > CharStates.Start.time - timeStep) character.setState(CharStates.Walk);

    character.setOrientationTarget(getMoveDirections());
    character.velocityTarget = 0.8;

    character.update(timeStep);
}
CharStates.Start.changeState = function(character) {
    if(controls.lastControl == controls.jump && controls.lastControl.justPressed) {
        character.jump();
    }

    if(noDirection()) {
        character.setState(CharStates.End);
    }
}

//
// END
//
CharStates.End = getDefaultState();
CharStates.End.init = function(character) {

    var duration = character.setAnimation('stop', 0.1);
    CharStates.End.time = duration;
    CharStates.End.timer = 0;
    character.orientationTarget = character.orientation;
    character.velocitySimulator.mass = 50;
}
CharStates.End.update = function(character, timeStep) {

    CharStates.End.timer += timeStep;
    if(CharStates.End.timer > CharStates.End.time - timeStep) character.setState(CharStates.Idle);
    
    character.velocityTarget = 0;

    character.update(timeStep);
}
CharStates.End.changeState = function(character) {

    if(controls.lastControl == controls.jump && controls.lastControl.justPressed) {
        character.jump();
    }

    if(anyDirection()) {
        character.setState(CharStates.Start);
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