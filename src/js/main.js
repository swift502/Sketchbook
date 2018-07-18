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

bV = new SpringVSimulator(60, 20, 0.98);
bV.target = player.position;

bvx = new SpringSimulator(60, 30, 0.98);
bvz = new SpringSimulator(60, 30, 0.98);

// Update
// Handles all logic updates.
function Update(timeStep) {

    //SpringV debug
    bV.simulate(timeStep);
    sphere2.position.copy(bV.position);

    //Spring debug
    bvx.target = player.position.x;
    bvz.target = player.position.z;
    bvx.simulate(timeStep);
    bvz.simulate(timeStep);
    sphere.position.set(bvx.position, 0, bvz.position);

    updatePhysics(timeStep);
    
    params.Time_Scale = THREE.Math.lerp(params.Time_Scale, timeScaleTarget, 0.2);

    characters.forEach(char => {
        // char.charState.update(timeStep);
        char.behaviour.update(timeStep);
        char.updateMatrixWorld();
    });

    dirLight.position.set(player.position.x + sun.x * 5, player.position.y + sun.y * 5, player.position.z + sun.z * 5);

    orbitControls.target.set(player.position.x, player.position.y + 0.6, player.position.z);
    
    if(params.Auto_Rotate) camera.lookAt(player.position);
    camera.position.set(player.position.x, player.position.y + 0.6, player.position.z);
    camera.translateZ(2);
    if(params.Auto_Rotate) camera.position.setComponent(1, 1);
    
    orbitControls.update();
}