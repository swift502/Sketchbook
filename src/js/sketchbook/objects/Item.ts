
import * as Utils from '../core/Utilities';

export class Item extends Object
{
    public isItem: boolean;
    public health: any;

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