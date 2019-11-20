import * as THREE from 'three';
import * as CANNON from 'cannon';
import { quickhull } from './THREE.quickhull';

var PI_2 = Math.PI / 2;

var Type = {
  BOX: 'Box',
  CYLINDER: 'Cylinder',
  SPHERE: 'Sphere',
  HULL: 'ConvexPolyhedron',
  MESH: 'Trimesh'
};

/**
 * Given a THREE.Object3D instance, creates a corresponding CANNON shape.
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
export const threeToCannon = function (object, options) {
  options = options || {};

  var geometry;

  if (options.type === Type.BOX) {
    return createBoundingBoxShape(object);
  } else if (options.type === Type.CYLINDER) {
    return createBoundingCylinderShape(object, options);
  } else if (options.type === Type.SPHERE) {
    return createBoundingSphereShape(object, options);
  } else if (options.type === Type.HULL) {
    return createConvexPolyhedron(object);
  } else if (options.type === Type.MESH) {
    geometry = getGeometry(object);
    return geometry ? createTrimeshShape(geometry) : null;
  } else if (options.type) {
    throw new Error('[CANNON.threeToCannon] Invalid type "%s".', options.type);
  }

  geometry = getGeometry(object);
  if (!geometry) return null;

  var type = geometry.metadata
    ? geometry.metadata.type
    : geometry.type;

  switch (type) {
    case 'BoxGeometry':
    case 'BoxBufferGeometry':
      return createBoxShape(geometry);
    case 'CylinderGeometry':
    case 'CylinderBufferGeometry':
      return createCylinderShape(geometry);
    case 'PlaneGeometry':
    case 'PlaneBufferGeometry':
      return createPlaneShape(geometry);
    case 'SphereGeometry':
    case 'SphereBufferGeometry':
      return createSphereShape(geometry);
    case 'TubeGeometry':
    case 'Geometry':
    case 'BufferGeometry':
      return createBoundingBoxShape(object);
    default:
      console.warn('Unrecognized geometry: "%s". Using bounding box as shape.', geometry.type);
      return createBoxShape(geometry);
  }
};

threeToCannon.Type = Type;

/******************************************************************************
 * Shape construction
 */

 /**
  * @param  {THREE.Geometry} geometry
  * @return {CANNON.Shape}
  */
 function createBoxShape (geometry) {
   var vertices = getVertices(geometry);

   if (!vertices.length) return null;

   geometry.computeBoundingBox();
   var box = geometry.boundingBox;
   return new CANNON.Box(new CANNON.Vec3(
     (box.max.x - box.min.x) / 2,
     (box.max.y - box.min.y) / 2,
     (box.max.z - box.min.z) / 2
   ));
 }

/**
 * Bounding box needs to be computed with the entire mesh, not just geometry.
 * @param  {THREE.Object3D} mesh
 * @return {CANNON.Shape}
 */
function createBoundingBoxShape (object) {
  var shape, localPosition,
      box = new THREE.Box3();

  var clone = object.clone();
  clone.quaternion.set(0, 0, 0, 1);
  clone.updateMatrixWorld();

  box.setFromObject(clone);

  if (!isFinite(box.min.lengthSq())) return null;

  shape = new CANNON.Box(new CANNON.Vec3(
    (box.max.x - box.min.x) / 2,
    (box.max.y - box.min.y) / 2,
    (box.max.z - box.min.z) / 2
  ));

  localPosition = box.translate(clone.position.negate()).getCenter(new THREE.Vector3());
  if (localPosition.lengthSq()) {
    shape.offset = localPosition;
  }

  return shape;
}

/**
 * Computes 3D convex hull as a CANNON.ConvexPolyhedron.
 * @param  {THREE.Object3D} mesh
 * @return {CANNON.Shape}
 */
