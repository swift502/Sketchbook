//
// Default state
//
function CS_DefaultState(character) {

    this.character = character;

    this.character.velocitySimulator.damping = this.character.defaultVelocitySimulatorDamping;
    this.character.velocitySimulator.mass = this.character.defaultVelocitySimulatorMass;

    this.character.rotationSimulator.damping = this.character.defaultRotationSimulatorDamping;
    this.character.rotationSimulator.mass = this.character.defaultRotationSimulatorMass;
}
CS_DefaultState.prototype.update = function(timeStep) {}
CS_DefaultState.prototype.changeState = function() {}

CS_DefaultState.prototype.noDirection = function() {
    return !this.character.controls.up.value && !this.character.controls.down.value && !this.character.controls.left.value && !this.character.controls.right.value;
}

CS_DefaultState.prototype.anyDirection = function() {
    return this.character.controls.up.value || this.character.controls.down.value || this.character.controls.left.value || this.character.controls.right.value;
}

CS_DefaultState.prototype.justPressed = function(control) {
    return this.character.controls.lastControl == control && control.justPressed;
}

CS_DefaultState.prototype.isPressed = function(control) {
    return control.value;
}

CS_DefaultState.prototype.justReleased = function(control) {
    return this.character.controls.lastControl == control && control.justReleased;
}

CS_DefaultState.prototype.fallInAir = function() {
    if(!this.character.rayHasHit) this.character.setState(CS_Falling);
}

//
// Idle
//
function CS_Idle(character) {
    
    CS_DefaultState.call(this, character);

    this.character.velocitySimulator.damping = 0.6;
    this.character.velocitySimulator.mass = 10;
    
    this.character.setAnimation('idle', 0.3);
}
CS_Idle.prototype = Object.create(CS_DefaultState.prototype);
CS_Idle.prototype.update = function(timeStep) {
    
    this.character.setVelocityTarget(0);
    this.character.update(timeStep);

    this.fallInAir();
}
CS_Idle.prototype.changeState = function() {
    if(this.justPressed(this.character.controls.jump)) {
        this.character.setState(CS_JumpIdle);
    }

    if(this.anyDirection()) {
        this.character.setState(CS_StartWalkForward);
    }
}

//
// Walk
//
function CS_Walk(character) {
    CS_DefaultState.call(this, character);

    this.character.setAnimation('run', 0.1);

    if(this.noDirection()) {
        this.character.setState(CS_EndWalk);
    }
}
CS_Walk.prototype = Object.create(CS_DefaultState.prototype);
CS_Walk.prototype.update = function(timeStep) {
    this.character.setGlobalDirectionGoal();
    this.character.setVelocityTarget(0.8);
    this.character.update(timeStep);

    this.fallInAir();

    if(this.isPressed(this.character.controls.run)) {
        this.character.setState(CS_Sprint);
    }
}
CS_Walk.prototype.changeState = function() {
    if(this.justPressed(this.character.controls.jump)) {
        this.character.setState(CS_JumpRunning);
    }

    if(this.noDirection()) {
        this.character.setState(CS_Idle);
    }
}

//
// Sprint
//
function CS_Sprint(character) {
    CS_DefaultState.call(this, character);

    this.character.velocitySimulator.mass = 10;
    this.character.rotationSimulator.damping = 0.8;
    this.character.rotationSimulator.mass = 50;

    this.character.setAnimation('sprint', 0.3);
}
CS_Sprint.prototype = Object.create(CS_DefaultState.prototype);
CS_Sprint.prototype.update = function(timeStep) {
    this.character.setGlobalDirectionGoal();
    this.character.setVelocityTarget(1.4);
    this.character.update(timeStep);

    this.fallInAir();
}
CS_Sprint.prototype.changeState = function() {
    if(this.justReleased(this.character.controls.run)) {
        this.character.setState(CS_Walk);
    }
    if(this.justPressed(this.character.controls.jump)) {
        this.character.setState(CS_JumpRunning);
    }
    if(this.noDirection()) {
        this.character.setState(CS_EndWalk);
    }
}

