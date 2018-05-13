// Keymap
var keymap = {
    'w':      { action: 'up'       },
    's':      { action: 'down'     },
    'a':      { action: 'left'     },
    'd':      { action: 'right'    },
    ' ':      { action: 'jump'     },
    'e':      { action: 'use'      },
    'mouse0': { action: 'primary'  },
    'mouse2': { action: 'secondary'},
    'mouse1': { action: 'tertiary' }
}

// Generic control class
function Control() {
    this.value = false;
    this.justPressed = false;
    this.justReleased = false;
}

Control.prototype.isDirection = function() {
    if( this == controls.up ||
        this == controls.down ||
        this == controls.left ||
        this == controls.right) {
            return true;
        }
    else {
        return false;
    }
}

// Controls
var controls = {
    up:        new Control(),
    down:      new Control(),
    left:      new Control(),
    right:     new Control(),
    run:       new Control(),
    jump:      new Control(),
    use:       new Control(),
    primary:   new Control(),
    secondary: new Control(),
    tertiary:  new Control(),
    lastControl: new Control()
}

// Event listeners
document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);
document.addEventListener("mousedown", mouseDown, false);
document.addEventListener("mouseup", mouseUp, false);
document.addEventListener("wheel", mouseWheel, false);

// Event handlers
function keyDown(event) {

    // event.preventDefault();

    // Special input cases
    if(event.key == 'c') cameraCycle();
    else if(event.key == 'r') controls.run.value = !controls.run.value;
    else {
        // Update controls
        handleKey(event, event.key, true);
    }
}
function keyUp(event) {
    
    handleKey(event, event.key, false);
}
function mouseDown(event) {
    
    handleKey(event, 'mouse' + event.button, true);
}
function mouseUp(event) {
    handleKey(event, 'mouse' + event.button, false);
}

/**
 * Handles game actions based on supplied inputs.
 * @param {*} event Keyboard or mouse event
 * @param {char} key Key or button pressed
 * @param {boolean} value Value to be assigned to action
 */
function handleKey(event, key, value) {

    // Shift modifier fix
    key = key.toLowerCase();

    // Is key bound to action
    if (key in keymap) {

        // Get action and set it's parameters
        var action = controls[keymap[key].action];
        action.value = value;

        // Set the 'just' attributes
        if(value) action.justPressed = true;
        else action.justReleased = true;

        // Tag control as last activated
        controls.lastControl = action;

        // Tell player to handle states according to new input
        player.charState.changeState(player);

        // Reset the 'just' attributes
        action.justPressed = false;
        action.justReleased = false;
        
        // Breaks dat.GUI
        // event.preventDefault();
    }
}

/**
 * Changing time scale with scroll wheel
 */
var timeScaleBottomLimit = 0.003;
var timeScaleChangeSpeed = 1.3;
var timeScaleTarget = 1;
function mouseWheel(event) {
    if(event.deltaY > 0) {
        timeScaleTarget /= timeScaleChangeSpeed;
        if(timeScaleTarget < timeScaleBottomLimit) timeScaleTarget = 0;
    }
    else {
        timeScaleTarget *= timeScaleChangeSpeed;
        if(timeScaleTarget < timeScaleBottomLimit) timeScaleTarget = timeScaleBottomLimit;
        timeScaleTarget = Math.min(timeScaleTarget, 9999999999);
        if(params.Time_Scale > 0.9) params.Time_Scale *= timeScaleChangeSpeed;
    }
}

/**
 *  Cycling cameras
 */
function cameraCycle() {

}