function Sketchbook() {

    // Global variables
    // Characters
    this.characters = [];
    this.loader = new THREE.FBXLoader();

    // Three
    this.scene = new THREE.Scene();

    // Cannon
    this.physicsWorld = new CANNON.World();
    this.parallelPairs = [];
    this.physicsFramerate = 1/60;
    this.physicsMaxPrediction = 10;

    // RenderLoop
    this.clock = new THREE.Clock();
    this.delta = 0;
    this.sinceLastFrame = 0;
    this.justRendered = false;

    this.initInput();
    this.initThree();
    this.initCannon();
    this.initWorld();

    this.cameraControls = new CameraControls(this.camera);
    this.gameMode = new GM_FreeCameraControls(this);
    
    // GUI init
    this.ParamGUI();
}

Sketchbook.prototype.ControlCharacter = function(character) {
    this.gameMode = new GM_CharacterControls(this, character);
}

// Update
// Handles all logic updates.
Sketchbook.prototype.Update = function(timeStep) {

    this.updatePhysics(timeStep);

    this.characters.forEach(char => {
        char.behaviour.update(timeStep);
        char.updateMatrixWorld();
    });

    this.gameMode.update(timeStep);

    // Rotate and position camera according to cameraTarget and angles
    this.cameraControls.update();

    // Lerp timescale parameter
    this.params.Time_Scale = THREE.Math.lerp(this.params.Time_Scale, this.timeScaleTarget, 0.2);
}

/**
 * Render
 * Rendering loop with variable FPS limit.
 * Calls the "Update" function before rendering.
 */
Sketchbook.prototype.Render = function (sketchbook) {

    // Stats begin
    if (this.justRendered) {
        this.justRendered = false;
        this.stats.begin();
    }

    requestAnimationFrame(function() {
        sketchbook.Render(sketchbook);
    });

    // Measuring time and correcting for variable timeScale
    this.delta = this.clock.getDelta();
    var timeStep = this.delta * this.params.Time_Scale;

    // Logic
    sketchbook.Update(timeStep);

    // Frame limiting
    this.sinceLastFrame += this.delta + this.clock.getDelta();
    var interval = 1 / this.params.FPS_Limit;
    if (this.sinceLastFrame > interval) {
        this.sinceLastFrame %= interval;

        // Actual rendering with a FXAA ON/OFF switch
        if (this.params.FXAA) this.composer.render();
        else this.renderer.render(this.scene, this.camera);

        // Stats end
        this.stats.end();
        this.justRendered = true;
    }
};

Sketchbook.prototype.Start = function() {
    this.Render(this);
}