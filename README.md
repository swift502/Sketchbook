<p align="center">
   <a href="http://jblaha.art"><img src="https://i.imgur.com/5J4OaUm.png"></a>
   <br>
   Play it <a href="http://jblaha.art">here</a>!
</p>


# Sketchbook

Package providing a pre-made configuration of 3D rendering and physics in a web-browser featuring several conventional game mechanics and basic 3D models.

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

*All planned features can be found in the [project pages](https://github.com/swift502/Sketchbook/projects)*.


## Usage

Simply import the library in your project, along with provided build of cannon.js and a three.js version of your choice, and you're ready to go.
```html
<script src="three.min.js"></script>
<script src="cannon.min.js"></script> <!-- Only use provided build, official package is extremely outdated! -->
<script src="sketchbook.min.js"></script>
```
Check out the [examples](https://github.com/swift502/Sketchbook/tree/master/examples) to learn specifics about using Sketchbook.