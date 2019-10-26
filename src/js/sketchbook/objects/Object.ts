import * as THREE from 'three';
import * as _ from 'lodash';

export class SBObject extends THREE.Object3D
{
    public isObject: boolean;
    public model: any;
    public physics: any;

    constructor(model?, physics?)
    {
        super();

        this.isObject = true;

        this.model = model;
        this.physics = physics;
    }

    public update(timeStep): void
    {
        if (this.physics.visual !== undefined)
        {
            this.physics.visual.position.copy(this.position);
            this.physics.visual.quaternion.copy(this.quaternion);
        }

        if (this.model !== undefined)
        {
            this.model.position.copy(this.position);
            this.model.quaternion.copy(this.quaternion);
        }
    }

    public setModel(model): void
    {
        this.model = model;
    }

    public setModelFromPhysicsShape(): void
    {
        this.model = this.physics.getVisualModel({ visible: true, wireframe: false });
    }

    public setPhysics(physics): void
    {
        this.physics = physics;
    }

    public addToWorld(world): void
    {

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