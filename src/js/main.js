// Variables
var params = {
    FPS_Limit: 30,
    Time_Scale: 1,
    Shadows: true,
    FXAA: false,
    Auto_Rotate: false,
    Spring_Debug: false,
    Draw_Capsule: false,
    RayCast_Debug: false
};

// GUI init
ParamGUI(params);

CurrentGameMode = new GM_CharacterControls(player);

// Update
// Handles all logic updates.
function Update(timeStep) {

    updatePhysics(timeStep);
    debugUpdate(timeStep);
    
    params.Time_Scale = THREE.Math.lerp(params.Time_Scale, timeScaleTarget, 0.2);

    characters.forEach(char => {
        char.behaviour.update(timeStep);
        char.updateMatrixWorld();
    });

    // Make light follow player (for shadows)
    dirLight.position.set(player.position.x + sun.x * 5, player.position.y + sun.y * 5, player.position.z + sun.z * 5);
    
    // Orbit contorls
    orbitControls.target.set(player.position.x, player.position.y + 0.6, player.position.z);
    if(params.Auto_Rotate) camera.lookAt(player.position);
    camera.position.set(player.position.x, player.position.y + 0.6, player.position.z);
    camera.translateZ(2);
    if(params.Auto_Rotate) camera.position.setComponent(1, 1);
    orbitControls.update();
}