function createConvexPolyhedron (object) {
  var i, vertices, faces, hull,
      eps = 1e-4,
      geometry = getGeometry(object);

  if (!geometry || !geometry.vertices.length) return null;

  // Perturb.
  for (i = 0; i < geometry.vertices.length; i++) {
    geometry.vertices[i].x += (Math.random() - 0.5) * eps;
    geometry.vertices[i].y += (Math.random() - 0.5) * eps;
    geometry.vertices[i].z += (Math.random() - 0.5) * eps;
  }

  // Compute the 3D convex hull.
  hull = quickhull(geometry);

  // Convert from THREE.Vector3 to CANNON.Vec3.
  vertices = new Array(hull.vertices.length);
  for (i = 0; i < hull.vertices.length; i++) {
    vertices[i] = new CANNON.Vec3(hull.vertices[i].x, hull.vertices[i].y, hull.vertices[i].z);
  }

  // Convert from THREE.Face to Array<number>.
  faces = new Array(hull.faces.length);
  for (i = 0; i < hull.faces.length; i++) {
    faces[i] = [hull.faces[i].a, hull.faces[i].b, hull.faces[i].c];
  }

  return new CANNON.ConvexPolyhedron(vertices, faces);
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createCylinderShape (geometry) {
  var shape,
      params = geometry.metadata
        ? geometry.metadata.parameters
        : geometry.parameters;
  shape = new CANNON.Cylinder(
    params.radiusTop,
    params.radiusBottom,
    params.height,
    params.radialSegments
  );

  // Include metadata for serialization.
  shape._type = CANNON.Shape.types.CYLINDER; // Patch schteppe/cannon.js#329.
  shape.radiusTop = params.radiusTop;
  shape.radiusBottom = params.radiusBottom;
  shape.height = params.height;
  shape.numSegments = params.radialSegments;

  shape.orientation = new CANNON.Quaternion();
  shape.orientation.setFromEuler(THREE.Math.degToRad(90), 0, 0, 'XYZ').normalize();
  return shape;
}

/**
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
function createBoundingCylinderShape (object, options) {
  var shape, height, radius,
      box = new THREE.Box3(),
      axes = ['x', 'y', 'z'],
      majorAxis = options.cylinderAxis || 'y',
      minorAxes = axes.splice(axes.indexOf(majorAxis), 1) && axes;

  box.setFromObject(object);

  if (!isFinite(box.min.lengthSq())) return null;

  // Compute cylinder dimensions.
  height = box.max[majorAxis] - box.min[majorAxis];
  radius = 0.5 * Math.max(
    box.max[minorAxes[0]] - box.min[minorAxes[0]],
    box.max[minorAxes[1]] - box.min[minorAxes[1]]
  );

  // Create shape.
  shape = new CANNON.Cylinder(radius, radius, height, 12);

  // Include metadata for serialization.
  shape._type = CANNON.Shape.types.CYLINDER; // Patch schteppe/cannon.js#329.
  shape.radiusTop = radius;
  shape.radiusBottom = radius;
  shape.height = height;
  shape.numSegments = 12;

  shape.orientation = new CANNON.Quaternion();
  shape.orientation.setFromEuler(
    majorAxis === 'y' ? PI_2 : 0,
    majorAxis === 'z' ? PI_2 : 0,
    0,
    'XYZ'
  ).normalize();
  return shape;
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createPlaneShape (geometry) {
  geometry.computeBoundingBox();
  var box = geometry.boundingBox;
  return new CANNON.Box(new CANNON.Vec3(
    (box.max.x - box.min.x) / 2 || 0.1,
    (box.max.y - box.min.y) / 2 || 0.1,
    (box.max.z - box.min.z) / 2 || 0.1
  ));
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createSphereShape (geometry) {
  var params = geometry.metadata
    ? geometry.metadata.parameters
    : geometry.parameters;
  return new CANNON.Sphere(params.radius);
}

/**
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
function createBoundingSphereShape (object, options) {
  if (options.sphereRadius) {
    return new CANNON.Sphere(options.sphereRadius);
  }
  var geometry = getGeometry(object);
  if (!geometry) return null;
  geometry.computeBoundingSphere();
  return new CANNON.Sphere(geometry.boundingSphere.radius);
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {CANNON.Shape}
 */
function createTrimeshShape (geometry) {
  var indices,
      vertices = getVertices(geometry);

  if (!vertices.length) return null;

  indices = Object.keys(vertices).map(Number);
  return new CANNON.Trimesh(vertices, indices);
}

/******************************************************************************
 * Utils
 */

/**
 * Returns a single geometry for the given object. If the object is compound,
 * its geometries are automatically merged.
 * @param {THREE.Object3D} object
 * @return {THREE.Geometry}
 */
function getGeometry (object) {
  var matrix, mesh,
      meshes = getMeshes(object),
      tmp = new THREE.Geometry(),
      combined = new THREE.Geometry();

  if (meshes.length === 0) return null;

  // Apply scale  – it can't easily be applied to a CANNON.Shape later.
  if (meshes.length === 1) {
    var position = new THREE.Vector3(),
        quaternion = new THREE.Quaternion(),
        scale = new THREE.Vector3();
    if (meshes[0].geometry.isBufferGeometry) {
      if (meshes[0].geometry.attributes.position
          && meshes[0].geometry.attributes.position.itemSize > 2) {
        tmp.fromBufferGeometry(meshes[0].geometry);
      }
    } else {
      tmp = meshes[0].geometry.clone();
    }
    tmp.metadata = meshes[0].geometry.metadata;
    meshes[0].updateMatrixWorld();
    meshes[0].matrixWorld.decompose(position, quaternion, scale);
    return tmp.scale(scale.x, scale.y, scale.z);
  }

  // Recursively merge geometry, preserving local transforms.
  while ((mesh = meshes.pop())) {
    mesh.updateMatrixWorld();
    if (mesh.geometry.isBufferGeometry) {
      if (mesh.geometry.attributes.position
          && mesh.geometry.attributes.position.itemSize > 2) {
        var tmpGeom = new THREE.Geometry();
        tmpGeom.fromBufferGeometry(mesh.geometry);
        combined.merge(tmpGeom, mesh.matrixWorld);
        tmpGeom.dispose();
      }
    } else {
      combined.merge(mesh.geometry, mesh.matrixWorld);
    }
  }

  matrix = new THREE.Matrix4();
  matrix.scale(object.scale);
  combined.applyMatrix(matrix);
  return combined;
}

/**
 * @param  {THREE.Geometry} geometry
 * @return {Array<number>}
 */
function getVertices (geometry) {
  if (!geometry.attributes) {
    geometry = new THREE.BufferGeometry().fromGeometry(geometry);
  }
  return (geometry.attributes.position || {}).array || [];
}

/**
 * Returns a flat array of THREE.Mesh instances from the given object. If
 * nested transformations are found, they are applied to child meshes
 * as mesh.userData.matrix, so that each mesh has its position/rotation/scale
 * independently of all of its parents except the top-level object.
 * @param  {THREE.Object3D} object
 * @return {Array<THREE.Mesh>}
 */
function getMeshes (object) {
  var meshes = [];
  object.traverse(function (o) {
    if (o.type === 'Mesh') {
      meshes.push(o);
    }
  });
  return meshes;
}
