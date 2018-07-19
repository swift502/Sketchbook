

// Player
player = new Character(new CANNON.Vec3(2, 1, 2));
player.behaviour = new PlayerAI(player);
characters.push(player);
scene.add(player);

var loader = new THREE.FBXLoader();
loader.load(AP_MODELS + 'game_man/game_man.fbx', function ( object ) {

    object.traverse( function ( child ) {
        if ( child.isMesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
        if( child.name == 'game_man') {
            child.material = new THREE.MeshLambertMaterial({
                map: new THREE.TextureLoader().load(AP_MODELS + 'game_man/game_man.png' ),
                skinning: true
            });
        }
    } );

    player.setModel(object);
    player.setModelOffset(new THREE.Vector3(0, -0.1, 0));
    player.setState(CharStates.Idle);
} );

var bobs = [];
for(var i = 0; i < 2; i++) {
    bob = new Character(new CANNON.Vec3(-2, 1, 2));
    bobs.push(bob);
    bob.behaviour = new FollowPlayerAI(bob);
    characters.push(bob);
    scene.add(bob);
}

bobs.forEach(bobik => {
    loader.load(AP_MODELS + 'game_man/game_man.fbx', function ( object ) {

        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
            if( child.name == 'game_man') {
                child.material = new THREE.MeshLambertMaterial({
                    map: new THREE.TextureLoader().load(AP_MODELS + 'game_man/game_man.png' ),
                    skinning: true
                });
            }
        } );
    
        bobik.setModel(object);
        bobik.setModelOffset(new THREE.Vector3(0, -0.1, 0));
        bobik.setState(CharStates.Idle);
    } );
});