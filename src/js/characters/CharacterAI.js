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

    this.character.viewVector = new THREE.Vector3().subVectors(this.character.position, camera.position);
    this.character.charState.update(timeStep);
}

function FollowPlayerAI(character) {
    this.character = character;
}

FollowPlayerAI.prototype.update = function(timeStep) {
    // var vCharacter = new THREE.Vector3(this.character.position.x, 0, this.character.position.z);
    // var vPlayer = new THREE.Vector3(player.position.x, 0, player.position.z);

     var viewVector = new THREE.Vector3().subVectors(player.position, this.character.position);
     this.character.setViewVector(viewVector);

     var rndInt = Math.floor(Math.random() * 300);

    if(viewVector.length() > 2) {
        this.character.controls.up.value = true;

        if(rndInt == 0) {
            this.character.setState(CharStates.JumpRunning);
        }
    }
    else {
        this.character.controls.up.value = false;

        
        if(rndInt == 0) {
            this.character.setOrientationTarget(this.character.viewVector);
        }
        else if(rndInt == 1 || rndInt == 2) {
            this.character.setOrientationTarget(new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5));
            // console.log(this.character.orientationTarget);
        }
        else if(rndInt == 3) {
            this.character.setState(CharStates.JumpIdle);
        }
        // console.log()
    }

    this.character.charState.update(timeStep);
    this.character.charState.changeState();
}