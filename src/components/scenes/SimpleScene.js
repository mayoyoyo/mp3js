import * as Dat from 'dat.gui';
import { Scene, Color, Plane } from 'three';
import { SphereBufferGeometry, MeshPhongMaterial, BufferAttribute, Mesh, DoubleSide, ShaderMaterial} from 'three';
import { Flower, IonDrive, Wall, Player } from 'objects';

import { BasicLights } from 'lights';
import { CustomShader } from 'shaders'
import { Vector4, Vector3, PlaneBufferGeometry, Box3, AxesHelper} from 'three';

class SimpleScene extends Scene {
    constructor(onBloomParamsUpdated) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 0,
            playerInputs: {left:false, right:false, jumped:false},
            updateList: [],
            color: new Color('white'),
            bloomStrength: 0.7,
            bloomRadius: 0.2,
            bloomThreshold: 0.1,
        };

        const lights = new BasicLights();


        //this.add( new AxesHelper(3));



        let width = 40;
        let height = 7;
        let spacing = 7;
        let n = 7;
        let wall1 = new Wall({width: width, height:height, segments:32, color: 0x000000, wallPos: new Vector3(-width*0.35, 0, spacing), margin: 0.3, padding: 0.2, n:n});
        let wall2 = new Wall({width: width, height:height, segments:32, color: 0x000000, wallPos: new Vector3(-width*0.35, 0, -spacing), margin: 0.3, padding: 0.2, n:n});

        this.wall1 = wall1;
        this.wall2 = wall2;
        this.add(wall1, wall2, lights);

        this.addToUpdateList(wall1);
        this.addToUpdateList(wall2);


        // Set background to a nice color
        this.background = new Color(0x001111);

        // Add player

        const ionDrive = new IonDrive(()=>{
            // let bb = new Box3().setFromObject(ionDrive);
            // let size = bb.getSize();
            // ionDrive.position.y -= height/2 - size.y/2;
        });


        let playerPos = new Vector3(0, 0, 0);
        let player = new Player({radius:1, segments:16, playerPos:playerPos});
        this.player = player;
        this.player.add(ionDrive);
        this.addToUpdateList(player);


        // now populate the array of attributes

        class ColorGUIHelper {
            constructor(object, prop) {
                this.object = object;
                this.prop = prop;
            }

            get value() {
                return `#${this.object[this.prop].getHexString()}`;
            }

            set value(hexString) {
                debugger;
                // this.object[this.prop].set(hexString);
                // let colorAsVec4 = new Vector4(  this.object[this.prop].r,
                //                                 this.object[this.prop].g,
                //                                 this.object[this.prop].b, 1.0);
                // this.object['uniforms']['color_dark']['value'] = colorAsVec4
            }
        }

        this.delta = 0;
        this.intDel = 0;
        this.add( player );

        this.addToUpdateList(ionDrive);
        //this.add( sphere );

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
        this.state.gui.add(this.state, 'bloomStrength', -2, 2).onChange( (val) => { onBloomParamsUpdated('strength', val)})
        this.state.gui.add(this.state, 'bloomRadius', 0, 5).onChange( (val) => { onBloomParamsUpdated('radius', val)})
        this.state.gui.add(this.state, 'bloomThreshold', 0, 1).onChange( (val) => { onBloomParamsUpdated('threshold', val)})
        this.state.gui.addColor(new ColorGUIHelper(this.state, 'color'), 'value').name('color')
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        this.delta += 0.1;
        const { rotationSpeed, updateList, uniforms } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // uniforms.delta.value = 0.5 + Math.sin(this.delta) * 0.5;

        if (this.state.playerInputs.jumped) {
          this.player.state.jumped = true;
        }

        if (this.state.playerInputs.left) {
          this.player.state.left = true;
        }

        if (this.state.playerInputs.right) {
          this.player.state.right = true;
        }

        this.intDel += 1;
        if (this.intDel % 30 == 0){
        //     let vertexDisplacement = new Float32Array(this.geometry.attributes.position.count);
        //     for (let i = 0; i < vertexDisplacement.length; i++) {
        //         vertexDisplacement[i] = Math.random()/5.0;
        //     }

        //     this.geometry.setAttribute('vertexDisplacement', new BufferAttribute(vertexDisplacement, 1));
        // }
            let newInts = new Float32Array(this.wall1.stripNum);
            for (let i = 0; i < this.wall1.stripNum; i++ ) {
                newInts[i] = Math.random();
            }

            this.wall1.setStripIntensities(newInts);
            this.wall2.setStripIntensities(newInts);
        }


        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SimpleScene;
