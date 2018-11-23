
import { Utilities as Utils } from '../sketchbook/Utilities';

export class Item extends Object
{
    constructor(options)
    {
        super();

        let defaults = {
            health: 0,
        };
        options = Utils.setDefaults(options, defaults);
        
        this.isItem = true;
        this.health = options.health;
    }
}