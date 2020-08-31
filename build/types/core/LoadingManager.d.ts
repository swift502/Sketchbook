import { LoadingTrackerEntry } from './LoadingTrackerEntry';
import { LoadingScreenMode } from '../enums/LoadingScreenMode';
export declare class LoadingManager {
    firstLoad: boolean;
    private gltfLoader;
    private loadingTracker;
    private onFinishedCallback;
    constructor(mode: LoadingScreenMode);
    loadGLTF(path: string, onLoadingFinished: (gltf: any) => void): void;
    addLoadingEntry(path: string): LoadingTrackerEntry;
    doneLoading(trackerEntry: LoadingTrackerEntry): void;
    private getLoadingPercentage;
    private isLoadingDone;
}
