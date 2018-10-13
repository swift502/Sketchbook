<p align="center">
   <a href="https://swift502.github.io/Sketchbook"><img src="https://i.imgur.com/5J4OaUm.png"></a>
   <br>
   Play it here! <a href="https://swift502.github.io/Sketchbook">swift502.github.io/Sketchbook</a>
</p>


# Sketchbook

Package providing a pre-made configuration of 3D rendering and physics in a web-browser, along with a collection 3D models and gameplay mechanics.

Built on [three.js](https://github.com/mrdoob/three.js) and [cannon.js](https://github.com/schteppe/cannon.js).

## Features

* World
    * Three.js scene
    * Cannon.js physics
    * Variable, FPS independent time scale
    * FXAA anti-aliasing
    * Custom damped-spring simulation
* Characters
    * Third-person camera
    * Raycast character controller with capsule collisions
    * Flexible state based animation system
    * Character AI

#### Not yet implemented

* Vehicles
    * Cars
    * Airplanes
    * Helicopters
* Characters
    * Ragdoll physics
    * Navmesh pathfinding


## Example code

```javascript
// Initialize sketchbook
let world = new Sketchbook.World();

// Load world geometry
world.LoadDefaultWorld();

// Spawn Player and take control of him
let player = world.SpawnCharacter();
player.Control();

// Spawn Bob and make him follow player
let bob = world.SpawnCharacter();
bob.setBehaviour(new Sketchbook.CharacterAI.FollowCharacter(bob, player));
```

