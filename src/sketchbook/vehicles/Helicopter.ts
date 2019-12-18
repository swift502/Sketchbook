import { Vehicle } from "./Vehicle";
import { IControllable } from "../interfaces/IControllable";
import { IWorldEntity } from "../interfaces/IWorldEntity";

export class Helicopter extends Vehicle implements IControllable, IWorldEntity
{
}