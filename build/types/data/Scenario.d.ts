import { World } from '../core/World';
export declare class Scenario {
    spawnAlways: boolean;
    default: boolean;
    private rootNode;
    private spawnPoints;
    constructor(root: THREE.Object3D);
    findSpawnPoints(): void;
    launch(world: World): void;
}
