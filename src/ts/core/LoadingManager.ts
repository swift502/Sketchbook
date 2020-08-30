import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SkeletonUtils } from '../../lib/utils/SkeletonUtils';
import { World } from './World';
import { LoadingTrackerEntry } from './LoadingTrackerEntry';
import { SpringSimulator } from '../physics/spring_simulation/SpringSimulator';

export class LoadingManager
{
	public firstLoad: boolean = true;

	private gltfLoader: GLTFLoader;
	private loadingTracker: LoadingTrackerEntry[] = [];
	private world: World;
	private progressBarSimulator: SpringSimulator;
	// private cache: {} = {};

	constructor(world: World)
	{
		this.gltfLoader = new GLTFLoader();
		this.progressBarSimulator = new SpringSimulator(60, 10, 0.6);

		this.world = world;

		document.getElementById('loading-screen').style.display = 'flex';
	}

	public loadGLTF(path: string, onLoadingFinished: (gltf: any) => void): void
	{
		// Experimental model caching
		// if (path in this.cache)
		// {
		//     let clone = SkeletonUtils.clone(this.cache[path]);
		//     onLoadingFinished(clone);

		//     console.log('cache');
		// }
		// else
		// {

			// console.log("new entry! " + path);
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
		// }
	}

	public addLoadingEntry(path: string): LoadingTrackerEntry
	{
		this.world.setTimeScale(0);
		document.getElementById('start-btn').style.opacity = '0';

		let entry = new LoadingTrackerEntry(path);
		this.loadingTracker.push(entry);

		document.getElementById('loader').style.display = 'flex';
		document.getElementById('ui-container').style.display = 'none';

		return entry;
	}

	public doneLoading(trackerEntry: LoadingTrackerEntry): void
	{
		trackerEntry.finished = true;
		trackerEntry.progress = 1;

		if (this.isLoadingDone())
		{
			if (!this.firstLoad)
			{
				document.getElementById('ui-container').style.display = 'block';
				document.getElementById('loading-screen').style.display = 'none';
				this.world.setTimeScale(1);
			}

			this.loadingTracker = [];
			document.getElementById('loader').style.display = 'none';
			// Display Start Button
			this.world.loadingScreen.displayStartBtn();
		}
	}

	public update(timeStep: number): void
	{
		let percentage = this.getLoadingPercentage();
		this.progressBarSimulator.target = percentage;
		this.progressBarSimulator.simulate(timeStep);

		document.getElementById('progress-bar').style.width = this.progressBarSimulator.position + '%';

		let text = '';

		for (const item of this.loadingTracker)
		{
			text += item.path + (item.finished ? ' finished' : ' loading...') + '\n';
		}

		if (document.getElementById('progress-text').innerText !== text)
		{
			document.getElementById('progress-text').innerText = text;
		}

		this.world.loadingScreen.displayStartBtn();
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

	// public cloneGltf(gltf)
	// {
	//     const clone = {
	//       animations: gltf.animations,
	//       scene: gltf.scene.clone(true)
	//     };

	//     const skinnedMeshes = {};

	//     gltf.scene.traverse(node => {
	//       if (node.isSkinnedMesh) {
	//         skinnedMeshes[node.name] = node;
	//       }
	//     });

	//     const cloneBones = {};
	//     const cloneSkinnedMeshes = {};

	//     clone.scene.traverse(node => {
	//       if (node.isBone) {
	//         cloneBones[node.name] = node;
	//       }
	
	//       if (node.isSkinnedMesh) {
	//         cloneSkinnedMeshes[node.name] = node;
	//       }
	//     });

	//     for (const key in object) {
	//         if (object.hasOwnProperty(key)) {
	//             const element = object[key];
				
	//         }
	//     }

	//     for (const name in skinnedMeshes)
	//     {
	//         if (skinnedMeshes.hasOwnProperty(name))
	//         {
	//             const skinnedMesh = skinnedMeshes[name];
	//             const skeleton = skinnedMesh.skeleton;
	//             const cloneSkinnedMesh = cloneSkinnedMeshes[name];
			
	//             const orderedCloneBones = [];
			
	//             for (let i = 0; i < skeleton.bones.length; ++i) {
	//                 const cloneBone = cloneBones[skeleton.bones[i].name];
	//                 orderedCloneBones.push(cloneBone);
	//             }
			
	//             cloneSkinnedMesh.bind(
	//                 new Skeleton(orderedCloneBones, skeleton.boneInverses),
	//                 cloneSkinnedMesh.matrixWorld);
	//         }
	//     }

	//     return clone;
	// }
}