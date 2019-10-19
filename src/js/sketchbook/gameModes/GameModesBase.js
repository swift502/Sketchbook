
export class GameModesBase
{
    init() { }
    update() { }

    handleAction(event, key, value)
    {
        key = event.keyCode;

        if(key == '84' && value == true) 
        {
            if(this.world.timeScaleTarget < 0.5)
            {
                this.world.timeScaleTarget = 1;
            }
            else 
            {
                this.world.timeScaleTarget = 0.3;
            }
        }
    }
    handleScroll(event, value) { }
    handleMouseMove(event, deltaX, deltaY) { }

    checkIfWorldIsSet()
    {
        if(this.world === undefined)
        {
            console.error('Calling gameMode init() without having specified gameMode\'s world first: ' + this);
        }
    }

    scrollTheTimeScale(scrollAmount) {

        // Changing time scale with scroll wheel
        const timeScaleBottomLimit = 0.003;
        const timeScaleChangeSpeed = 1.3;
    
        if (scrollAmount > 0)
        {
            this.world.timeScaleTarget /= timeScaleChangeSpeed;
            if (this.world.timeScaleTarget < timeScaleBottomLimit) this.world.timeScaleTarget = 0;
        }
        else
        {
            this.world.timeScaleTarget *= timeScaleChangeSpeed;
            if (this.world.timeScaleTarget < timeScaleBottomLimit) this.world.timeScaleTarget = timeScaleBottomLimit;
            this.world.timeScaleTarget = Math.min(this.world.timeScaleTarget, 1);
            if (this.world.params.Time_Scale > 0.9) this.world.params.Time_Scale *= timeScaleChangeSpeed;
        }
    }
}