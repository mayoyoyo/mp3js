/* PROTIPS:
   attribute: per vertex properties that only work in the vertex shader....
   uniform: change outside of the shader like in the main app
   varying: Vars that we can pass from the vertex to fragment shaders...
/* attributes are per vertex properties */ 

#extension GL_OES_standard_derivatives : enable


uniform vec4 color;
uniform float intensity;
uniform float size;
uniform float offset;
uniform float stripHeight;
uniform vec4 nextColor;
uniform vec3 origin;

varying vec3 pos;
varying vec3 norm;

void main() {
  vec2 coord = vec2(pos.x - offset, pos.z) * size ;
  float offsetVal = (origin.y - pos.y )/stripHeight + 0.5; 

  // Compute anti-aliased world-space grid lines
  vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float line; 
  if (dot(norm, vec3(0, 1, 0)) < 1e-2) {
    line = min(grid.x, grid.y);
  }
  else {
    line = grid.x;
  }

  gl_FragColor = vec4(vec3(1.0 - min(line, 1.0)), 1.0);

  vec4 interpColor = mix(color, nextColor, offsetVal);
  vec4 res = gl_FragColor + interpColor * intensity;

  float fallOff = (pos.x + 63.0) / 80.0;
  fallOff = 1.0 - smoothstep(0.0, 1.0, fallOff);
  fallOff = 0.0 + (fallOff - 0.0) * (0.2 - 0.0) / (1.0 - 0.0);

  
  

  //gl_FragColor = interpColor;
  // 
  vec3 color = vec3(min(res.r + fallOff, 1.0), min(res.g + fallOff, 1.0), min(res.b + fallOff, 1.0));
  gl_FragColor = vec4( color, 1.0);
}