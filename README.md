<p align="center">
   <a href="http://jblaha.art"><img src="https://i.imgur.com/qW7OuED.png"></a>
   <br>
   Play it <a href="http://jblaha.art">here</a>!
</p>


# Sketchbook

Simple third-person game engine built on [three.js](https://github.com/mrdoob/three.js) and [cannon.js](https://github.com/schteppe/cannon.js). Mostly it's just my little playground focused on exploring how conventional third person gameplay mechanics found in modern games work and recreating them in a general way.

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

All planned features can be found in [projects](https://github.com/swift502/Sketchbook/projects).

## Installation

Use NPM:
```shell
npm install sketchbook --save
```
```js
import * as Sketchbook from 'sketchbook'
```

Or download the [latest release](https://github.com/swift502/Sketchbook/releases) and import directly:
```html
<script src="sketchbook.min.js"></script>
```

## Usage

This snippet turns a blank page into a playable character demo.

```js
// Initialize rendering and a canvas element
const world = new Sketchbook.World();

// Create player
let player = new Sketchbook.Character();
world.add(player);
player.takeControl();
```

More complex examples are found in the [Sketches](https://github.com/swift502/Sketches) repository.

## Contributing

I appreciate all help, be it suggestions, issues or even pull requests.

1. Clone the repository
2. Switch to the `dev` branch
3. Run `npm install`
4. Stick to existing code style
5. Contribute!

Use the npm scripts defined in `package.json` to test your changes:
* `npm run devserver` - start a local server
* `npm run watch` - build in dev mode and watch changes
* `npm run build` - build in production mode 

