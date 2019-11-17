
import * as Utils from '../core/Utilities';
import { SBObject } from './SBObject';

export class Item extends SBObject
{
    public isItem: boolean;
    public health: any;

    constructor(options: {})
    {
        super();

        let defaults = {
            health: 0,
        };
        options = Utils.setDefaults(options, defaults);
        
        this.isItem = true;
        this.health = options['health'];
    }
}