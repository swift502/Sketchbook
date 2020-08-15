import { Character } from '../characters/Character';
import { IInputReceiver } from './IInputReceiver';
import { SeatPoint } from '../data/SeatPoint';

export interface IControllable extends IInputReceiver
{
	seats: SeatPoint[];
	position: THREE.Vector3;
	controllingCharacter: Character;

	triggerAction(actionName: string, value: boolean): void;
	resetControls(): void;
	allowSleep(value: boolean): void;
	onInputChange(): void;
	noDirectionPressed(): boolean;
}