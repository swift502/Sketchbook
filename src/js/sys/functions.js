
//
// Simulation
//

function bounce(source, dest, velocity, mass, damping) {
    var acceleration = dest - source;
    acceleration /= mass;
    velocity += acceleration;
    velocity *= damping;

    var position = source += velocity;

    return { position: position, velocity: velocity };
}

function bounceV(source, dest, velocity, mass, damping) {
    var acceleration = new THREE.Vector3().subVectors(dest, source);
    acceleration.divideScalar(mass);
    velocity.add(acceleration);
    velocity.multiplyScalar(damping);
    source.add(velocity);
}

//
// Geometry
//

const CapsuleGeometry = (radius = 1, height = 2, N = 32) => {
    const geometry = new THREE.Geometry();
    const TWOPI = Math.PI*2;
  
    const PID2 = 1.570796326794896619231322;
  
    const normals = [];
  
    // top cap
    for(let i = 0; i <= N/4; i++){
      for(let j = 0; j <= N; j++){
        let theta = j * TWOPI / N;
        let phi = -PID2 + Math.PI * i / (N/2);
        let vertex = new THREE.Vector3();
        let normal = new THREE.Vector3();
        vertex.x = radius * Math.cos(phi) * Math.cos(theta);
        vertex.y = radius * Math.cos(phi) * Math.sin(theta);
        vertex.z = radius * Math.sin(phi);
        vertex.z -= height/2;
        normal.x = vertex.x;
        normal.y = vertex.y;
        normal.z = vertex.z;
        geometry.vertices.push(vertex);
        normals.push(normal);
      }
    }
  
    // bottom cap
    for(let i = N/4; i <= N/2; i++){
      for(let j = 0; j <= N; j++){
        let theta = j * TWOPI / N;
        let phi = -PID2 + Math.PI * i / (N/2);
        let vertex = new THREE.Vector3();
        let normal = new THREE.Vector3();
        vertex.x = radius * Math.cos(phi) * Math.cos(theta);
        vertex.y = radius * Math.cos(phi) * Math.sin(theta);
        vertex.z = radius * Math.sin(phi);
        vertex.z += height/2;
        normal.x = vertex.x;
        normal.y = vertex.y;
        normal.z = vertex.z;
        geometry.vertices.push(vertex);
        normals.push(normal);
      }
    }
  
    for(let i = 0; i <= N/2; i++){
      for(let j = 0; j < N; j++){
        let vec = new THREE.Vector4(
          i         * ( N + 1 ) +   j       ,
          i         * ( N + 1 ) + ( j + 1 ) ,
          ( i + 1 ) * ( N + 1 ) + ( j + 1 ) ,
          ( i + 1 ) * ( N + 1 ) +   j
        );
  
        if(i==N/4){
          let face_1 = new THREE.Face3(vec.x,vec.y,vec.z,[ //ok
            normals[vec.x],
            normals[vec.y],
            normals[vec.z]
          ]);
  
          let face_2 = new THREE.Face3(vec.x,vec.z,vec.w,[
            normals[vec.x],
            normals[vec.z],
            normals[vec.w]
          ]);
  
          geometry.faces.push(face_2);
          geometry.faces.push(face_1);
        }else{
          let face_1 = new THREE.Face3(vec.x,vec.y,vec.z,[
            normals[vec.x],
            normals[vec.y],
            normals[vec.z]
          ]);
  
          let face_2 = new THREE.Face3(vec.x,vec.z,vec.w,[
            normals[vec.x],
            normals[vec.z],
            normals[vec.w]
          ]);
  
          geometry.faces.push(face_1);
          geometry.faces.push(face_2);
        }
      }
      // if(i==(N/4)) break; // N/4 is when the center segments are solved
    }
  
    geometry.computeFaceNormals();
    // geometry.computeVertexNormals();
  
    return geometry;
  }

//
// Physics
//

function addParallelBox(mass, position, size, friction) {

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
    physicsWorld.addBody(physBox);
    
    // Add visual box
    var geometry = new THREE.BoxGeometry( size.x*2, size.y*2, size.z*2 );
    var material = new THREE.MeshLambertMaterial( { color: 0xcccccc } );
    var visualBox = new THREE.Mesh( geometry, material );
    scene.add( visualBox );

    var pair = {
        physical: physBox,
        visual: visualBox
    };
  
    parallelPairs.push(pair);
    return pair;
}

function addParallelSphere(mass, position, radius, friction) {

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
    physicsWorld.addBody(physSphere);
    
    // Add visual sphere
    var geometry2 = new THREE.SphereGeometry(radius);
    var material2 = new THREE.MeshLambertMaterial( { color: 0xcccccc } );
    var visualSphere = new THREE.Mesh( geometry2, material2 );
    scene.add( visualSphere );

    var pair = {
      physical: physSphere,
      visual: visualSphere
    };

    parallelPairs.push(pair);
    return pair;
}

function addParallelCapsule(mass, position, height, radius, segments, friction) {

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
    physicsWorld.addBody(physicalCapsule);

    var visualCapsule = new THREE.Mesh(
        CapsuleGeometry(radius, height, segments).rotateX(Math.PI/2),
        new THREE.MeshLambertMaterial( { color: 0xcccccc, wireframe: true} )
    );
    scene.add(visualCapsule);

    var pair = {
        physical: physicalCapsule,
        visual: visualCapsule
      };

    parallelPairs.push(pair);
    return pair;
}