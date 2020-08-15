import {StartWalkBase} from './_stateLibrary';
import { Character } from '../Character';

export class StartWalkLeft extends StartWalkBase
{
	constructor(character: Character)
	{
		super(character);
		this.animationLength = character.setAnimation('start_left', 0.1);
	}
}