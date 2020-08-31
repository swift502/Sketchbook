import { World } from './World';
import { LoadingManager } from './LoadingManager';
export declare class Scenario {
    id: string;
    name: string;
    spawnAlways: boolean;
    default: boolean;
    private rootNode;
    private spawnPoints;
    private invisible;
    private world;
    constructor(root: THREE.Object3D, world: World);
    createLaunchLink(): void;
    launch(loadingManager: LoadingManager, world: World): void;
}
