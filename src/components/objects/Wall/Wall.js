import { Group, Vector3, Vector4, Color } from 'three';
import { CustomShader } from 'shaders';
import { PlaneBufferGeometry, MeshBasicMaterial, DoubleSide, Mesh, BoxBufferGeometry, AxesHelper, ShaderMaterial } from 'three';

class Wall extends Group {
    constructor(data) {
        let { width, height, segments, color, wallPos, padding, margin, n, size } = data;
        super();
        let wallGeometry = new PlaneBufferGeometry(width, height, segments);

        var material = new MeshBasicMaterial({ color: color, side: DoubleSide });

        let meshWall = new Mesh(wallGeometry, material);

        this.state = {
            strips: [],
            delta: 0,
            deltaInt: 0,
            decayFactor: 0.92,
            displacement: 0,
            speed: 0.1,
            resting: 0.0
        }

        this.stripNum = n;



        let heightMinusMargins = height - 2 * margin;

        let totHeight = heightMinusMargins - ((n - 1) * padding);
        let boxHeight = totHeight / n;

        let angleSteps = 360.0 / n;
        for (let i = 0; i < n; i++) {
            // add a box at its position of height box Height and width width....
            var geometry = new BoxBufferGeometry(width, boxHeight, 0.3);
            let color = new Color(`hsl(${i * angleSteps}, 100%, 50%)`)

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
                }
            }


            const custom = new CustomShader();
            custom.processUniforms(uniforms);
            let shaderMaterial = new ShaderMaterial({
                vertexShader: custom.vertexShader,
                fragmentShader: custom.fragmentShader,
                uniforms: custom.uniforms,
                side: DoubleSide,

            });


            var cube = new Mesh(geometry, shaderMaterial);


            let startY = (height / 2) - margin - boxHeight / 2;
            let pos = new Vector3();
            pos.y = startY;

            pos.y -= i * boxHeight + i * padding;
            cube.position.set(pos.x, pos.y, pos.z);

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
