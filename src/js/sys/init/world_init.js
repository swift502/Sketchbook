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
                map: new THREE.TextureLoader().load(AP_MODELS + 'credits_sign/credits2.png' ),
                transparent: true
            });
        }
    } );
    object.translateZ(4.5);
    object.translateX(-0.5);
    object.rotateY(Math.PI/2);
    object.children
    scene.add( object );

    object2 = object.clone();
    object2.scale.multiplyScalar(1.7);
    object2.traverse( function ( child ) {
        if(child.name == 'credits') {
            child.material = new THREE.MeshLambertMaterial({
                map: new THREE.TextureLoader().load(AP_MODELS + 'credits_sign/credits.png' ),
                transparent: true
            });
            child.translateZ(-0.2);
        }
        if(child.name == 'sign') {
            child.translateZ(-0.2);
        }
    });
    object2.translateZ(1);
    scene.add(object2);
});