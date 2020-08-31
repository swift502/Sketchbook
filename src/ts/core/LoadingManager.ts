import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { LoadingTrackerEntry } from './LoadingTrackerEntry';
import { LoadingScreenMode } from '../enums/LoadingScreenMode';

export class LoadingManager
{
	public firstLoad: boolean = true;

	private gltfLoader: GLTFLoader;
	private loadingTracker: LoadingTrackerEntry[] = [];

	private onFinishedCallback: () => void;

	constructor(mode: LoadingScreenMode)
	{
		this.gltfLoader = new GLTFLoader();

		document.getElementById('main-title').style.display = mode === LoadingScreenMode.Full ? 'block' : 'none';
		document.getElementById('loading-screen-background').style.display = mode === LoadingScreenMode.Full ? 'block' : 'none';
		document.getElementById('ui-container').style.display = 'none';
		document.getElementById('loading-screen').style.display = 'flex';
	}

	public loadGLTF(path: string, onLoadingFinished: (gltf: any) => void): void
	{
		let trackerEntry = this.addLoadingEntry(path);

		this.gltfLoader.load(path,
		(gltf)  =>
		{
			onLoadingFinished(gltf);
			this.doneLoading(trackerEntry);
		},
		(xhr) =>
		{
			if ( xhr.lengthComputable )
			{
				trackerEntry.progress = xhr.loaded / xhr.total;
			}
		},
		(error)  =>
		{
			console.error(error);
		});
	}

	public addLoadingEntry(path: string): LoadingTrackerEntry
	{
		let entry = new LoadingTrackerEntry(path);
		this.loadingTracker.push(entry);

		return entry;
	}

	public doneLoading(trackerEntry: LoadingTrackerEntry): void
	{
		trackerEntry.finished = true;
		trackerEntry.progress = 1;

		if (this.isLoadingDone())
		{
			document.getElementById('ui-container').style.display = 'block';
			document.getElementById('loading-screen').style.display = 'none';

			if (this.onFinishedCallback !== undefined) this.onFinishedCallback();
		}
	}

	private getLoadingPercentage(): number
	{
		let done = true;
		let total = 0;
		let finished = 0;

		for (const item of this.loadingTracker)
		{
			total++;
			finished += item.progress;
			if (!item.finished) done = false;
		}

		return (finished / total) * 100;
	}

	private isLoadingDone(): boolean
	{
		for (const entry of this.loadingTracker) {
			if (!entry.finished) return false;
		}
		return true;
	}
}