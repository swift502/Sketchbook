


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

/**
 * Constructs a 2D matrix from first vector, replacing the Y axes with the global Y axis,
 * and applies this matrix to the second vector. Saves performance when compared to full 3D matrix application.
 * Useful for character rotation, as it only happens on the Y axis.
 * @param {Vector3} a Vector to construct 2D matrix from
 * @param {Vector3} b Vector to apply basis to
 */
function appplyVectorMatrixXZ(a, b) {
    return new THREE.Vector3(a.x * b.z + a.z * b.x, 0,
                             a.z * b.z + -a.x * b.x);
}

//
// Other
//

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function getGlobalProperties(prefix) {
    var keyValues = [], global = window; // window for browser environments
    for (var prop in global) {
      if (prop.indexOf(prefix) == 0) // check the prefix
        keyValues.push(prop /*+ "=" + global[prop]*/);
    }
    return keyValues; // build the string
  }