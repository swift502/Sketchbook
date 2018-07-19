//
// HTML initialization
//

// WebGL not supported
if (!Detector.webgl) Detector.addGetWebGLMessage();

// Renderer
renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Auto window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    effectFXAA.uniforms['resolution'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
    composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
}
window.addEventListener('resize', onWindowResize, false);

// Stats (FPS, Frame time, Memory)
var stats = new Stats();
document.body.appendChild(stats.dom);

/**
 * ParamGUI
 * Initialize user-editable global variables.
 */
function ParamGUI(params) {
    var gui = new dat.GUI();
    gui.add(params, 'FPS_Limit', 0, 60);
    var timeController = gui.add(params, 'Time_Scale', 0, 1).listen();
    var shadowSwitch = gui.add(params, 'Shadows');
    gui.add(params, 'FXAA');
    gui.add(params, 'Auto_Rotate');

    var debug_folder = gui.addFolder('Debug');
    var bd = debug_folder.add(params, 'Spring_Debug');
    var dc = debug_folder.add(params, 'Draw_Capsule');
    var rcd = debug_folder.add(params, 'RayCast_Debug');

    gui.open();
    
    timeController.onChange(function(value) {
        timeScaleTarget = value;
      });

    bd.onChange(function(enabled) {
        if(enabled) {
            sphere.visible =  true;
            sphere2.visible = true;
            sphere3.visible = true;
        }
        else {
            sphere.visible =  false;
            sphere2.visible = false;
            sphere3.visible = false;
        }
    });
    
    dc.onChange(function(enabled) {
        if(enabled) {
            player.characterCapsule.visual.visible =  true;
        }
        else {
            player.characterCapsule.visual.visible =  false;
        }
    });

    rcd.onChange(function(enabled) {
        if(enabled) {
            raycastBox.visible =  true;
        }
        else {
            raycastBox.visible =  false;
        }
    });

    shadowSwitch.onChange(function(enabled) {
        if(enabled) {
            dirLight.castShadow = true;
        }
        else {
            dirLight.castShadow = false;
        }
    });
}

//
// Scene initialization
//

// Fog
// scene.fog = new THREE.FogExp2(0xC8D3D5, 0.25);

// Camera
var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 120);
// camera.position.set(0.3, 0.3, 0.3);

// Scene render pass
var renderScene = new THREE.RenderPass(scene, camera);

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
var composer = new THREE.EffectComposer(renderer);
composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
composer.addPass(renderScene);
composer.addPass(effectFXAA);

// Sky
var sky = new THREE.Sky();
sky.scale.setScalar(100);
scene.add(sky);

// Sun helper
var sun = new THREE.Vector3();
var theta = Math.PI * (-0.3);
var phi = 2 * Math.PI * (-0.25);
sun.x = Math.cos(phi);
sun.y = Math.sin(phi) * Math.sin(theta);
sun.z = Math.sin(phi) * Math.cos(theta);
sky.material.uniforms.sunPosition.value.copy(sun);

// Lighting
var ambientLight = new THREE.AmbientLight(0x888888); // soft white light
scene.add(ambientLight);

// Sun light with shadowmap
var dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.target = player;
dirLight.castShadow = true;
// dirLight.shadow.bias = -0.003;

dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 8;

dirLight.shadow.camera.top = 3;
dirLight.shadow.camera.right = 3;
dirLight.shadow.camera.bottom = -3;
dirLight.shadow.camera.left = -3;

dirLight.shadow.camera
scene.add(dirLight);

// Orbit controls
var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
orbitControls.enableZoom = false;
orbitControls.enablePan = false;
orbitControls.update();

// Helpers
var helper = new THREE.GridHelper(10, 10, 0x000000, 0x000000);
helper.position.set(0, 0.01, 0);
helper.material.opacity = 0.2;
helper.material.transparent = true;
scene.add( helper );
helper = new THREE.AxesHelper(2);
// scene.add( helper );
helper = new THREE.DirectionalLightHelper(dirLight, 3);
// scene.add( helper );
helper = new THREE.CameraHelper(dirLight.shadow.camera);
// scene.add( helper );

