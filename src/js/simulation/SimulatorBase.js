
function SimulatorBase(fps) {
    this.frameTime = 1/fps;
    this.offset = 0; // 0 - frameTime
    this.cache = []; // At least two frames
}

SimulatorBase.prototype.setFPS = function(value) {
    this.frameTime = 1/value;
}

SimulatorBase.prototype.lastFrame = function() {
    return this.cache[this.cache.length - 1];
}