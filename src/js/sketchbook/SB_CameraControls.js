
function CameraControls(camera) {

    var scope = this;

    this.camera = camera;
    this.target = new THREE.Vector3();

    this.radius = 3;
    this.theta = 0;
    this.phi = 0;

    this.onMouseDownPosition = new THREE.Vector2();
    this.onMouseDownTheta = this.theta;
    this.onMouseDownPhi = this.phi;

    document.addEventListener( 'mousedown', onMouseDown, false );

    function onMouseDown(event) {
        scope.onMouseDownPosition = new THREE.Vector2(event.clientX, event.clientY);
        scope.onMouseDownTheta = scope.theta;
        scope.onMouseDownPhi = scope.phi;

        document.addEventListener( 'mousemove', onMouseMove, false );
        document.addEventListener( 'mouseup', onMouseUp, false );
    }

    function onMouseMove(event) {
        scope.theta = -((event.clientX - scope.onMouseDownPosition.x) * 0.5) + scope.onMouseDownTheta;
        scope.phi = ((event.clientY - scope.onMouseDownPosition.y) * 0.5) + scope.onMouseDownPhi;
        scope.phi = Math.min( 179, Math.max( -179, scope.phi ) );
    }

    function onMouseUp(event) {
        document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
    }
}

CameraControls.prototype.setRadius = function(value) {
    this.radius = Math.max( 0.001, value );
}

CameraControls.prototype.update = function() {
    this.camera.position.x = this.target.x + this.radius * Math.sin( this.theta * Math.PI / 360 ) * Math.cos( this.phi * Math.PI / 360 );
    this.camera.position.y = this.target.y + this.radius * Math.sin( this.phi * Math.PI / 360 );
    this.camera.position.z = this.target.z + this.radius * Math.cos( this.theta * Math.PI / 360 ) * Math.cos( this.phi * Math.PI / 360 );
    this.camera.updateMatrix();
    this.camera.lookAt(this.target);
}