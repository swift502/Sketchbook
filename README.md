<p align="center">
    <a href="http://jblaha.art"><img src="https://i.imgur.com/Y5YLgWR.png"></a>
    <br>
    Play it <a href="http://jblaha.art">here</a>!
    <br>
</p>

[![badge](https://img.shields.io/npm/v/sketchbook?style=flat-square)](https://www.npmjs.com/package/sketchbook)
[![badge](https://img.shields.io/travis/swift502/sketchbook?style=flat-square)](https://travis-ci.org/swift502/Sketchbook)
[![badge](https://img.shields.io/discord/730763393325334628?label=discord&logo=discord&style=flat-square)](https://discord.gg/kRjrd4b)


# Sketchbook

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
* Vehicles
    * Cars
    * Airplanes
    * Helicopters

All planned features can be found in the [GitHub Projects](https://github.com/swift502/Sketchbook/projects).

## Usage

Sketchbook is packed as a library and can be used to create your own 3D scenes exposing all the Sketchbook gameplay mechanics.
Check out the [Sketch](https://github.com/swift502/Sketch) template project to learn about using Sketchbook in this way.

## Contributing

1. Get latest [Node.js](https://nodejs.org/en/)
2. [Fork this repository](https://help.github.com/en/github/getting-started-with-github/fork-a-repo)
3. Run `npm install`
4. Run `npm run dev`
5. Make changes and test them out at http://localhost:8080
6. Run `npm run build`
7. Commit and [make a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork)!

Big thank you to each of the following github users for contributing to Sketchbook:

- [aleqsunder](https://github.com/aleqsunder)
- [danshuri](https://github.com/danshuri)
