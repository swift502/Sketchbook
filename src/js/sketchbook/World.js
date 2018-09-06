function World() {

    // Characters
    this.characters = [];
    var scope = this;

    //#region HTML
    
    // WebGL not supported
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    // Renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);
    // Global variables

    // Auto window resize
    function onWindowResize() {
        scope.camera.aspect = window.innerWidth / window.innerHeight;
        scope.camera.updateProjectionMatrix();
        scope.renderer.setSize(window.innerWidth, window.innerHeight);
        effectFXAA.uniforms['resolution'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
        scope.composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
    }
    window.addEventListener('resize', onWindowResize, false);

    // Stats (FPS, Frame time, Memory)
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    //#endregion

    //#region THREE

    this.scene = new THREE.Scene();

    // Fog
    // this.scene.fog = new THREE.FogExp2(0xC8D3D5, 0.25);

    // Camera
    this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 120);

    // Scene render pass
    var renderScene = new THREE.RenderPass(this.scene, this.camera);

    // DPR for FXAA
    var dpr = 1;
    if (window.devicePixelRatio !== undefined) {
        dpr = window.devicePixelRatio;
    }
    // FXAA
    var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
    effectFXAA.renderToScreen = true;

    // Composer
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
    this.composer.addPass(renderScene);
    this.composer.addPass(effectFXAA);

    // Sky
    var sky = new THREE.Sky();
    sky.scale.setScalar(100);
    this.scene.add(sky);

    // Sun helper
    this.sun = new THREE.Vector3();
    var theta = Math.PI * (-0.3);
    var phi = 2 * Math.PI * (-0.25);
    this.sun.x = Math.cos(phi);
    this.sun.y = Math.sin(phi) * Math.sin(theta);
    this.sun.z = Math.sin(phi) * Math.cos(theta);
    sky.material.uniforms.sunPosition.value.copy(this.sun);

    // Lighting
    var ambientLight = new THREE.AmbientLight(0x888888); // soft white light
    this.scene.add(ambientLight);

    // Sun light with shadowmap
    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 8;

    this.dirLight.shadow.camera.top = 5;
    this.dirLight.shadow.camera.right = 5;
    this.dirLight.shadow.camera.bottom = -5;
    this.dirLight.shadow.camera.left = -5;

    this.dirLight.shadow.camera;
    this.scene.add(this.dirLight);

    // Helpers
    var helper = new THREE.GridHelper(10, 10, 0x000000, 0x000000);
    helper.position.set(0, 0.01, 0);
    helper.material.opacity = 0.2;
    helper.material.transparent = true;
    this.scene.add( helper );
    helper = new THREE.AxesHelper(2);
    // this.scene.add( helper );
    helper = new THREE.DirectionalLightHelper(this.dirLight, 3);
    // this.scene.add( helper );
    helper = new THREE.CameraHelper(this.dirLight.shadow.camera);
    // this.scene.add( helper );

    //#endregion

    //#region CANNON

    this.physicsWorld = new CANNON.World();
    this.physicsWorld.gravity.set(0,-9.81,0);
    this.physicsWorld.broadphase = new CANNON.NaiveBroadphase();
    this.physicsWorld.solver.iterations = 10;

    this.parallelPairs = [];
    this.physicsFramerate = 1/60;
    this.physicsMaxPrediction = 10;

    //#endregion

    //#region RenderLoop

    this.clock = new THREE.Clock();
    this.delta = 0;
    this.sinceLastFrame = 0;
    this.justRendered = false;

    //#endregion

    //#region Input

    // Input
    // Event listeners
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);
    document.addEventListener("mousedown", mouseDown, false);
    document.addEventListener("mouseup", mouseUp, false);
    document.addEventListener("wheel", mouseWheel, false);

    // Event handlers
    function keyDown(event) {
        if(typeof scope.gameMode !== 'undefined')
            scope.gameMode.handleKey(event, event.key, true);
    }
    function keyUp(event) {
        if(typeof scope.gameMode !== 'undefined')
            scope.gameMode.handleKey(event, event.key, false);
    }
    function mouseDown(event) {
        if(typeof scope.gameMode !== 'undefined')
            scope.gameMode.handleKey(event, 'mouse' + event.button, true);
    }
    function mouseUp(event) {
        if(typeof scope.gameMode !== 'undefined')
            scope.gameMode.handleKey(event, 'mouse' + event.button, false);
    }

    // Changing time scale with scroll wheel
    this.timeScaleBottomLimit = 0.003;
    this.timeScaleChangeSpeed = 1.3;
    this.timeScaleTarget = 1;
    function mouseWheel(event) {

        if(event.deltaY > 0) {
            scope.timeScaleTarget /= scope.timeScaleChangeSpeed;
            if(scope.timeScaleTarget < scope.timeScaleBottomLimit) scope.timeScaleTarget = 0;
        }
        else {
            scope.timeScaleTarget *= scope.timeScaleChangeSpeed;
            if(scope.timeScaleTarget < scope.timeScaleBottomLimit) scope.timeScaleTarget = scope.timeScaleBottomLimit;
            scope.timeScaleTarget = Math.min(scope.timeScaleTarget, 9999999999);
            if(scope.params.Time_Scale > 0.9) scope.params.Time_Scale *= scope.timeScaleChangeSpeed;
        }
    }

    //#endregion
    
    //#region ParamGUI
    
    // Variables
    var params = {
        FPS_Limit: 60,
        Time_Scale: 1,
        Shadows: true,
        FXAA: false,
        Draw_Capsules: false,
        RayCast_Debug: false
    };
    this.params = params;

    var gui = new dat.GUI();
    var graphics_folder = gui.addFolder('Rendering');
    graphics_folder.add(params, 'FPS_Limit', 0, 60);
    var timeController = graphics_folder.add(params, 'Time_Scale', 0, 1).listen();
    var shadowSwitch = graphics_folder.add(params, 'Shadows');
    graphics_folder.add(params, 'FXAA');

    var debug_folder = gui.addFolder('Debug');
    var dc = debug_folder.add(params, 'Draw_Capsules');
    var rcd = debug_folder.add(params, 'RayCast_Debug');

    gui.open();
    
    timeController.onChange(function(value) {
        timeScaleTarget = value;
    });

    dc.onChange(function(enabled) {
        scope.characters.forEach(char => {
            if(enabled) char.characterCapsule.visual.visible = true;
            else        char.characterCapsule.visual.visible = false;
        });
    });

    rcd.onChange(function(enabled) {
        scope.characters.forEach(char => {
            if(enabled) char.raycastBox.visible = true;
            else        char.raycastBox.visible = false;
        });
    });

    shadowSwitch.onChange(function(enabled) {
        if(enabled) {
            scope.dirLight.castShadow = true;
        }
        else {
            scope.dirLight.castShadow = false;
        }
    });

    //#endregion

    this.cameraControls = new CameraControls(this.camera);
    this.gameMode = new GM_FreeCameraControls(this);
    this.loader = new THREE.FBXLoader();
};

