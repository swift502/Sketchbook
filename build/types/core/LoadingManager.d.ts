import { WelcomeScreen } from "./WelcomeScreen";
import { World } from './World';
export declare class LoadingManager {
    printProgress: boolean;
    welcomeScreen: WelcomeScreen;
    private gltfLoader;
    private loadingTracker;
    private world;
    constructor(world: World);
    loadGLTF(path: string, onLoadingFinished: (gltf: any) => void): void;
    startLoading(path: string): void;
    doneLoading(path: string): void;
}
