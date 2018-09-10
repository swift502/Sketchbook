//
// Default state
//
class DefaultState {

    constructor(character) {
        this.character = character;

        this.character.velocitySimulator.damping = this.character.defaultVelocitySimulatorDamping;
        this.character.velocitySimulator.mass = this.character.defaultVelocitySimulatorMass;

        this.character.rotationSimulator.damping = this.character.defaultRotationSimulatorDamping;
        this.character.rotationSimulator.mass = this.character.defaultRotationSimulatorMass;
    }

    update(timeStep) {}

    changeState() {}

    noDirection() {
        return !this.character.controls.up.value && !this.character.controls.down.value && !this.character.controls.left.value && !this.character.controls.right.value;
    }

    anyDirection() {
        return this.character.controls.up.value || this.character.controls.down.value || this.character.controls.left.value || this.character.controls.right.value;
    }

    justPressed(control) {
        return this.character.controls.lastControl == control && control.justPressed;
    }

    isPressed(control) {
        return control.value;
    }

    justReleased(control) {
        return this.character.controls.lastControl == control && control.justReleased;
    }

    fallInAir() {
        if(!this.character.rayHasHit) this.character.setState(Falling);
    }
}

//
// Idle
//
class Idle extends DefaultState {

    constructor(character) {

        super(character);

        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 10;
        
        this.character.setAnimation('idle', 0.3);
    }

    update(timeStep) {
    
        this.character.setVelocityTarget(0);
        this.character.update(timeStep);
    
        this.fallInAir();
    }
    changeState() {
        if(this.justPressed(this.character.controls.jump)) {
            this.character.setState(JumpIdle);
        }
    
        if(this.anyDirection()) {
            this.character.setState(StartWalkForward);
        }
    }
}

//
// Walk
//
class Walk extends DefaultState {

    constructor(character) {
        super(character);

        this.character.setAnimation('run', 0.1);
    
        if(this.noDirection()) {
            this.character.setState(EndWalk);
        }
    }

    update(timeStep) {
        this.character.setGlobalDirectionGoal();
        this.character.setVelocityTarget(0.8);
        this.character.update(timeStep);
    
        this.fallInAir();
    
        if(this.isPressed(this.character.controls.run)) {
            this.character.setState(Sprint);
        }
    }
    changeState() {
        if(this.justPressed(this.character.controls.jump)) {
            this.character.setState(JumpRunning);
        }
    
        if(this.noDirection()) {
            this.character.setState(Idle);
        }
    }
}



//
// Sprint
//
class Sprint extends DefaultState {

    constructor(character) {

        super(character);

        this.character.velocitySimulator.mass = 10;
        this.character.rotationSimulator.damping = 0.8;
        this.character.rotationSimulator.mass = 50;
    
        this.character.setAnimation('sprint', 0.3);
    }

    update(timeStep) {
        this.character.setGlobalDirectionGoal();
        this.character.setVelocityTarget(1.4);
        this.character.update(timeStep);
    
        this.fallInAir();
    }

    changeState() {
        if(this.justReleased(this.character.controls.run)) {
            this.character.setState(Walk);
        }
        if(this.justPressed(this.character.controls.jump)) {
            this.character.setState(JumpRunning);
        }
        if(this.noDirection()) {
            this.character.setState(EndWalk);
        }
    }
}



//
// Start Walk Forward
//
class StartWalkForward extends DefaultState {

    constructor(character) {

        super(character);

        this.character.velocitySimulator.mass = 30;
    
        let duration = character.setAnimation('start_forward', 0.1);
        this.time = duration;
        this.timer = 0;
    }

    update(timeStep) {
        this.timer += timeStep;
        if(this.timer > this.time - timeStep) this.character.setState(Walk);
    
        this.character.setGlobalDirectionGoal();
        this.character.setVelocityTarget(0.8);
    
        this.character.update(timeStep);
    
        this.fallInAir();
    }

    changeState() {
        if(this.justPressed(this.character.controls.jump)) {
            this.character.setState(JumpRunning);
        }
    
        if(this.noDirection()) {
            this.character.setState(Idle);
        }
    
        if(this.justPressed(this.character.controls.run)) {
            this.character.setState(Sprint);
        }
    }
}



//
// End Walk
//
class EndWalk extends DefaultState {

    constructor(character) {

        super(character);

        let duration = character.setAnimation('stop', 0.1);
        this.time = duration;
        this.timer = 0;
    }

