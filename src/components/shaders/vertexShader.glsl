/* PROTIPS:
   attribute: per vertex properties that only work in the vertex shader....
   uniform: change outside of the shader like in the main app
   varying: Vars that we can pass from the vertex to fragment shaders...
/* attributes are per vertex properties */ 
attribute float vertexDisplacement;

varying vec3 pos;
varying vec4 posWRTCam;
void main() {
  pos = position;
  //vOpacity = vertexDisplacement;
  //vec3 p = position;

  // p.x += sin(vertexDisplacement) * 2.0;
  // p.y += cos(vertexDisplacement) * 2.0;
  posWRTCam = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * posWRTCam;
}
