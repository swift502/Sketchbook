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
    player.setState(new CS_Idle(player));
} );