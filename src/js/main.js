// Initialize sketchbook
var sketchbook = new Sketchbook();

// Player
var player = new Character(sketchbook, new CANNON.Vec3(2, 1, 2));
sketchbook.AddCharacter(player);
sketchbook.ControlCharacter(player);

// Start rendering loop
sketchbook.Start();