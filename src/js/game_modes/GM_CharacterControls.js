/**
 * Character controls game mode. Allows player to control a character.
 * @param {Character} character Character to control 
 */
function GM_CharacterControls(character) {

    this.character = character;

    // Keymap
    this.keymap = {
        'w':      { action: 'up'       },
        's':      { action: 'down'     },
        'a':      { action: 'left'     },
        'd':      { action: 'right'    },
        'shift':  { action: 'run'    },
        ' ':      { action: 'jump'     },
        'e':      { action: 'use'      },
        'mouse0': { action: 'primary'  },
        'mouse2': { action: 'secondary'},
        'mouse1': { action: 'tertiary' }
    }
}

/**
 * Handles game actions based on supplied inputs.
 * @param {*} event Keyboard or mouse event
 * @param {char} key Key or button pressed
 * @param {boolean} value Value to be assigned to action
 */
GM_CharacterControls.prototype.handleKey = function(event, key, value) {

    // Shift modifier fix
    key = key.toLowerCase();

    // Is key bound to action
    if (key in this.keymap) {

        // Get action and set it's parameters
        var action = this.character.controls[this.keymap[key].action];
        action.value = value;

        // Set the 'just' attributes
        if(value) action.justPressed = true;
        else action.justReleased = true;

        // Tag control as last activated
        this.character.controls.lastControl = action;

        // Tell player to handle states according to new input
        this.character.charState.changeState();

        // Reset the 'just' attributes
        action.justPressed = false;
        action.justReleased = false;
        
        // Breaks dat.GUI
        // event.preventDefault();
    }
}