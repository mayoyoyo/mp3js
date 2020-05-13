import { Group, Vector3, Vector4, Color, AdditiveBlending, NormalBlending, SrcColorFactor } from 'three';
import { CustomShader } from 'shaders';
import { PlaneBufferGeometry, MeshBasicMaterial, DoubleSide, Mesh, BoxBufferGeometry, AxesHelper, ShaderMaterial } from 'three';

class Wall extends Group {
    constructor(data) {
        let { width, height, segments, color, wallPos, padding, margin, n, size, shrek } = data;
        super();
        let wallGeometry = new PlaneBufferGeometry(width, height, segments);

        var material = new MeshBasicMaterial({ color: color, side: DoubleSide });

        let meshWall = new Mesh(wallGeometry, material);

        this.state = {
            strips: [],
            delta: 0,
            deltaInt: 0,
            decayFactor: 0.75,
            displacement: 0,
            speed: 0.1,
            resting: 0.15
        }

        this.stripNum = n;
        this.shrek = shrek;


        let heightMinusMargins = height - 2 * margin;

        let totHeight = heightMinusMargins - ((n - 1) * padding);
        let boxHeight = totHeight / n;

        let angleSteps = 360.0 / n;
        let colors = [];
        if (shrek) {
            let col1 = new Color(0xD3CCA5);
            let col2 = new Color(0xC3BC95);
            let col3 = new Color(0x523213);
            let col4 = new Color(0x795A2D);
            let col5 = new Color(0xD5DE2E);
            let col6 = new Color(0xB0C400);
            for (let i = 0; i < 6; i++) {
                colors.push(col1);
            }
            for (let i = 0; i < 6; i++) {
                colors.push(col2);
            }
            for (let i = 0; i < 6; i++) {
                colors.push(col3);
            }
            for (let i = 0; i < 6; i++) {
                colors.push(col4);
            }
            for (let i = 0; i < 4; i++) {
                colors.push(col5);
            }
            for (let i = 0; i < 4; i++) {
                colors.push(col6);
            }
        }
        else {
            for (let i = 0; i < n; i++) {
                let color = new Color(`hsl(${(n - 1 - i) * angleSteps}, 100%, 50%)`)
                colors.push(color);
            }
        }

        for (let i = 0; i < n; i++) {
            // add a box at its position of height box Height and width width....
            var geometry = new BoxBufferGeometry(width, boxHeight, 0.3);
            let color = colors[i];
            let nextColor = /*colors[i];*/i + 1 < n ? colors[i + 1] : colors[i];

            let uniforms = {
                color: {
                    type: "v4",
                    value: new Vector4(color.r, color.g, color.b, 1.0)
                },
                intensity: {
                    type: 'f',
                    value: this.state.resting
                },
                size: {
                    type: "f",
                    value: size
                },
                offset: {
                    type: "f",
                    value: 0
                },
                nextColor: {
                    type: "v4",
                    value: new Vector4(nextColor.r, nextColor.g, nextColor.b, 1.0)
                },
                stripHeight: {
                    type: "f",
                    value: boxHeight
                }
            }


            const custom = new CustomShader();
            custom.processUniforms(uniforms);
            let shaderMaterial = new ShaderMaterial({
                vertexShader: custom.vertexShader,
                fragmentShader: custom.fragmentShader,
                uniforms: custom.uniforms,
                side: DoubleSide,
                blending: NormalBlending,
                blendSrc: SrcColorFactor

            });


            var cube = new Mesh(geometry, shaderMaterial);


            let startY = (height / 2) - margin - boxHeight / 2;
            let pos = new Vector3();
            pos.y = startY;

            pos.y -= i * boxHeight + i * padding;
            cube.position.set(pos.x, pos.y, pos.z);

            uniforms["origin"] = {
                type: 'v3',
                value: pos
            }

            this.add(cube);
            this.state.strips.push(cube);
        }

        this.add(meshWall);
        this.position.set(wallPos.x, wallPos.y, wallPos.z);
    }

    setStripIntensities(intensities) {
        let { strips } = this.state;
        for (let i = 0; i < intensities.length; i++) {
            // set the strip intensity uniform to the value...

            let strip = strips[i];
            let uniforms = strip.material.uniforms;
            uniforms['intensity']['value'] = intensities[i];
        }
    }

    setStripSize(size) {
        let { strips } = this.state;

        for (let i = 0; i < strips.length; i++) {
            let strip = strips[i];
            let uniforms = strip.material.uniforms;
            uniforms['size']['value'] = size;
        }
    }

    setStripOffset(size) {
        let { strips } = this.state;

        for (let i = 0; i < strips.length; i++) {
            let strip = strips[i];
            let uniforms = strip.material.uniforms;
            uniforms['offset']['value'] = size;
        }
    }

    setSpeed(newSpeed) {
        this.state.speed = newSpeed;
    }

    update(timeStamp) {
        let { strips, delta, deltaInt, decayFactor, speed } = this.state;


        if (deltaInt % 2 == 0) {
            strips.forEach((strip) => {
                let uniforms = strip.material.uniforms; // gets the uniform to set. 
                let oldVal = uniforms['intensity']['value'];
                oldVal = Math.max(this.state.resting, decayFactor * oldVal);
                uniforms['intensity']['value'] = oldVal;
            });


        }

        this.setStripOffset(this.state.delta);

        deltaInt += 1;
        delta += speed;
        // takes everything in state and then adds deltaInt and delta (overwritting it);
        this.state = { ...this.state, deltaInt, delta };
    }
}
export default Wall;
