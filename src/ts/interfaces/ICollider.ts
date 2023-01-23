import * as CANNON from 'cannon-es';

export interface ICollider {
	body: CANNON.Body;
	
	// physical: CANNON.Body;
	// visual: THREE.Mesh;

	// getVisualModel(options: any): THREE.Mesh;
}