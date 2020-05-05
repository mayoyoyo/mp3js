/* PROTIPS:
   attribute: per vertex properties that only work in the vertex shader....
   uniform: change outside of the shader like in the main app
   varying: Vars that we can pass from the vertex to fragment shaders...
/* attributes are per vertex properties */ 
attribute float vertexDisplacement;
void main() {
  //vUv = position;
  //vOpacity = vertexDisplacement;
  //vec3 p = position;

  // p.x += sin(vertexDisplacement) * 2.0;
  // p.y += cos(vertexDisplacement) * 2.0;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
