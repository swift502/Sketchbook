

// Control class
function Control() {
    this.value = false;
    this.justPressed = false;
    this.justReleased = false;
}

// Event listeners
document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);
document.addEventListener("mousedown", mouseDown, false);
document.addEventListener("mouseup", mouseUp, false);
document.addEventListener("wheel", mouseWheel, false);

// Event handlers
function keyDown(event) {
    CurrentGameMode.handleKey(event, event.key, true);
}
function keyUp(event) {
    CurrentGameMode.handleKey(event, event.key, false);
}
function mouseDown(event) {
    CurrentGameMode.handleKey(event, 'mouse' + event.button, true);
}
function mouseUp(event) {
    CurrentGameMode.handleKey(event, 'mouse' + event.button, false);
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