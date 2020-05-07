/* PROTIPS:
   attribute: per vertex properties that only work in the vertex shader....
   uniform: change outside of the shader like in the main app
   varying: Vars that we can pass from the vertex to fragment shaders...
/* attributes are per vertex properties */ 
#extension GL_OES_standard_derivatives : enable


uniform vec4 color;
uniform float intensity;
varying vec3 pos;
varying vec4 posWRTCam;

uniform float size;
uniform float offset;

void main() {

  vec2 coord = vec2(pos.x - offset, pos.z + 0.5) * size ;

  // Compute anti-aliased world-space grid lines
  vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float line = min(grid.x, grid.y);

  gl_FragColor = vec4(vec3(1.0 - min(line, 1.0)), 1.0);

  float val = mod(floor(pos.x), 2.0);
  //gl_FragColor = vec4(val, val, val, 1.0); 
  vec4 res = gl_FragColor + color * intensity;
  gl_FragColor = vec4( min(res.r, 1.0), min(res.g, 1.0), min(res.b, 1.0), 1.0);
}