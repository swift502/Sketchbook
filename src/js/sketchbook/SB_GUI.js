/**
 * ParamGUI
 * Initialize user-editable global variables.
 */
Sketchbook.prototype.paramGUI = function() {

    var scope = this;

    // Variables
    var params = {
        FPS_Limit: 60,
        Time_Scale: 1,
        Shadows: true,
        FXAA: false,
        Draw_Capsules: false,
        RayCast_Debug: false
    };
    this.params = params;

    var gui = new dat.GUI();
    var graphics_folder = gui.addFolder('Rendering');
    graphics_folder.add(params, 'FPS_Limit', 0, 60);
    var timeController = graphics_folder.add(params, 'Time_Scale', 0, 1).listen();
    var shadowSwitch = graphics_folder.add(params, 'Shadows');
    graphics_folder.add(params, 'FXAA');

    var debug_folder = gui.addFolder('Debug');
    var dc = debug_folder.add(params, 'Draw_Capsules');
    var rcd = debug_folder.add(params, 'RayCast_Debug');

    gui.open();
    
    timeController.onChange(function(value) {
        timeScaleTarget = value;
    });

    dc.onChange(function(enabled) {
        scope.characters.forEach(char => {
            if(enabled) char.characterCapsule.visual.visible = true;
            else        char.characterCapsule.visual.visible = false;
        });
    });

    rcd.onChange(function(enabled) {
        scope.characters.forEach(char => {
            if(enabled) char.raycastBox.visible = true;
            else        char.raycastBox.visible = false;
        });
    });

    shadowSwitch.onChange(function(enabled) {
        if(enabled) {
            scope.dirLight.castShadow = true;
        }
        else {
            scope.dirLight.castShadow = false;
        }
    });
}