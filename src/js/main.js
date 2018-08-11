// Initialize sketchbook
var sketchbook = new Sketchbook();

// Player
var player = new Character();
player.setPosition(new CANNON.Vec3(-2, 1, 0));
sketchbook.AddCharacter(player);
sketchbook.ControlCharacter(player);

// Bobs
for(i = 0; i < 0; i++) {
    var bob = new Character();
    bob.setPosition(new CANNON.Vec3(2, 1, 0));
    sketchbook.AddCharacter(bob);
}

// Start rendering loop
sketchbook.Start();