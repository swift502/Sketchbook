// Initialize sketchbook
let world = new Sketchbook.World();

// Load world geometry
world.LoadDefaultWorld();

// Spawn player
let player = world.SpawnCharacter();
player.Control();

// Spawn a friend
let bob = world.SpawnCharacter();
bob.setBehaviour(new Sketchbook.CharacterAI.FollowCharacter(player));

let john = world.SpawnCharacter();
john.setBehaviour(new Sketchbook.CharacterAI.Random());