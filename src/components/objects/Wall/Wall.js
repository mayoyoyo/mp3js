import { Group, Vector3, Vector4, Color } from 'three';
import { CustomShader } from 'shaders';
import { PlaneBufferGeometry, MeshBasicMaterial, DoubleSide, Mesh, BoxBufferGeometry, AxesHelper, ShaderMaterial } from 'three';

class Wall extends Group {
    constructor(data){
        let {width, height, segments, color, wallPos, padding, margin, n} = data;
        super();
        let wallGeometry = new PlaneBufferGeometry(width, height, segments);

        var material = new MeshBasicMaterial( {color: color, side: DoubleSide});

        let meshWall = new Mesh(wallGeometry, material);

        this.state = {
            strips: [],
            delta: 0
        }

        this.stripNum = n;
        
        

        let heightMinusMargins = height - 2*margin;

        let totHeight = heightMinusMargins - ((n-1) *padding);
        let boxHeight = totHeight / n;

        let angleSteps = 360.0/ n;
        for (let i = 0; i < n; i++){
            // add a box at its position of height box Height and width width....
            var geometry = new BoxBufferGeometry(width, boxHeight, 0.3);
            var material = new MeshBasicMaterial( {color:0x00ff00});
            let color = new Color(`hsl(${i * angleSteps}, 100%, 50%)`)

            let uniforms = {
                color : {
                    type: "v4",
                    value: new Vector4(color.r, color.g, color.b, 1.0)
                },
                delta: {
                    type: "f",
                    value: 0
                },
                intensity: {
                    type: 'f',
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


            var cube = new Mesh(geometry, shaderMaterial);


            let startY = (height/2) - margin - boxHeight/2;
            let pos = new Vector3();
            pos.y = startY;

            pos.y -= i * boxHeight + i * padding;
            cube.position.set(pos.x, pos.y, pos.z);

            this.add(cube);
            this.state.strips.push(cube);
        }

        this.add(meshWall);
        this.position.set(wallPos.x, wallPos.y, wallPos.z);
        this.decayFactor = 0.92;
        this.deltaInt = 0;
    }

    setStripIntensities(intensities) {
        let {strips} = this.state;
        for (let i = 0; i< intensities.length; i++) {
            // set the strip intensity uniform to the value...

            let strip = strips[i];
            let uniforms = strip.material.uniforms;
            uniforms['intensity']['value'] = intensities[i];
        }
    }



    update(timeStamp) {
        let { strips, delta } = this.state;
        this.state.delta = delta + 1; 
        
        this.deltaInt += 1;

        if (this.deltaInt % 3 == 0) {
            strips.forEach((strip) => {
            
                let uniforms = strip.material.uniforms; // gets the uniform to set. 
                let oldVal = uniforms['intensity']['value'];
                oldVal = this.decayFactor* oldVal;
                uniforms['intensity']['value'] = oldVal;
            });
        }
    }
}


        // let vertexDisplacement = new Float32Array(geometry.attributes.position.count);

        // for (let i = 0; i < vertexDisplacement.length; i++) {
        //     vertexDisplacement[i] = Math.random()/10.0;
        // }

        // geometry.setAttribute('vertexDisplacement', new BufferAttribute(vertexDisplacement, 1));
        
        // let shaderMaterial = new ShaderMaterial({
        //     vertexShader:  custom.vertexShader,
        //     fragmentShader: custom.fragmentShader,
        //     uniforms: uniforms,
        //     side: DoubleSide,
        // });
export default Wall;
