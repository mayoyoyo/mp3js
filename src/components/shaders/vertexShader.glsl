/* PROTIPS:
   attribute: per vertex properties that only work in the vertex shader....
   uniform: change outside of the shader like in the main app
   varying: Vars that we can pass from the vertex to fragment shaders...
/* attributes are per vertex properties */ 
attribute float vertexDisplacement;

varying vec3 pos;
varying vec3 norm;
void main() {
  pos = position;
  vec3 pos2 = position;
  norm = normal;
  //vOpacity = vertexDisplacement;
  //vec3 p = position;

  // p.x += sin(vertexDisplacement) * 2.0;
  // p.y += cos(vertexDisplacement) * 2.0;
  

  if (pos2.x < -20.0 && dot(normal, vec3(0.0, 1.0, 0.0)) < 1e-4){
    pos2.y += smoothstep(0.0, 10.0, (-pos.x)/20.0);
    //pos2.y = 3.0;
  }

  vec4 posWRTCam = modelViewMatrix * vec4(pos2, 1.0);
  gl_Position = projectionMatrix * posWRTCam;
}
