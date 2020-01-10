export declare class Wheel {
    wheelObject: THREE.Object3D;
    position: THREE.Vector3;
    steering: boolean;
    drive: string;
    rayCastWheelInfoIndex: number;
    constructor(wheelObject: THREE.Object3D);
}
