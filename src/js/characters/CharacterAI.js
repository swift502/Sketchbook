function CharacterAI_Default(character) {
    this.character = character;
}

CharacterAI_Default.prototype.update = function(timeStep) {
    this.character.charState.update(timeStep);
}

function CharacterAI_FollowCharacter(character, targetCharacter, stopDistance = 2) {
    this.character = character;
    this.targetCharacter = targetCharacter;
    this.stopDistance = stopDistance;
}

CharacterAI_FollowCharacter.prototype.update = function(timeStep) {
    
     var viewVector = new THREE.Vector3().subVectors(this.targetCharacter.position, this.character.position);
     this.character.setViewVector(viewVector);

     // Follow character
    if(viewVector.length() > this.stopDistance) {
        if(!this.character.controls.up.value) this.character.setControl('up', true);
    }
    //Stand still
    else {
        if(this.character.controls.up.value) this.character.setControl('up', false);
        
        // Look at character
        this.character.setOrientationTarget(viewVector);
    }

    this.character.charState.update(timeStep);
}

function CharacterAI_Random(character, randomFrequency = 100) {
    this.character = character;
    this.randomFrequency = randomFrequency;
}

CharacterAI_Random.prototype.update = function(timeStep) {
    
    var rndInt = Math.floor(Math.random() * this.randomFrequency);

    if(rndInt == 0) {
        this.character.setViewVector(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5));
        this.character.setOrientationTarget(this.character.viewVector);
    }

    if(rndInt == 1) {
        var rndBool = Math.random() > 0.5 ? true : false;
        this.character.setControl('up', rndBool);
        this.character.setControl('run',rndBool);
        this.character.setControl('jump',rndBool);
        // this.character.setControl('use',rndBool);
        // this.character.setControl('primary',rndBool);
        // this.character.setControl('secondary',rndBool);
        // this.character.setControl('tertiary', rndBool);
    }

    this.character.charState.update(timeStep);
}

export {
    CharacterAI_Default,
    CharacterAI_FollowCharacter,
    CharacterAI_Random
};