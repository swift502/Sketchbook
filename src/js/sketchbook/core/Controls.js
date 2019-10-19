class EventControl
{
    constructor()
    {
        this.value = false;
        this.justPressed = false;
        this.justReleased = false;
    }
}

class LerpControl
{
    constructor()
    {
        this.value = false;
        this.floatValue = 0;
    }
}

export let Controls = {
    EventControl: EventControl,
    LerpControl: LerpControl
};