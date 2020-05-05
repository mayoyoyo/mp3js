/* PROTIPS:
   attribute: per vertex properties that only work in the vertex shader....
   uniform: change outside of the shader like in the main app
   varying: Vars that we can pass from the vertex to fragment shaders...
/* attributes are per vertex properties */ 


uniform vec4 color;
uniform float intensity;

void main() {
  vec4 newColor = color * intensity;

  gl_FragColor = vec4(newColor.rgb, 1.0);

}