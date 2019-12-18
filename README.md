<p align="center">
   <a href="http://jblaha.art"><img src="https://i.imgur.com/VM9yu68.png"></a>
   <br>
   <a href="http://jblaha.art"><img src="https://img.shields.io/badge/-Launch%20demo-brightgreen?color=2eb800&style=flat-square&logoWidth=10&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8%2BPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgdmlld0JveD0iMTAyLjk5OTk5OTk5OTk5OTk3IDc5LjQ5MTY4NTA5MzIwNTEgNDMyIDQ4NC4yMjUyOTk3MjQ2NDM1IiB3aWR0aD0iNDI4IiBoZWlnaHQ9IjQ4MC4yMyI%2BPGRlZnM%2BPHBhdGggZD0iTTEwNCAxMzZDMTA0IDkzLjMzIDE0OS4zMyA2Ni42NyAxODQgODhDMjE2IDEwNi40IDQ3MiAyNTMuNiA1MDQgMjcyQzU0MS4zMyAyOTMuMzMgNTQxLjMzIDM0OS4zMyA1MDQgMzcwLjY3QzQ3MiAzODkuMDcgMjE2IDUzNi4yNyAxODQgNTU0LjY3QzE0OS4zMyA1NzMuMzMgMTA0IDU0Ni42NyAxMDQgNTA0QzEwNCA0MzAuNCAxMDQgMTcyLjggMTA0IDEzNloiIGlkPSJhVFZpVGFSY0MiPjwvcGF0aD48L2RlZnM%2BPGc%2BPGc%2BPHVzZSB4bGluazpocmVmPSIjYVRWaVRhUmNDIiBvcGFjaXR5PSIxIiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjEiPjwvdXNlPjxnPjx1c2UgeGxpbms6aHJlZj0iI2FUVmlUYVJjQyIgb3BhY2l0eT0iMSIgZmlsbC1vcGFjaXR5PSIwIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAiPjwvdXNlPjwvZz48L2c%2BPC9nPjwvc3ZnPg%3D%3D"></a>
   <a href="https://www.npmjs.com/package/sketchbook"><img src="https://img.shields.io/npm/v/sketchbook?style=flat-square"></a>
   <a href="https://travis-ci.org/swift502/Sketchbook"><img src="https://img.shields.io/travis/swift502/sketchbook?style=flat-square"></a>
</p>

# :ledger: Sketchbook

Simple web based game engine built on [three.js](https://github.com/mrdoob/three.js) and [cannon.js](https://github.com/schteppe/cannon.js) focused on third-person character controls and related gameplay mechanics.

Mostly a playground for exploring how conventional third person gameplay mechanics found in modern games work and recreating them in a general way.


## Features

* World
    * Three.js scene
    * Cannon.js physics
    * Variable timescale
    * Frame skipping
    * FXAA anti-aliasing
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

All planned features can be found in the [GitHub Projects](https://github.com/swift502/Sketchbook/projects).

## Installation

Use NPM:
```shell
npm install sketchbook --save
```
```js
import * as Sketchbook from 'sketchbook'
```

Or download the [latest release](https://github.com/swift502/Sketchbook/releases) and import via the script tag:
```html
<script src="sketchbook.min.js"></script>
```

<!-- ## Usage

This snippet turns a blank page into a playable character demo.

```js
const world = new Sketchbook.World();
world.loadBasicLevel();

let player = new Sketchbook.Character();
world.add(player);
player.takeControl();
``` -->

To learn specifics about using Sketchbook, check out the [examples](https://github.com/swift502/Sketchbook/tree/master/examples).

## Contributing

I appreciate all help, be it suggestions, issues or even pull requests.

1. Clone the repository
3. Run `npm install`
4. Contribute!

Use the npm scripts defined in `package.json`:
* `npm run dev` - start a local server, build in dev mode and watch changes
* `npm run build` - build in production mode and generate type decleration files

