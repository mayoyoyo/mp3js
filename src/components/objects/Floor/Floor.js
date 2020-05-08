import { Group, Vector3, Vector4, Color, MeshPhongMaterial } from 'three';
import { CustomShader } from 'shaders';
import { PlaneBufferGeometry, MeshBasicMaterial, DoubleSide, Mesh, BoxBufferGeometry, AxesHelper, ShaderMaterial } from 'three';
import MODEL from './mountains.glb';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
class Floor extends Group {
    constructor(data){
        let {width, height, segments, colorNum, pos, size} = data;
        super();
        let floorGeom = new PlaneBufferGeometry(width, height, segments);
        floorGeom.rotateX(Math.PI/2);
        this.state = {
            delta: 0,
            displacement: 0,
            speed: 0.1,
            deltaInt: 0,
            decayFactor: 0.999
        }

        //let color = new Color(`hsl(${0}, 100%, 50%)`)
        let color = new Color(colorNum);
        let uniforms = {
            color : {
                type: "v4",
                value: new Vector4(color.r, color.g, color.b, 1.0)
            },
            intensity: {
                type: 'f',
                value: 1.0
            }, 
            size:{ 
                type: "f",
                value: size
            },
            offset: {
                type: "f",
                value: 0
            }
        }
        
        const custom = new CustomShader();
        custom.processUniforms(uniforms);
        let shaderMaterial = new ShaderMaterial({
            vertexShader:  custom.vertexShader,
            fragmentShader: custom.fragmentShader,
            uniforms: custom.uniforms,
            side: DoubleSide,
            
        });
        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {
            gltf.scene.scale.set(0.05, 0.05, 0.05);
            gltf.scene.position.set(8, 0, -35);
            gltf.scene.rotateY(Math.PI/2);

            for (let i = 0; i < 4; i++) {
                let m = gltf.scene.getObjectByName(`mesh_${i}`);
                if (i%2 == 0){
                    m.material = new MeshBasicMaterial({color: colorNum})
                } else {
                    m.material = new MeshPhongMaterial({emissive:0xffffff})
                }   
            }
            this.add(gltf.scene);
        });

        let floor = new Mesh(floorGeom, shaderMaterial);
        this.floor = floor;
        this.add(floor);
        this.position.set(pos.x, pos.y, pos.z);
    }

    setIntensity(val) {
        let uniforms = this.floor.material.uniforms;
        uniforms['intensity']['value'] = val;
    }

    getIntensity() {
        let uniforms = this.floor.material.uniforms;
        return uniforms['intensity']['value'];
    }

    setSize(size) {
        let uniforms = this.floor.material.uniforms;
        uniforms['size']['value'] = size;
    }

    setOffset(offset) {
        let uniforms = this.floor.material.uniforms;
        uniforms['offset']['value'] = offset;
    }

    setSpeed(newSpeed) {
        this.state.speed = newSpeed;
    }


    update(timeStamp) {
        let {delta, speed, deltaInt, decayFactor} = this.state;
        
        if (deltaInt % 3 == 0) {
            let oldVal = this.getIntensity();
            oldVal = Math.max(0.05, decayFactor * oldVal)
            this.setIntensity(oldVal);
        }
        
        this.setOffset(this.state.delta);

        delta += speed;
        // takes everything in state and then adds deltaInt and delta (overwritting it);
        this.state = { ...this.state, delta };
    
    }
}
export default Floor;
