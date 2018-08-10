function DefaultAI(character) {
    this.character = character;
}

DefaultAI.prototype.update = function(timeStep) {
    this.character.charState.update(timeStep);
}

function FollowPlayerAI(character) {
    this.character = character;
}

FollowPlayerAI.prototype.update = function(timeStep) {
    
     var viewVector = new THREE.Vector3().subVectors(this.character.sketchbook.player.position, this.character.position);
     this.character.setViewVector(viewVector);

     var rndInt = Math.floor(Math.random() * 100);

     // Follow character
    if(viewVector.length() > 2) {
        this.character.controls.up.value = true;
    }
    //Stand still
    else {
        this.character.controls.up.value = false;
        
        if(rndInt == 0) {
            // Look at character
            this.character.setOrientationTarget(this.character.viewVector);
        }
        else if(rndInt == 1) {
            // Look in random direction
            this.character.setOrientationTarget(new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5));
        }
    }

    this.character.charState.update(timeStep);
    this.character.charState.changeState();
}