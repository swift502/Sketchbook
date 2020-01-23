export interface IPhysicsType {
    physical: CANNON.Body;
    visual: THREE.Mesh;

    getVisualModel(options: any): THREE.Mesh;
}