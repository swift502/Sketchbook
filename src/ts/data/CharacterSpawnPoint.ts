import { ISpawnPoint } from '../interfaces/ISpawnPoint';
import * as THREE from 'three';
import { World } from '../core/World';
import { Character } from '../characters/Character';

export class CharacterSpawnPoint implements ISpawnPoint
{
    private object: THREE.Object3D;

    constructor(object: THREE.Object3D)
    {
        this.object = object;
    }
    
    public spawn(world: World): void
    {
        world.loadingManager.loadGLTF('build/assets/boxman.glb', (model) =>
        {
            let player = new Character(model);
            
            let worldPos = new THREE.Vector3();
            this.object.getWorldPosition(worldPos);
            player.setPosition(worldPos.x, worldPos.y, worldPos.z);
            
            world.add(player);
            player.setOrientation(new THREE.Vector3(1, 0, 0), true);
            player.takeControl();
        });
    }
}