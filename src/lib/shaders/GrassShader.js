/**
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
 * Node.js module implementation by Danila Loginov https://loginov.rocks
 */

const THREE = require('three');

export let GrassShader = {

    uniforms: {
        // map: { value: texture },
        // alphaMap: { value: alphaMap },
        // time: { type: 'float', value: 0 }
    },
  
    vertexShader: `
    // precision mediump float;
    // uniform mat4 modelViewMatrix;
    // uniform mat4 projectionMatrix;
    // uniform mat4 modelMatrix;
    uniform vec3 playerPos;
    // attribute vec3 position;
    attribute vec3 offset;
    // attribute vec2 uv;
    attribute vec4 orientation;
    attribute float halfRootAngleSin;
    attribute float halfRootAngleCos;
    attribute float stretch;
    uniform float time;
    varying vec2 vUv;
    varying float frc;
    
    //WEBGL-NOISE FROM https://github.com/stegu/webgl-noise
    
    //Description : Array and textureless GLSL 2D simplex noise function. Author : Ian McEwan, Ashima Arts. Maintainer : stegu Lastmod : 20110822 (ijm) License : Copyright (C) 2011 Ashima Arts. All rights reserved. Distributed under the MIT License. See LICENSE file. https://github.com/ashima/webgl-noise https://github.com/stegu/webgl-noise
    
    vec3 mod289(vec3 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;} vec2 mod289(vec2 x) {return x - floor(x * (1.0 / 289.0)) * 289.0;} vec3 permute(vec3 x) {return mod289(((x*34.0)+1.0)*x);} float snoise(vec2 v){const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439); vec2 i  = floor(v + dot(v, C.yy) ); vec2 x0 = v -   i + dot(i, C.xx); vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod289(i); vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 )); vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); m = m*m ; m = m*m ; vec3 x = 2.0 * fract(p * C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox; m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ); vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw; return 130.0 * dot(m, g);}
    //END NOISE
    
    //https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
    vec3 rotateVectorByQuaternion( vec3 v, vec4 q){
      return 2.0 * cross(q.xyz, v * q.w + cross(q.xyz, v)) + v;
    }

    vec4 vectorToQuaternion(vec3 v){
        float c1 = cos(v.y / 2.0);
        float c2 = cos(v.x / 2.0);
        float c3 = cos(v.z / 2.0);
        float s1 = sin(v.y / 2.0);
        float s2 = sin(v.x / 2.0);
        float s3 = sin(v.z / 2.0);

        float c1c2 = c1 * c2;
        float s1s2 = s1 * s2;

        float w = c1c2 * c3 - s1s2 * s3;
        float x = c1c2 * s3 + s1s2 * c3;
        float y = s1 * c2 * c3 + c1 * s2 * s3;
        float z = c1 * s2 * c3 - s1 * c2 * s3;

        return vec4(-x, y, z, w);
    }
    
    //https://en.wikipedia.org/wiki/Slerp
    vec4 slerp(vec4 v0, vec4 v1, float t) {
      // Only unit quaternions are valid rotations.
      // Normalize to avoid undefined behavior.
      normalize(v0);
      normalize(v1);
    
      // Compute the cosine of the angle between the two vectors.
      float dot_ = dot(v0, v1);
    
      // If the dot product is negative, slerp won't take
      // the shorter path. Note that v1 and -v1 are equivalent when
      // the negation is applied to all four components. Fix by 
      // reversing one quaternion.
      if (dot_ < 0.0) {
        v1 = -v1;
        dot_ = -dot_;
      }  
    
      const float DOT_THRESHOLD = 0.9995;
      if (dot_ > DOT_THRESHOLD) {
        // If the inputs are too close for comfort, linearly interpolate
        // and normalize the result.
    
        vec4 result = t*(v1 - v0) + v0;
        normalize(result);
        return result;
      }
    
      // Since dot is in range [0, DOT_THRESHOLD], acos is safe
      float theta_0 = acos(dot_);       // theta_0 = angle between input vectors
      float theta = theta_0*t;          // theta = angle between v0 and result
      float sin_theta = sin(theta);     // compute this value only once
      float sin_theta_0 = sin(theta_0); // compute this value only once
    
      float s0 = cos(theta) - dot_ * sin_theta / sin_theta_0;  // == sin(theta_0 - theta) / sin(theta_0)
      float s1 = sin_theta / sin_theta_0;
    
      return (s0 * v0) + (s1 * v1);
    }
    
    void main() {
    
      //Relative position of vertex along the mesh Y direction

      frc = position.y/float(0.2);
    
      //Get wind data from simplex noise 
      float noise = 1.0-(snoise(vec2(((time*0.35)-offset.x/10.0), ((time*0.35)-offset.z/10.0)))); 
    
      //Define the direction of an unbent blade of grass rotated around the Y axis
      vec4 direction = vec4(0.0, halfRootAngleSin, 0.0, halfRootAngleCos);
    
      //Interpolate between the unbent direction and the direction of growth calculated on the CPU. 
      //Using the relative location of the vertex along the Y axis as the weight, we get a smooth bend
      direction = slerp(direction, orientation, frc);
      vec3 vPosition = vec3(position.x, position.y + position.y * stretch, position.z);
      vPosition = rotateVectorByQuaternion(vPosition, direction);

      float halfAngle = noise * 0.15;
      vec4 windAngle = normalize(vec4(sin(halfAngle), 0.0, -sin(halfAngle), cos(halfAngle)));

      vec3 vObjectPosition = (modelMatrix * vec4( 0.0, 0.0, 0.0, 1.0 )).xyz;
      vec3 playerLookVector = playerPos - (vObjectPosition + offset);
      vec3 distortionAngle = normalize(vec3(playerLookVector.x, 0.0, playerLookVector.z));

      float distortionInfluence = clamp(1.0 - length(playerLookVector), 0.0, 1.0) * 2.3;

      vec4 angle = mix(windAngle, vectorToQuaternion(distortionAngle), pow(distortionInfluence, 2.0));
      vPosition = rotateVectorByQuaternion(vPosition, angle);

      //UV for texture
      vUv = uv;
    
      //Calculate final position of the vertex from the world offset and the above shenanigans 
      gl_Position = projectionMatrix * modelViewMatrix * vec4(offset + vPosition, 1.0 );
    }`,
  
    fragmentShader: 
    `
    // precision mediump float;
    uniform sampler2D map;
    uniform sampler2D alphaMap;
    varying vec2 vUv;
    varying float frc;

    void main() {
    //Get transparency information from alpha map
    float alpha = texture2D(alphaMap, vUv).r;
    //If transparent, don't draw
    if(alpha < 0.15){
        discard;
    }
    //Get colour data from texture
    vec4 col = vec4(texture2D(map, vUv));
    //Add more green towards root
    col = mix(vec4(0.0, 0.6, 0.0, 1.0), col, frc);
    //Add a shadow towards root
    col = mix(vec4(0.0, 0.1, 0.0, 1.0), col, frc);
    gl_FragColor = col;

    #if defined( TONE_MAPPING )
      gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
    #endif

    }`
  };