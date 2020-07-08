
export class WelcomeScreen
{

    constructor()
    {

    }

    public displayStartBtn(): void
    {
        document.getElementById('start-btn').style.opacity = '1';
    }

    public hideWelcomeScreen(): void
    {
        document.getElementById('welcome-screen').style.display = 'none';
    }

}