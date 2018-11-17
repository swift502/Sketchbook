<p align="center">
   <a href="http://jblaha.art"><img src="https://i.imgur.com/VM9yu68.png"></a>
   <br>
   Play it <a href="http://jblaha.art">here</a>!
</p>


# Sketchbook

3D rendering and physics library for game projects on the web, featuring a few conventional gameplay mechanics and basic 3D models.

Built on [three.js](https://github.com/mrdoob/three.js) and [cannon.js](https://github.com/schteppe/cannon.js).

## Features

* World
    * Three.js scene
    * Cannon.js physics
    * Variable timescale
    * Frame skipping
    * FXAA anti-aliasing
    * Custom damped-spring simulation
* Characters
    * Third-person camera
    * Raycast character controller with capsule collisions
    * General state system
    * Character AI

#### Not yet implemented

* Vehicles
    * Cars
    * Airplanes
    * Helicopters

*All planned features can be found in the [project pages](https://github.com/swift502/Sketchbook/projects)*.


## Usage

This creates a fullscreen canvas, initializes the physics and rendering, adds a character and lets you control him.

```js
let world = new Sketchbook.World();

let player = new Sketchbook.Character({
    position: new THREE.Vector3(1.13, 3, -2.2),
});
LoadCharacterModel(player);
world.add(player);
player.takeControl();
```

Check out the [examples](https://github.com/swift502/Sketchbook/tree/master/examples) to learn specifics about using Sketchbook.

## Installation

Simply import the library in your project, along with provided build of cannon.js and a three.js version of your choice, and you're ready to go.
```html
<script src="three.min.js"></script>
<script src="cannon.min.js"></script> <!-- Only use provided build, official package is extremely outdated! -->
<script src="sketchbook.min.js"></script>
```