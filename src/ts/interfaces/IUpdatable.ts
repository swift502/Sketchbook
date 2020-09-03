export interface IUpdatable
{
	updateOrder: number;
	update(timestep: number, unscaledTimeStep: number): void;
}