    update(timeStep) {
        this.timer += timeStep;
        if(this.timer > this.time - timeStep) {
    
            this.character.setState(Idle);
        }
        
        this.character.setVelocityTarget(0);
        this.character.update(timeStep);
        this.fallInAir();
    }

    changeState() {
        if(this.justPressed(this.character.controls.jump)) {
            this.character.setState(JumpIdle);
        }
    
        if(this.anyDirection()) {
            if(this.isPressed(this.character.controls.run)) {
                this.character.setState(Sprint);
            }
            else {
                this.character.setState(StartWalkForward);
            }
        }
    }
}



//
// Jump Idle
//
class JumpIdle extends DefaultState {

    constructor(character) {

        super(character);

        this.character.velocitySimulator.mass = 100;
    
        this.animationLength = this.character.setAnimation('jump_idle', 0.1);
        this.timer = 0;
    
        this.alreadyJumped = false;
    }

    update(timeStep) {
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
            this.character.setState(DropIdle);
        }

        if(this.timer > this.animationLength - timeStep) {
            this.character.setState(Falling);
        }
    }
}

//
// Jump Running
//
class JumpRunning extends DefaultState {

    constructor(character) {

        super(character);

        this.character.velocitySimulator.mass = 100;
    
        this.animationLength = this.character.setAnimation('jump_running', 0.1);
        this.timer = 0;
    
        this.alreadyJumped = false;
    }

    update(timeStep) {
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
            this.character.setState(DropRunning);
        }
    
        if(this.timer > this.animationLength - timeStep) {
            this.character.setState(Falling);
        }
    }
}

//
// Falling
//
class Falling extends DefaultState {

    constructor(character) {
        super(character);

        this.character.velocitySimulator.mass = 100;
        this.character.rotationSimulator.damping = 0.3;
    
        this.character.setAnimation('falling', 0.3);
    }

    update(timeStep) {
        this.character.setGlobalDirectionGoal();
        this.character.setVelocityTarget(this.anyDirection() ? 0.8 : 0);
        this.character.update(timeStep);
    
        if(this.character.rayHasHit) {
            if(this.anyDirection()) {
                this.character.setState(DropRunning);
            }
            else {
                this.character.setState(DropIdle);
            }
        }
    }
}

//
// Drop Idle
//
class DropIdle extends DefaultState {

    constructor(character) {
        super(character);

        this.character.velocitySimulator.damping = 0.6;
        this.character.velocitySimulator.mass = 15;

        this.animationLength = this.character.setAnimation('drop_idle', 0.1);
        this.timer = 0;
        
        if(this.anyDirection()) {
            this.character.setState(StartWalkForward);
        }
    }

    update(timeStep) {
        this.character.setGlobalDirectionGoal();
        this.character.setVelocityTarget(0);
        this.character.update(timeStep);
    
        this.timer += timeStep;
        if(this.timer > this.animationLength - timeStep) {
            this.character.setState(Idle);
        }
    
        this.fallInAir();
    }

    changeState() {
        if(this.justPressed(this.character.controls.jump)) {
            this.character.setState(JumpIdle);
        }
        if(this.anyDirection()) {
            this.character.setState(StartWalkForward);
        }
    }
}

//
// Drop Running
//
class DropRunning extends DefaultState {

    constructor(character) {
        super(character);

        this.animationLength = this.character.setAnimation('drop_running', 0.1);
        this.timer = 0;
    }
    
    update(timeStep) {
        this.character.setGlobalDirectionGoal();
        this.character.setVelocityTarget(0.8);
        this.character.update(timeStep);
    
        this.timer += timeStep;
        if(this.timer > this.animationLength - timeStep) {
            this.character.setState(Walk);
        }
    
        this.fallInAir();
    }

    changeState() {
        if(this.noDirection(this.character.controls.jump)) {
            this.character.setState(EndWalk);
        }
    
        if(this.anyDirection() && this.justPressed(this.character.controls.run)) {
            this.character.setState(Sprint);
        }
    
        if(this.justPressed(this.character.controls.jump)) {
            this.character.setState(JumpRunning);
        }
    }
}

export let CharacterStates = {
    DefaultState: DefaultState,
    Idle: Idle,
    Walk: Walk,
    Sprint: Sprint,
    StartWalkForward: StartWalkForward,
    EndWalk: EndWalk,
    JumpIdle: JumpIdle,
    JumpRunning: JumpRunning,
    Falling: Falling,
    DropIdle: DropIdle,
    DropRunning: DropRunning
};