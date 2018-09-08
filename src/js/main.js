console.log(getGlobalProperties());

// Initialize sketchbook
var sketchbook = new World();

// Player
var player = new Character();
player.setPosition(0, 1, 2);
sketchbook.AddCharacter(player);
sketchbook.ControlCharacter(player);

// Bobs

var bob = new Character();
bob.setPosition(2, 1, 2);
bob.setBehaviour(new CharacterAI_FollowCharacter(bob, player));
sketchbook.AddCharacter(bob);


// for(i = 0; i < 3; i++) {
//     var bobik = new Character();
//     bobik.setPosition(new CANNON.Vec3(2, 1, 0));
//     bobik.setBehaviour(new CharacterAI_Random(bobik));
//     sketchbook.AddCharacter(bobik);
// }

// Start rendering loop
sketchbook.Start();