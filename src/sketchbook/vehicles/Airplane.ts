import { Vehicle } from "./Vehicle";
import { IControllable } from "../interfaces/IControllable";
import { IWorldEntity } from "../interfaces/IWorldEntity";

export class Airplane extends Vehicle implements IControllable, IWorldEntity
{
}