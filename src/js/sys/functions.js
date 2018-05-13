
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