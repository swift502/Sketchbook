function DefaultAI(character) {
    this.character = character;
}

DefaultAI.prototype.update = function(timeStep) {
    this.character.charState.update(timeStep);
}

function PlayerAI(character) {
    this.character = character;
}

PlayerAI.prototype.update = function(timeStep) {

    var vCamera = new THREE.Vector3(camera.position.x, 0, camera.position.z);
    var vPlayer = new THREE.Vector3(this.character.position.x, 0, this.character.position.z);

    this.character.viewVector = new THREE.Vector3().subVectors(vPlayer, vCamera).normalize();
    this.character.charState.update(timeStep);
}

function FollowPlayerAI(character) {
    this.character = character;
}

FollowPlayerAI.prototype.update = function(timeStep) {
    var vCharacter = new THREE.Vector3(this.character.position.x, 0, this.character.position.z);
    var vPlayer = new THREE.Vector3(player.position.x, 0, player.position.z);

    this.character.viewVector = new THREE.Vector3().subVectors(vPlayer, vCharacter).normalize();

    if(new THREE.Vector3().subVectors(vPlayer, vCharacter).length() > 2) this.character.controls.up.value = true;
    else this.character.controls.up.value = false;

    this.character.charState.update(timeStep);
    this.character.charState.changeState();
}