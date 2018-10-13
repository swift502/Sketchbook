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
    constructor(targetCharacter, stopDistance = 1.3) {
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
    constructor(randomFrequency = 100) {
        this.randomFrequency = randomFrequency;
    }

    update(timeStep) {
    
        let rndInt = Math.floor(Math.random() * this.randomFrequency);
        let rndBool = Math.random() > 0.5 ? true : false;

        if(rndInt == 0) {
            this.character.setViewVector(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5));
            // this.character.setOrientationTarget(this.character.viewVector);

            this.character.setControl('up', true);
            this.character.charState.update(timeStep);
            this.character.setControl('up', false);
        }
        else if(rndInt == 1) {
            this.character.setControl('up', rndBool);
        }
        else if(rndInt == 2) {
            this.character.setControl('run', rndBool);
        }
        else if(rndInt == 3) {
            this.character.setControl('jump', rndBool);
        }
    
        this.character.charState.update(timeStep);
    }
}

export let CharacterAI = {
    Default: Default,
    FollowCharacter: FollowCharacter,
    Random: Random
};