Sketchbook.prototype.initCannon = function() {
    // Cannon world
    this.physicsWorld.gravity.set(0,-9.81,0);
    this.physicsWorld.broadphase = new CANNON.NaiveBroadphase();
    this.physicsWorld.solver.iterations = 10;
}

Sketchbook.prototype.updatePhysics = function(timeStep) {
    // Step the physics world
    this.physicsWorld.step(this.physicsFramerate, timeStep, this.physicsMaxPrediction);

    // Sync physics/visuals
    this.parallelPairs.forEach(pair => {

        if(pair.physical.position.y < -1) {	
            pair.physical.position.y = 10;
        }

        if(pair.physical.position.y > 10) {	
            pair.physical.position.y = -1;
        }

        if(pair.physical.position.x > 8) {	
            pair.physical.position.x = -8;
        }

        if(pair.physical.position.x < -8) {	
            pair.physical.position.x = 8;
        }

        if(pair.physical.position.z > 8) {	
            pair.physical.position.z = -8;
        }

        if(pair.physical.position.z < -8) {	
            pair.physical.position.z = 8;
        }

        pair.visual.position.copy(pair.physical.interpolatedPosition);
        pair.visual.quaternion.copy(pair.physical.interpolatedQuaternion);
    });
}	

Sketchbook.prototype.addParallelBox = function(mass, position, size, friction, visible = true) {

    var mat = new CANNON.Material();
    mat.friction = friction;

    var shape = new CANNON.Box(size);
    shape.material = mat;

    // Add phys sphere
    physBox = new CANNON.Body({
        mass: mass,
        position: position,
        shape: shape
        });

    physBox.material = mat;
    this.physicsWorld.addBody(physBox);
    
    // Add visual box
    var geometry = new THREE.BoxGeometry( size.x*2, size.y*2, size.z*2 );
    var material = new THREE.MeshLambertMaterial( { color: 0xcccccc } );
    var visualBox = new THREE.Mesh( geometry, material );
    visualBox.castShadow = true;
    visualBox.receiveShadow = true;
    visualBox.visible = visible;
    this.scene.add( visualBox );

    var pair = {
        physical: physBox,
        visual: visualBox
    };
  
    this.parallelPairs.push(pair);
    return pair;
}

Sketchbook.prototype.addParallelSphere = function(mass, position, radius, friction) {

    var mat = new CANNON.Material();
    mat.friction = friction;

    var shape = new CANNON.Sphere(radius);
    shape.material = mat;

    // Add phys sphere
    var physSphere = new CANNON.Body({
        mass: mass, // kg
        position: position, // m
        shape: shape
    });
    physSphere.material = mat;
    this.physicsWorld.addBody(physSphere);
    
    // Add visual sphere
    var geometry2 = new THREE.SphereGeometry(radius);
    var material2 = new THREE.MeshLambertMaterial( { color: 0xcccccc } );
    var visualSphere = new THREE.Mesh( geometry2, material2 );
    visualSphere.castShadow = true;
    visualSphere.receiveShadow = true;
    this.scene.add( visualSphere );

    var pair = {
      physical: physSphere,
      visual: visualSphere
    };

    this.parallelPairs.push(pair);
    return pair;
}

Sketchbook.prototype.createCharacterCapsule = function(mass, position, height, radius, segments, friction) {

    var mat = new CANNON.Material();
    mat.friction = friction;

    var physicalCapsule = new CANNON.Body({
        mass: mass,
        position: position
    });
    
    // Compound shape
    var sphereShape = new CANNON.Sphere(radius);
    var cylinderShape = new CANNON.Cylinder(radius, radius, height / 2, segments);
    cylinderShape.transformAllPoints(new CANNON.Vec3(), new CANNON.Quaternion(0.707,0,0,0.707));

    // Materials
    physicalCapsule.material = mat;
    sphereShape.material = mat;
    cylinderShape.material = mat;

    physicalCapsule.addShape(sphereShape, new CANNON.Vec3( 0, height / 2, 0));
    physicalCapsule.addShape(sphereShape, new CANNON.Vec3( 0, -height / 2, 0));
    physicalCapsule.addShape(cylinderShape, new CANNON.Vec3( 0, 0, 0));

    var visualCapsule = new THREE.Mesh(
        CapsuleGeometry(radius, height, segments).rotateX(Math.PI/2),
        new THREE.MeshLambertMaterial( { color: 0xcccccc, wireframe: true} )
    );

    var pair = {
        physical: physicalCapsule,
        visual: visualCapsule
      };

    // // Register physics
    // if(autoRegister) this.physicsWorld.addBody(physicalCapsule);
    // // Register visuals
    // if(autoRegister) this.scene.add(visualCapsule);
    // // Register for synchronization
    // if(autoRegister) this.parallelPairs.push(pair);

    return pair;
}