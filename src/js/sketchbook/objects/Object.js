import * as THREE from 'three';

export class Object extends THREE.Object3D
{
    constructor(model, physics)
    {
        super();

        this.isObject = true;

        this.model = model;
        this.physics = physics;
    }

    update(timeStep)
    {
        if (this.physics.visual != undefined)
        {
            this.physics.visual.position.copy(this.position);
            this.physics.visual.quaternion.copy(this.quaternion);
        }

        if (this.model != undefined)
        {
            this.model.position.copy(this.position);
            this.model.quaternion.copy(this.quaternion);
        }
    }

    setModel(model)
    {
        this.model = model;
    }

    setModelFromPhysicsShape()
    {
        this.model = this.physics.getVisualModel({ visible: true, wireframe: false });
    }

    setPhysics(physics)
    {
        this.physics = physics;
    }
}