World.prototype.ControlCharacter = function(character) {
    this.gameMode = new GM_CharacterControls(this, character);
};

// Update
// Handles all logic updates.
World.prototype.Update = function(timeStep) {

    this.updatePhysics(timeStep);

    this.characters.forEach(char => {
        char.behaviour.update(timeStep);
        char.updateMatrixWorld();
    });

    this.gameMode.update(timeStep);

    // Rotate and position camera according to cameraTarget and angles
    this.cameraControls.update();

    // Lerp timescale parameter
    this.params.Time_Scale = THREE.Math.lerp(this.params.Time_Scale, this.timeScaleTarget, 0.2);
};

/**
 * Render
 * Rendering loop with variable FPS limit.
 * Calls the "Update" function before rendering.
 */
World.prototype.Render = function (World) {

    // Stats begin
    if (this.justRendered) {
        this.justRendered = false;
        this.stats.begin();
    }

    requestAnimationFrame(function() {
        World.Render(World);
    });

    // Measuring time and correcting for variable timeScale
    this.delta = this.clock.getDelta();
    var timeStep = this.delta * this.params.Time_Scale;

    // Logic
    World.Update(timeStep);

    // Frame limiting
    this.sinceLastFrame += this.delta + this.clock.getDelta();
    var interval = 1 / this.params.FPS_Limit;
    if (this.sinceLastFrame > interval) {
        this.sinceLastFrame %= interval;

        // Actual rendering with a FXAA ON/OFF switch
        if (this.params.FXAA) this.composer.render();
        else this.renderer.render(this.scene, this.camera);

        // Stats end
        this.stats.end();
        this.justRendered = true;
    }
};

/**
 * Start
 * Starts sketchbook rendering and logic
 */
World.prototype.Start = function() {
    this.Render(this);
};

/**
 * Adds character to sketchbook
 * @param {Character} character 
 */
World.prototype.AddCharacter = function(character) {

    // Register character
    this.characters.push(character);
    
    // Register physics
    this.physicsWorld.addBody(character.characterCapsule.physical);
    
    // Register capsule visuals
    this.scene.add(character.characterCapsule.visual);
    this.scene.add(character.raycastBox);

    // Register for synchronization
    this.parallelPairs.push(character.characterCapsule);

    // Add to scene
    this.scene.add(character);
};

World.prototype.updatePhysics = function(timeStep) {
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
};	

World.prototype.addParallelBox = function(mass, position, size, friction, visible = true) {

    var mat = new CANNON.Material();
    mat.friction = friction;

    var shape = new CANNON.Box(size);
    shape.material = mat;

    // Add phys sphere
    var physBox = new CANNON.Body({
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
};

World.prototype.addParallelSphere = function(mass, position, radius, friction) {

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
};

World.prototype.createCharacterCapsule = function(mass, position, height, radius, segments, friction) {

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

    return pair;
};

export { World };