//
// Start Walk Forward
//
function CS_StartWalkForward(character) {
    CS_DefaultState.call(this, character);

    this.character.velocitySimulator.mass = 30;

    var duration = character.setAnimation('start_forward', 0.1);
    this.time = duration;
    this.timer = 0;
}
CS_StartWalkForward.prototype = Object.create(CS_DefaultState.prototype);
CS_StartWalkForward.prototype.update = function(timeStep) {
    this.timer += timeStep;
    if(this.timer > this.time - timeStep) this.character.setState(CS_Walk);

    this.character.setGlobalDirectionGoal();
    this.character.setVelocityTarget(0.8);

    this.character.update(timeStep);

    this.fallInAir();
}
CS_StartWalkForward.prototype.changeState = function() {
    if(this.justPressed(this.character.controls.jump)) {
        this.character.setState(CS_JumpRunning);
    }

    if(this.noDirection()) {
        this.character.setState(CS_Idle);
    }

    if(this.justPressed(this.character.controls.run)) {
        this.character.setState(CS_Sprint);
    }
}

//
// End Walk
//
function CS_EndWalk(character) {
    CS_DefaultState.call(this, character);

    var duration = character.setAnimation('stop', 0.1);
    this.time = duration;
    this.timer = 0;
}
CS_EndWalk.prototype = Object.create(CS_DefaultState.prototype);
CS_EndWalk.prototype.update = function(timeStep) {
    this.timer += timeStep;
    if(this.timer > this.time - timeStep) {

        this.character.setState(CS_Idle);
    }
    
    this.character.setVelocityTarget(0);
    this.character.update(timeStep);
    this.fallInAir();
}
CS_EndWalk.prototype.changeState = function() {
    if(this.justPressed(this.character.controls.jump)) {
        this.character.setState(CS_JumpIdle);
    }

    if(this.anyDirection()) {
        if(this.isPressed(this.character.controls.run)) {
            this.character.setState(CS_Sprint);
        }
        else {
            this.character.setState(CS_StartWalkForward);
        }
    }
}

//
// Jump Idle
//
function CS_JumpIdle(character) {
    CS_DefaultState.call(this, character);

    this.character.velocitySimulator.mass = 100;

    this.animationLength = this.character.setAnimation('jump_idle', 0.1);
    this.timer = 0;

    this.alreadyJumped = false;
}
CS_JumpIdle.prototype = Object.create(CS_DefaultState.prototype);
CS_JumpIdle.prototype.update = function(timeStep) {
    this.character.setGlobalDirectionGoal();
    // Move in air
    if(this.timer > 0.3) {
        this.character.setVelocityTarget(this.anyDirection() ? 0.8 : 0);
    }
    this.character.update(timeStep);

    //Physically jump
    this.timer += timeStep;
    if(this.timer > 0.3 && !this.alreadyJumped) {
        this.character.jump();
        this.alreadyJumped = true;

        this.character.rotationSimulator.damping = 0.3;
    }

    if(this.timer > 0.35 && this.character.rayHasHit) {
        this.character.setState(CS_DropIdle);
    }

    if(this.timer > this.animationLength - timeStep) {
        this.character.setState(CS_Falling);
    }
}

