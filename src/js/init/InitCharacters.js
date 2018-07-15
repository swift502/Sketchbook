

// Player
var player = new Character(new CANNON.Vec3(2, 1, 2));
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
for(var i = 0; i < 10; i++) {
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

    // var bob2 = new Character(new CANNON.Vec3(-2, 1, 3));
    // bob2.behaviour = new FollowPlayerAI(bob2);
    // characters.push(bob2);
    // scene.add(bob2);

    // loader.load(AP_MODELS + 'game_man/game_man.fbx', function ( object ) {

    //     object.traverse( function ( child ) {
    //         if ( child.isMesh ) {
    //             child.castShadow = true;
    //             child.receiveShadow = true;
    //         }
    //         if( child.name == 'game_man') {
    //             child.material = new THREE.MeshLambertMaterial({
    //                 map: new THREE.TextureLoader().load(AP_MODELS + 'game_man/game_man.png' ),
    //                 skinning: true
    //             });
    //         }
    //     } );
    
    //     bob2.setModel(object);
    //     bob2.setModelOffset(new THREE.Vector3(0, -0.1, 0));
    //     bob2.setState(CharStates.Idle);
    // } );

    // var bob3 = new Character(new CANNON.Vec3(-2, 1, 3));
    // bob3.behaviour = new FollowPlayerAI(bob3);
    // characters.push(bob3);
    // scene.add(bob3);

    // loader.load(AP_MODELS + 'game_man/game_man.fbx', function ( object ) {

    //     object.traverse( function ( child ) {
    //         if ( child.isMesh ) {
    //             child.castShadow = true;
    //             child.receiveShadow = true;
    //         }
    //         if( child.name == 'game_man') {
    //             child.material = new THREE.MeshLambertMaterial({
    //                 map: new THREE.TextureLoader().load(AP_MODELS + 'game_man/game_man.png' ),
    //                 skinning: true
    //             });
    //         }
    //     } );
    
    //     bob3.setModel(object);
    //     bob3.setModelOffset(new THREE.Vector3(0, -0.1, 0));
    //     bob3.setState(CharStates.Idle);
    // } );

    // var bob4 = new Character(new CANNON.Vec3(-2, 1, 3));
    // bob4.behaviour = new FollowPlayerAI(bob4);
    // characters.push(bob4);
    // scene.add(bob4);

    // loader.load(AP_MODELS + 'game_man/game_man.fbx', function ( object ) {

    //     object.traverse( function ( child ) {
    //         if ( child.isMesh ) {
    //             child.castShadow = true;
    //             child.receiveShadow = true;
    //         }
    //         if( child.name == 'game_man') {
    //             child.material = new THREE.MeshLambertMaterial({
    //                 map: new THREE.TextureLoader().load(AP_MODELS + 'game_man/game_man.png' ),
    //                 skinning: true
    //             });
    //         }
    //     } );
    
    //     bob4.setModel(object);
    //     bob4.setModelOffset(new THREE.Vector3(0, -0.1, 0));
    //     bob4.setState(CharStates.Idle);
    // } );

    // var bob5 = new Character(new CANNON.Vec3(-2, 1, 3));
    // bob5.behaviour = new FollowPlayerAI(bob5);
    // characters.push(bob5);
    // scene.add(bob5);

    // loader.load(AP_MODELS + 'game_man/game_man.fbx', function ( object ) {

    //     object.traverse( function ( child ) {
    //         if ( child.isMesh ) {
    //             child.castShadow = true;
    //             child.receiveShadow = true;
    //         }
    //         if( child.name == 'game_man') {
    //             child.material = new THREE.MeshLambertMaterial({
    //                 map: new THREE.TextureLoader().load(AP_MODELS + 'game_man/game_man.png' ),
    //                 skinning: true
    //             });
    //         }
    //     } );
    
    //     bob5.setModel(object);
    //     bob5.setModelOffset(new THREE.Vector3(0, -0.1, 0));
    //     bob5.setState(CharStates.Idle);
    // } );

// loader.load(AP_MODELS + 'game_man/game_man.fbx', function ( object ) {

//     object.traverse( function ( child ) {
//         if ( child.isMesh ) {
//             child.castShadow = true;
//             child.receiveShadow = true;
//         }
//         if( child.name == 'game_man') {
//             child.material = new THREE.MeshLambertMaterial({
//                 map: new THREE.TextureLoader().load(AP_MODELS + 'game_man/game_man.png' ),
//                 skinning: true
//             });
//         }
//     } );

//     bob.setModel(object);
//     bob.setModelOffset(new THREE.Vector3(0, -0.1, 0));
//     bob.setState(CharStates.Idle);
// } );