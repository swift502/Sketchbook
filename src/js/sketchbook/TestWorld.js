// TestWorld = function() {
    
//     // Ground
//     this.addParallelBox(0, new CANNON.Vec3(0, -1, 0), new CANNON.Vec3(5,1,5), 0.3);

//     // Stuff
//     this.addParallelBox(10, new CANNON.Vec3(0, 2, 0), new CANNON.Vec3(1,1,1), 0.3);
//     this.addParallelBox(5, new CANNON.Vec3(3, 1, -3), new CANNON.Vec3(0.5,0.5,0.5), 0.3);
//     this.addParallelBox(3, new CANNON.Vec3(-2.5, 1, -2.5), new CANNON.Vec3(0.3,0.3,0.3), 0.3);

//     // this.addParallelSphere(5, new CANNON.Vec3(1.5, 2, 1.5), 0.3, 0.3);
//     // this.addParallelSphere(5, new CANNON.Vec3(1.5, 2, -1.5), 0.3, 0.3);
//     // this.addParallelSphere(5, new CANNON.Vec3(-1.5, 2, -1.5), 0.3, 0.3);
//     // this.addParallelSphere(5, new CANNON.Vec3(-1.5, 2, 1.5), 0.3, 0.3);
//     // this.addParallelSphere(5, new CANNON.Vec3(0, 2, 1.5), 0.3, 0.3);
//     // this.addParallelSphere(5, new CANNON.Vec3(0, 2, -1.5), 0.3, 0.3);
//     // this.addParallelSphere(5, new CANNON.Vec3(1.5, 2, 0), 0.3, 0.3);
//     // this.addParallelSphere(5, new CANNON.Vec3(-1.5, 2, 0), 0.3, 0.3);

//     var scope = this;

//     this.loader.load(AP_MODELS + 'credits_sign/sign.fbx', function ( object ) {

//         object.traverse( function ( child ) {
            
//             if ( child.isMesh ) {
//                 child.castShadow = true;
//                 child.receiveShadow = true;
//             }
//             if(child.name == 'grass') {
//                 child.material = new THREE.MeshLambertMaterial({
//                     map: new THREE.TextureLoader().load(AP_MODELS + 'credits_sign/grass.png' ),
//                     transparent: true,
//                     depthWrite: false,
//                     side: THREE.DoubleSide
//                 });
//                 child.castShadow = false;
//             }
//             if(child.name == 'sign') {
//                 child.material = new THREE.MeshLambertMaterial({
//                     map: new THREE.TextureLoader().load(AP_MODELS + 'credits_sign/sign.png' )
//                 });
//             }
//             if(child.name == 'sign_shadow') {
//                 child.material = new THREE.MeshLambertMaterial({
//                     map: new THREE.TextureLoader().load(AP_MODELS + 'credits_sign/sign_shadow.png' ),
//                     transparent: true,
//                 });
//                 child.renderOrder = -1;
//             }
//             if(child.name == 'credits') {
//                 child.material = new THREE.MeshLambertMaterial({
//                     map: new THREE.TextureLoader().load(AP_MODELS + 'credits_sign/credits2.png' ),
//                     transparent: true
//                 });
//             }
//         } );
//         object.translateZ(4.5);
//         object.translateX(-0.5);
//         object.rotateY(Math.PI/2);
//         scope.scene.add( object );
//         scope.addParallelBox(0, new CANNON.Vec3(object.position.x, object.position.y + 0.45, object.position.z),
//                             new CANNON.Vec3(0.3, 0.45 ,0.1), 0.3, false);

//         object2 = object.clone();
//         object2.scale.multiplyScalar(1.7);
//         object2.traverse( function ( child ) {
//             if(child.name == 'credits') {
//                 child.material = new THREE.MeshLambertMaterial({
//                     map: new THREE.TextureLoader().load(AP_MODELS + 'credits_sign/credits.png' ),
//                     transparent: true
//                 });
//                 child.translateZ(-0.2);
//             }
//             if(child.name == 'sign') {
//                 child.translateZ(-0.2);
//             }
//         });
//         object2.translateZ(1);
//         scope.scene.add(object2);
//         scope.addParallelBox(0, new CANNON.Vec3(object2.position.x, object2.position.y + 0.58, object2.position.z),
//                             new CANNON.Vec3(0.4, 0.58 ,0.16), 0.3, false);
//     });
// }