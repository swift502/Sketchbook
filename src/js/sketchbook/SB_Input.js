Sketchbook.prototype.initInput = function() {

    var scope = this;

    // Input
    // Event listeners
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);
    document.addEventListener("mousedown", mouseDown, false);
    document.addEventListener("mouseup", mouseUp, false);
    document.addEventListener("wheel", mouseWheel, false);

    // Event handlers
    function keyDown(event) {
        if(typeof scope.gameMode !== 'undefined')
            scope.gameMode.handleKey(event, event.key, true);
    }
    function keyUp(event) {
        if(typeof scope.gameMode !== 'undefined')
            scope.gameMode.handleKey(event, event.key, false);
    }
    function mouseDown(event) {
        if(typeof scope.gameMode !== 'undefined')
            scope.gameMode.handleKey(event, 'mouse' + event.button, true);
    }
    function mouseUp(event) {
        if(typeof scope.gameMode !== 'undefined')
            scope.gameMode.handleKey(event, 'mouse' + event.button, false);
    }

    // Changing time scale with scroll wheel
    this.timeScaleBottomLimit = 0.003;
    this.timeScaleChangeSpeed = 1.3;
    this.timeScaleTarget = 1;
    function mouseWheel(event) {

        if(event.deltaY > 0) {
            scope.timeScaleTarget /= scope.timeScaleChangeSpeed;
            if(scope.timeScaleTarget < scope.timeScaleBottomLimit) scope.timeScaleTarget = 0;
        }
        else {
            scope.timeScaleTarget *= scope.timeScaleChangeSpeed;
            if(scope.timeScaleTarget < scope.timeScaleBottomLimit) scope.timeScaleTarget = scope.timeScaleBottomLimit;
            scope.timeScaleTarget = Math.min(scope.timeScaleTarget, 9999999999);
            if(scope.params.Time_Scale > 0.9) scope.params.Time_Scale *= scope.timeScaleChangeSpeed;
        }
    }
}

// Control classes
function Control() {
    this.value = false;
    this.justPressed = false;
    this.justReleased = false;
}

function LerpControl() {
    this.value = false;
    this.floatValue = 0;
}
