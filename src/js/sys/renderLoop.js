var clock = new THREE.Clock();
var delta, sinceLastFrame = 0;
var justRendered = false;

/**
 * Render
 * Rendering loop with variable FPS limit.
 * Calls the "Update" function before rendering.
 */
var Render = function () {

    // Stats begin
    if (justRendered) {
        justRendered = false;
        stats.begin();
    }

    requestAnimationFrame(Render);

    // Measuring time and correcting for variable timeScale
    delta = clock.getDelta();
    var timeStep = delta * params.Time_Scale;

    // Logic
    Update(timeStep);

    // Frame limiting
    sinceLastFrame += delta + clock.getDelta();
    var interval = 1 / params.FPS_Limit;
    if (sinceLastFrame > interval) {
        sinceLastFrame %= interval;

        // Actual rendering with a FXAA ON/OFF switch
        if (params.FXAA) composer.render();
        else renderer.render(scene, camera);

        // Stats end
        stats.end();
        justRendered = true;
    }
};

//Start rendering loop
Render();