// Physics
var gravityConstant = -9.8;
var physicsWorld;
var rigidBodies = [];
var margin = 0.05;
var hinge;
var cloth;
var transformAux1;
var time = 0;
var armMovement = 0;

var cloth;
var sbConfig;
var playerCol;
var updatePhysics;

Ammo().then(function(Ammo) {

    transformAux1 = new Ammo.btTransform();

    var collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    var dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
    var broadphase = new Ammo.btDbvtBroadphase();
    var solver = new Ammo.btSequentialImpulseConstraintSolver();
    var softBodySolver = new Ammo.btDefaultSoftBodySolver();
    physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
    physicsWorld.setGravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
    physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
    // physicsWorld.get_m_sparsesdf().Initialize();
    // console.log(physicsWorld.getWorldInfo());

    function createRigidBody( threeObject, physicsShape, mass, pos, quat ) {
        threeObject.position.copy( pos );
        threeObject.quaternion.copy( quat );
        var transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        var motionState = new Ammo.btDefaultMotionState( transform );
        var localInertia = new Ammo.btVector3( 0, 0, 0 );
        physicsShape.calculateLocalInertia( mass, localInertia );
        var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
        var body = new Ammo.btRigidBody( rbInfo );
        threeObject.userData.physicsBody = body;
        scene.add( threeObject );
        if ( mass > 0 ) {
            rigidBodies.push( threeObject );
            // Disable deactivation
            body.setActivationState( 4 );
        }
        physicsWorld.addRigidBody( body );
    }

    function createParalellepiped( sx, sy, sz, mass, pos, quat, material ) {
        var threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
        var shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
        shape.setMargin( margin );
        createRigidBody( threeObject, shape, mass, pos, quat );
        return threeObject;
    }

    // Ground
    pos = new THREE.Vector3( 0, - 0.5, 0 );
    quat = new THREE.Quaternion( 0, 0, 0, 1 );
    var ground = createParalellepiped( 10, 1, 10, 0, pos, quat, new THREE.MeshLambertMaterial( { color: 0xcccccc } ) );
    ground.castShadow = true;
    ground.receiveShadow = true;

    // Brick
    var brickMass = 0.5;
    var brickLength = 1.2;
    var brickDepth = 0.6;
    var brickHeight = brickLength * 0.5;
    var numBricksLength = 6;
    var numBricksHeight = 8;
    var brick = createParalellepiped( brickDepth, brickHeight, brickLength, brickMass, new THREE.Vector3(2, 1, 0), new THREE.Quaternion(0, 0, 0, 1), new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
    brick.castShadow = true;
    brick.receiveShadow = true;

    // Cloth
    var clothWidth = 4;
    var clothHeight = 3;
    var clothNumSegmentsZ = clothWidth * 5;
    var clothNumSegmentsY = clothHeight * 5;
    var clothSegmentLengthZ = clothWidth / clothNumSegmentsZ;
    var clothSegmentLengthY = clothHeight / clothNumSegmentsY;
    var clothPos = new THREE.Vector3( 2, 3, 2 );
    //var clothGeometry = new THREE.BufferGeometry();
    var clothGeometry = new THREE.PlaneBufferGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );
    clothGeometry.rotateZ( 90 );
    // clothGeometry.translate( clothPos.x, clothPos.y + clothHeight * 0.5, clothPos.z - clothWidth * 0.5 );
    //var clothMaterial = new THREE.MeshLambertMaterial( { color: 0x0030A0, side: THREE.DoubleSide } );
    var clothMaterial = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, side: THREE.DoubleSide } );
    cloth = new THREE.Mesh( clothGeometry, clothMaterial );
    cloth.castShadow = true;
    // cloth.receiveShadow = true;
    scene.add( cloth );

    var softBodyHelpers = new Ammo.btSoftBodyHelpers();
    var clothCorner10 = new Ammo.btVector3( 3, 2, 1 );
    var clothCorner00 = new Ammo.btVector3( 3, 2, -1 );
    var clothCorner01 = new Ammo.btVector3( 1, 2, -1 );
    var clothCorner11 = new Ammo.btVector3( 1, 2, 1 );
    var clothSoftBody = softBodyHelpers.CreatePatch( physicsWorld.getWorldInfo(), clothCorner00, clothCorner01, clothCorner10, clothCorner11, clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 1+2, true );
    sbConfig = clothSoftBody.get_m_cfg();
    sbConfig.set_viterations( 10 );
    sbConfig.set_piterations( 10 );
    // sbConfig.set_timescale(0.1);
    // sbConfig.set_kDP(0.005);
    // clothSoftBody.Config.timescale = 0.01;
    // console.log(clothSoftBody.get_m_cfg());
    clothSoftBody.setTotalMass( 0.9, false );
    Ammo.castObject( clothSoftBody, Ammo.btCollisionObject ).getCollisionShape().setMargin( margin * 2 );
    physicsWorld.addSoftBody( clothSoftBody, 1, -1 );
    cloth.userData.physicsBody = clothSoftBody;
    // Disable deactivation
    // clothSoftBody.setActivationState( 4 );

    // Player
    playerCol = createParalellepiped( 0.5, 1, 0.5, 1, new THREE.Vector3(0, 0.5, 0), new THREE.Quaternion(0, 0, 0, 1), new THREE.MeshPhongMaterial( { color: 0xffffff, wireframe: true } ) );
    playerCol.visible = false;

    var lerp = 0;

    updatePhysics = function( deltaTime ) {

        // Step world
        physicsWorld.stepSimulation( deltaTime );
        // console.log(physicsWorld.b());
    
        lerp += deltaTime;
        if(lerp > 1/60) lerp %= 1/60;


        phys = playerCol.userData.physicsBody;
        t = phys.getWorldTransform();
        t.setOrigin(new Ammo.btVector3(
            player.position.x + new THREE.Vector3().copy(player.orientation).multiplyScalar(player.velocity).x * 0.3,
            player.position.y + 0.5,
            player.position.z + new THREE.Vector3().copy(player.orientation).multiplyScalar(player.velocity).z * 0.3));
        t.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
        phys.setWorldTransform(t);
        // phys.applyCentralImpulse(new Ammo.btVector3(player.velocity.x, player.velocity.y, player.velocity.z));
        // console.log(player.velocity);
        

    
        // Update cloth
        // sbConfig.set_timescale(params.Time_Scale);
        var softBody = cloth.userData.physicsBody;
        var clothPositions = cloth.geometry.attributes.position.array;
        var numVerts = clothPositions.length / 3;
        var nodes = softBody.get_m_nodes();
        var indexFloat = 0;
        for ( var i = 0; i < numVerts; i ++ ) {
            var node = nodes.at( i );
            var nodePos = node.get_m_x();
            var nodeLastPos = node.get_m_q();

            clothPositions[ indexFloat++ ] = THREE.Math.lerp(nodeLastPos.x(), nodePos.x(), lerp / (1/60));
            clothPositions[ indexFloat++ ] = THREE.Math.lerp(nodeLastPos.y(), nodePos.y(), lerp / (1/60));
            clothPositions[ indexFloat++ ] = THREE.Math.lerp(nodeLastPos.z(), nodePos.z(), lerp / (1/60));
    
            // clothPositions[ indexFloat++ ] = nodePos.x();
            // clothPositions[ indexFloat++ ] = nodePos.y();
            // clothPositions[ indexFloat++ ] = nodePos.z();
        }
        cloth.geometry.computeVertexNormals();
        cloth.geometry.attributes.position.needsUpdate = true;
        cloth.geometry.attributes.normal.needsUpdate = true;
    
        //Update rigid bodies
        for ( var i = 0, il = rigidBodies.length; i < il; i++ ) {
            var objThree = rigidBodies[ i ];
            var objPhys = objThree.userData.physicsBody;
            var ms = objPhys.getMotionState();
            if ( ms ) {
                ms.getWorldTransform( transformAux1 );
                var p = transformAux1.getOrigin();
                var q = transformAux1.getRotation();
                objThree.position.set( p.x(), p.y(), p.z() );
                objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
            }
        }
    }

});

