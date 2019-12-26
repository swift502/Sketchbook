import { Side } from "../enums/Side";

export class Wheel
{
    public position: THREE.Vector3;
    public facing: Side;
    public steering: boolean;
}