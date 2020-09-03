const THREE = require('three');

export let NewGrassShader = {

    uniforms: THREE.UniformsUtils.merge( [
        THREE.UniformsLib.common,
        THREE.UniformsLib.lights,
    ] ),
  
    vertexShader:
    `
    varying vec3 vLightFront;
    varying vec3 vIndirectFront;

    #include <common>
    #include <bsdfs>
    #include <lights_pars_begin>

    void main()	{
        #include <beginnormal_vertex>
        #include <defaultnormal_vertex>

        #include <begin_vertex>
        #include <project_vertex>
	    #include <lights_lambert_vertex>
      }
    `,

    fragmentShader: 
    `
    varying vec3 vLightFront;
    varying vec3 vIndirectFront;

    #include <common>
    #include <lights_pars_begin>
    #include <bsdfs>

      void main() {
  
        vec3 diffuse = vec3(1.0, 1.0, 1.0);

        vec4 diffuseColor = vec4( diffuse, 1.0 );
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );

        reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );
        reflectedLight.indirectDiffuse += vIndirectFront;
        reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );

        reflectedLight.directDiffuse = vLightFront;
        reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );

        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;

        gl_FragColor = vec4( outgoingLight, diffuseColor.a );
  
        #include <tonemapping_fragment>
      }
    `
  };