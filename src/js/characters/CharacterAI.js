import * as THREE from 'three';

class Default {
    constructor(character) {
        this.character = character;
    }

    update(timeStep) {
        this.character.charState.update(timeStep);
    }
}

class FollowCharacter {
    constructor(character, targetCharacter, stopDistance = 2) {
        this.character = character;
        this.targetCharacter = targetCharacter;
        this.stopDistance = stopDistance;
    }

    update(timeStep) {

        let viewVector = new THREE.Vector3().subVectors(this.targetCharacter.position, this.character.position);
        this.character.setViewVector(viewVector);

        // Follow character
        if (viewVector.length() > this.stopDistance) {
            if (!this.character.controls.up.value) this.character.setControl('up', true);
        }
        //Stand still
        else {
            if (this.character.controls.up.value) this.character.setControl('up', false);

            // Look at character
            this.character.setOrientationTarget(viewVector);
        }

        this.character.charState.update(timeStep);
    }
}

class Random {
    constructor(character, randomFrequency = 100) {
        this.character = character;
        this.randomFrequency = randomFrequency;
    }

    update(timeStep) {
    
        let rndInt = Math.floor(Math.random() * this.randomFrequency);
    
        if(rndInt == 0) {
            this.character.setViewVector(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5));
            this.character.setOrientationTarget(this.character.viewVector);
        }
    
        if(rndInt == 1) {
            let rndBool = Math.random() > 0.5 ? true : false;
            this.character.setControl('up', rndBool);
            this.character.setControl('run',rndBool);
        }
    
        this.character.charState.update(timeStep);
    }
}

export let CharacterAI = {
    Default: Default,
    FollowCharacter: FollowCharacter,
    Random: Random
};