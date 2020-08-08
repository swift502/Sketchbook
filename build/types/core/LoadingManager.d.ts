import { World } from './World';
import { LoadingTrackerEntry } from './LoadingTrackerEntry';
export declare class LoadingManager {
    firstLoad: boolean;
    private gltfLoader;
    private loadingTracker;
    private world;
    private progressBarSimulator;
    constructor(world: World);
    loadGLTF(path: string, onLoadingFinished: (gltf: any) => void): void;
    addLoadingEntry(path: string): LoadingTrackerEntry;
    doneLoading(trackerEntry: LoadingTrackerEntry): void;
    update(timeStep: number): void;
    private getLoadingPercentage;
    private isLoadingDone;
}
