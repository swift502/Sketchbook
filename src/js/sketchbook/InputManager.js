export class InputManager
{
    constructor(world, domElement)
    {
        this.world = world;
        this.domElement = domElement || document.body;
        this.pointerLock = this.world.params.Pointer_Lock;
        this.isLocked = false;
        
        // Bindings for later event use
        // Mouse
        this.boundOnMouseDown = evt => this.onMouseDown(evt);
        this.boundOnMouseMove = evt => this.onMouseMove(evt);
        this.boundOnMouseUp = evt => this.onMouseUp(evt);
        this.boundOnMouseWheelMove = evt => this.onMouseWheelMove(evt);

        // Pointer lock
        this.boundOnPointerlockChange = evt => this.onPointerlockChange(evt);
        this.boundOnPointerlockError = evt => this.onPointerlockError(evt);

        // Keys
        this.boundOnKeyDown = evt => this.onKeyDown(evt);
        this.boundOnKeyUp = evt => this.onKeyUp(evt);

        // Init event listeners
        // Mouse
        this.domElement.addEventListener("mousedown", this.boundOnMouseDown, false);
        document.addEventListener("wheel", this.boundOnMouseWheelMove, false);
        document.addEventListener("pointerlockchange", this.boundOnPointerlockChange, false);
        document.addEventListener("pointerlockerror", this.boundOnPointerlockError, false);
        
        // Keys
        document.addEventListener("keydown", this.boundOnKeyDown, false);
        document.addEventListener("keyup", this.boundOnKeyUp, false);
    }

    setPointerLock(enabled)
    {
        this.pointerLock = enabled;
    }

    onPointerlockChange(event)
    {
        if (document.pointerLockElement === this.domElement)
        {
            this.domElement.addEventListener("mousemove", this.boundOnMouseMove, false);
            this.domElement.addEventListener("mouseup", this.boundOnMouseUp, false);
            this.isLocked = true;
        }
        else
        {
            this.domElement.removeEventListener("mousemove", this.boundOnMouseMove, false);
            this.domElement.removeEventListener("mouseup", this.boundOnMouseUp, false);
            this.isLocked = false;
        }
    }

    onPointerlockError(event)
    {
        console.error("PointerLockControls: Unable to use Pointer Lock API");
    }

    onMouseDown(event)
    {
        if (this.pointerLock)
        {
            this.domElement.requestPointerLock();
        }
        else
        {
            this.domElement.addEventListener("mousemove", this.boundOnMouseMove, false);
            this.domElement.addEventListener("mouseup", this.boundOnMouseUp, false);
        }

        if (this.world.gameMode !== undefined)
        {
            this.world.gameMode.handleAction(event, 'mouse' + event.button, true);
        }
    }

    onMouseMove(event)
    {
        if (this.world.gameMode !== undefined)
        {
            this.world.gameMode.handleMouseMove(event, event.movementX, event.movementY);
        }
    }

    onMouseUp(event)
    {
        if (!this.pointerLock)
        {
            this.domElement.removeEventListener("mousemove", this.boundOnMouseMove, false);
            this.domElement.removeEventListener("mouseup", this.boundOnMouseUp, false);
        }

        if (this.world.gameMode !== undefined)
        {
            this.world.gameMode.handleAction(event, 'mouse' + event.button, false);
        }
    }

    onKeyDown(event)
    {
        if (this.world.gameMode !== undefined)
        {
            this.world.gameMode.handleAction(event, event.key, true);
        }
    }

    onKeyUp(event)
    {
        if (this.world.gameMode !== undefined)
        {
            this.world.gameMode.handleAction(event, event.key, false);
        }
    }

    onMouseWheelMove(event)
    {
        if (this.world.gameMode !== undefined)
        {
            this.world.gameMode.handleScroll(event, event.deltaY);
        }
    }
}