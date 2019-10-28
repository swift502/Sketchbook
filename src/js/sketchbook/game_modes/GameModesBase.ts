import { World } from "../core/World";

export abstract class GameModesBase
{
    public world: World;
    
    public timescaleSwitch(code: string, pressed: boolean): void
    {
        if (code === 'KeyT' && pressed === true) 
        {
            if (this.world.timeScaleTarget < 0.5)
            {
                this.world.timeScaleTarget = 1;
            }
            else 
            {
                this.world.timeScaleTarget = 0.3;
            }
        }
    }

    public checkIfWorldIsSet(): void
    {
        if (this.world === undefined)
        {
            console.error('Calling gameMode init() without having specified gameMode\'s world first: ' + this);
        }
    }

    public scrollTheTimeScale(scrollAmount: number): void
    {

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