import THREE = require("three");

export class VehicleDoor
{
    public doorObject: THREE.Object3D;

    public rotation: number = 0;
    public targetRotation: number = 0;
    public rotationSpeed: number = 5;

    constructor(object: THREE.Object3D)
    {
        this.doorObject = object;
    }

    public update(timestep: number): void
    {
        if (this.rotation < this.targetRotation)
        {
            this.rotation += timestep * this.rotationSpeed;

            if (this.rotation > this.targetRotation)
            {
                this.rotation = this.targetRotation;
            }
        }
        else if (this.rotation > this.targetRotation)
        {
            this.rotation -= timestep * this.rotationSpeed;

            if (this.rotation < this.targetRotation)
            {
                this.rotation = this.targetRotation;
            }
        }

        let sineRot = Math.sin(this.rotation * Math.PI * 0.5) * -Math.PI * 0.45;
        this.doorObject.setRotationFromEuler(new THREE.Euler(0, sineRot, 0));
    }

    public open(): void
    {
        this.targetRotation = 1;
    }

    public close(): void
    {
        this.targetRotation = 0;
    }

    public isOpen(): boolean
    {
        return this.rotation > 0.5;
    }
}