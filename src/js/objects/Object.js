import * as THREE from 'three';

export class Object extends THREE.Object3D{
    
    constructor() {
        super();

        this.isObject = true;

        this.model = undefined;
        this.physics = undefined;
        this.shape = undefined;
        this.shapeModel = undefined;
    }

    update(timeStep) {
        if(this.shapeModel != undefined) {
            this.shapeModel.position.copy(this.position);
            this.shapeModel.quaternion.copy(this.quaternion);
        }

        if(this.model != undefined) {
            this.model.position.copy(this.position);
            this.model.quaternion.copy(this.quaternion);
        }
    }

    setModel(model) {
        this.model = model;
    }

    setModelFromPhysicsShape() {
        this.model = this.physics.getVisualModel({visible: true, wireframe: false});
    }

    setPhysics(physics) {
        this.physics = physics;
        this.shape = physics.physical;
        this.shapeModel = physics.visual;
    }
}