//
// Jump Running
//
function CS_JumpRunning(character) {
    CS_DefaultState.call(this, character);

    this.character.velocitySimulator.mass = 100;

    this.animationLength = this.character.setAnimation('jump_running', 0.1);
    this.timer = 0;

    this.alreadyJumped = false;
}
CS_JumpRunning.prototype = Object.create(CS_DefaultState.prototype);
CS_JumpRunning.prototype.update = function(timeStep) {
    this.character.setGlobalDirectionGoal();
    // Move in air
    if(this.timer > 0.2) {
        this.character.setVelocityTarget(this.anyDirection() ? 0.8 : 0);
    }
    this.character.update(timeStep);

    //Physically jump
    this.timer += timeStep;
    if(this.timer > 0.2 && !this.alreadyJumped) {
        this.character.jump();
        this.alreadyJumped = true;

        this.character.rotationSimulator.damping = 0.3;
    }

    if(this.timer > 0.3 && this.character.rayHasHit) {
        this.character.setState(CS_DropRunning);
    }

    if(this.timer > this.animationLength - timeStep) {
        this.character.setState(CS_Falling);
    }
}

//
// Falling
//
function CS_Falling(character) {
    CS_DefaultState.call(this, character);

    this.character.velocitySimulator.mass = 100;
    this.character.rotationSimulator.damping = 0.3;

    this.character.setAnimation('falling', 0.3);
}
CS_Falling.prototype = Object.create(CS_DefaultState.prototype);
CS_Falling.prototype.update = function(timeStep) {
    this.character.setGlobalDirectionGoal();
    this.character.setVelocityTarget(this.anyDirection() ? 0.8 : 0);
    this.character.update(timeStep);

    if(this.character.rayHasHit) {
        if(this.anyDirection()) {
            this.character.setState(CS_DropRunning);
        }
        else {
            this.character.setState(CS_DropIdle);
        }
    }
}

//
// Drop Idle
//
function CS_DropIdle(character) {
    CS_DefaultState.call(this, character);

    this.character.velocitySimulator.damping = 0.6;
    this.character.velocitySimulator.mass = 15;

    this.animationLength = this.character.setAnimation('drop_idle', 0.1);
    this.timer = 0;
    
    if(this.anyDirection()) {
        this.character.setState(CS_StartWalkForward);
    }
}
CS_DropIdle.prototype = Object.create(CS_DefaultState.prototype);
CS_DropIdle.prototype.update = function(timeStep) {
    this.character.setGlobalDirectionGoal();
    this.character.setVelocityTarget(0);
    this.character.update(timeStep);

    this.timer += timeStep;
    if(this.timer > this.animationLength - timeStep) {
        this.character.setState(CS_Idle);
    }

    this.fallInAir();
}
CS_DropIdle.prototype.changeState = function() {
    if(this.justPressed(this.character.controls.jump)) {
        this.character.setState(CS_JumpIdle);
    }
    if(this.anyDirection()) {
        this.character.setState(CS_StartWalkForward);
    }
}

//
// Drop Running
//
function CS_DropRunning(character) {
    CS_DefaultState.call(this, character);

    this.animationLength = this.character.setAnimation('drop_running', 0.1);
    this.timer = 0;
    
}
CS_DropRunning.prototype = Object.create(CS_DefaultState.prototype);
CS_DropRunning.prototype.update = function(timeStep) {
    this.character.setGlobalDirectionGoal();
    this.character.setVelocityTarget(0.8);
    this.character.update(timeStep);

    this.timer += timeStep;
    if(this.timer > this.animationLength - timeStep) {
        this.character.setState(CS_Walk);
    }

    this.fallInAir();
}
CS_DropRunning.prototype.changeState = function() {
    if(this.noDirection(this.character.controls.jump)) {
        this.character.setState(CS_EndWalk);
    }

    if(this.anyDirection() && this.justPressed(this.character.controls.run)) {
        this.character.setState(CS_Sprint);
    }

    if(this.justPressed(this.character.controls.jump)) {
        this.character.setState(CS_JumpRunning);
    }
}

export {
    CS_DefaultState,
    CS_Idle,
    CS_Walk,
    CS_Sprint,
    CS_StartWalkForward,
    CS_EndWalk,
    CS_JumpIdle,
    CS_JumpRunning,
    CS_Falling,
    CS_DropIdle,
    CS_DropRunning
};