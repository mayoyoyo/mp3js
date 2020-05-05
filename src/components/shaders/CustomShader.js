import rawFragmentCode from './fragmentShader.glsl';
import rawVertexCode from './vertexShader.glsl';

import {ShaderChunk, UniformsUtils, UniformsLib} from 'three';

class CustomShader {
    constructor(){
        this.uniforms = {};

        this.fragmentShader = ShaderChunk.common  + rawFragmentCode;
        this.vertexShader = ShaderChunk.common + rawVertexCode;

        UniformsUtils.merge( [UniformsLib['fog'], [this.uniforms]])
    }


    processUniforms(newUniforms) {
        this.uniforms = UniformsUtils.merge( [this.uniforms, newUniforms]);
    }
}


export default CustomShader;
