export declare class LoadingManager {
    printProgress: boolean;
    private gltfLoader;
    private loadingTracker;
    constructor();
    loadGLTF(path: string, onLoadingFinished: (gltf: any) => void): void;
    startLoading(path: string): void;
    doneLoading(path: string): void;
}
