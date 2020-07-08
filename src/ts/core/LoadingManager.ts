import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SkeletonUtils } from '../../lib/utils/SkeletonUtils';
import { WelcomeScreen} from "./WelcomeScreen";

export class LoadingManager
{
    public printProgress: boolean = false;
    public welcomeScreen: WelcomeScreen;
    private gltfLoader: GLTFLoader;
    private loadingTracker: {} = {};

    // private cache: {} = {};

    constructor()
    {
        this.gltfLoader = new GLTFLoader();
        this.welcomeScreen = new WelcomeScreen();
    }

    public loadGLTF(path: string, onLoadingFinished: (gltf: any) => void): void
    {
        // if (path in this.cache)
        // {
        //     let clone = SkeletonUtils.clone(this.cache[path]);
        //     onLoadingFinished(clone);

        //     console.log('cache');
        // }
        // else
        // {
            this.startLoading(path);

            this.gltfLoader.load(path,
            (gltf)  =>
            {
                // this.cache[path] = gltf;

                onLoadingFinished(gltf);
                this.doneLoading(path);
                // console.log('new');
            },
            (xhr) =>
            {
                if (this.printProgress)
                {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                }
            },
            (error)  =>
            {
                console.error(error);
            });
        // }
    }

    public startLoading(path: string): void
    {
        this.loadingTracker[path] = true;
        document.getElementById('loader').style.display = 'flex';
        document.getElementById('ui-container').style.display = 'none';
    }

    public doneLoading(path: string): void
    {
        this.loadingTracker[path] = false;
        let done = true;
        for (const key in this.loadingTracker) {
            if (this.loadingTracker.hasOwnProperty(key)) {
                const stillLoading = this.loadingTracker[key];
                if (stillLoading) done = false;
            }
        }

        if (done)
        {
            // Hide loader
            document.getElementById('loader').style.display = 'none';
            document.getElementById('ui-container').style.display = 'block';

            // Display Start Button
            this.welcomeScreen.displayStartBtn();
        }
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