import * as THREE from 'three';
import _ from 'lodash';

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

    addToWorld(world) {

        if (_.includes(world.objects, this))
        {
            console.warn('Adding object to a world in which it already exists.');
        }
        else 
        {
            world.objects.push(this);

            if (this.physics.physical !== undefined)
            {
                world.physicsWorld.addBody(this.physics.physical);
            }

            if (this.physics.visual !== undefined)
            {
                world.graphicsWorld.add(this.physics.visual);
            }

            if (this.model !== undefined)
            {
                world.graphicsWorld.add(this.model);
            }
        }
    }
}