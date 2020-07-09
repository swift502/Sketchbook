
import * as Utils from '../core/Utilities';

export class Item
{
    public isItem: boolean;
    public health: any;

    constructor(options: {})
    {
        let defaults = {
            health: 0,
        };
        options = Utils.setDefaults(options, defaults);
        
        this.isItem = true;
        this.health = options['health'];
    }
}