
Sketchbook.prototype.AddCharacter = function(character) {

    // Register character
    this.characters.push(character);

    // Register physics
    this.physicsWorld.addBody(character.characterCapsule.physical);

    // Register capsule visuals
    this.scene.add(character.characterCapsule.visual);

    // Register for synchronization
    this.parallelPairs.push(character.characterCapsule);

    // Add to scene
    this.scene.add(character);
}