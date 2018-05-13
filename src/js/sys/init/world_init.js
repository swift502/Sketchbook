loader.load(AP_MODELS + 'credits_sign/sign.fbx', function ( object ) {

    object.traverse( function ( child ) {
        
        if ( child.isMesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
        if(child.name == 'grass') {
            child.material = new THREE.MeshLambertMaterial({
                map: new THREE.TextureLoader().load(AP_MODELS + 'credits_sign/grass.png' ),
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            });
            child.castShadow = false;
        }
        if(child.name == 'sign') {
            child.material = new THREE.MeshLambertMaterial({
                map: new THREE.TextureLoader().load(AP_MODELS + 'credits_sign/sign.png' )
            });
        }
        if(child.name == 'sign_shadow') {
            child.material = new THREE.MeshLambertMaterial({
                map: new THREE.TextureLoader().load(AP_MODELS + 'credits_sign/sign_shadow.png' ),
                transparent: true,
            });
            child.renderOrder = -1;
        }
        if(child.name == 'credits') {
            child.material = new THREE.MeshLambertMaterial({
                map: new THREE.TextureLoader().load(AP_MODELS + 'credits_sign/credits.png' ),
                transparent: true
            });
        }
    } );

    object.translateZ(4);
    object.rotateY(Math.PI/2);

    // console.log(object);
    scene.add( object );
} );