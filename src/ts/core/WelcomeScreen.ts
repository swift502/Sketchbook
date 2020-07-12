import { World } from "./World";

export class WelcomeScreen
{
    private world: World;

    constructor(world: World)
    {
        this.world = world;
    }

    public displayStartBtn(): void
    {
        document.getElementById('start-btn').style.opacity = '1';
    }

    public hideWelcomeScreen(): void
    {
        document.getElementById('welcome-screen').style.display = 'none';
        this.world.setTimeScale(1);
    }

}