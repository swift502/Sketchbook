import * as THREE from 'three';
import * as _ from 'lodash';
import { World } from '../core/World';
import { IPhysicsType } from '../interfaces/IPhysicsType';
import { IWorldEntity } from '../interfaces/IWorldEntity';

// TODO static and dynamic props
export class SBObject extends THREE.Object3D implements IWorldEntity
{
    public isObject: boolean;
    public model: any;
    public physics: any;

    constructor(model?: THREE.Mesh, physics?: IPhysicsType)
    {
        super();

        this.isObject = true;

        this.model = model;
        this.physics = physics;
    }

    public update(timeStep: number): void
    {
        if (this.physics.visual !== undefined)
        {
            // TODO encapulate physics, updating positions should be automatic?
            this.physics.visual.position.copy(this.position);
            this.physics.visual.quaternion.copy(this.quaternion);
        }

        if (this.model !== undefined)
        {
            this.model.position.copy(this.position);
            this.model.quaternion.copy(this.quaternion);
        }
    }

    public setModel(model: THREE.Mesh): void
    {
        this.model = model;
    }

    public setModelFromPhysicsShape(): void
    {
        this.model = this.physics.getVisualModel({ visible: true, wireframe: false });
    }

    public setPhysics(physics: IPhysicsType): void
    {
        this.physics = physics;
    }

    public addToWorld(world: World): void
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

    public removeFromWorld(world: World): void
    {
        if (!_.includes(world.objects, this))
        {
            console.warn('Removing object from a world in which it isn\'t present.');
        }
        else 
        {
            _.pull(world.objects, this);

            if (this.physics.physical !== undefined)
            {
                world.physicsWorld.remove(this.physics.physical);
            }

            if (this.physics.visual !== undefined)
            {
                world.graphicsWorld.remove(this.physics.visual);
            }

            if (this.model !== undefined)
            {
                world.graphicsWorld.remove(this.model);
            }
        }
    }
}