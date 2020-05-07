import * as Dat from 'dat.gui';
import { Scene, Color, Plane } from 'three';
import { SphereBufferGeometry, MeshPhongMaterial, BufferAttribute, Mesh, DoubleSide, ShaderMaterial} from 'three';
import { Flower, IonDrive, Wall, Player, Orb } from 'objects';

import { BasicLights } from 'lights';
import { Vector3 } from 'three';

class SimpleScene extends Scene {
    constructor(onBloomParamsUpdated) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            size: 1,
            offset: 0,
            playerInputs: {left:false, right:false, jumped:false},
            prevOrbZ: 0,
            orbSpeed: 0.4,
            spacing: 7,
            updateList: [],
            color: new Color('white'),
            bloomStrength: 0.7,
            bloomRadius: 0.2,
            bloomThreshold: 0.1,
            speed: 0.1,
            deltaInt: 0
        };

        // Add lights
        const lights = new BasicLights();


        // Add walls
        let width = 60;
        let height = 7;
        let n = 7;

        let wall1 = new Wall({width, height,
                             segments:32, color: 0x000000,
                             wallPos: new Vector3(-width*0.35, 0, this.state.spacing),
                             margin: 0.3, padding: 0.2, n, size: 0.2});
                             
        let wall2 = new Wall({width, height,
                              segments:32, color: 0x000000,
                              wallPos: new Vector3(-width*0.35, 0, -this.state.spacing),
                              margin: 0.3, padding: 0.2, n, size: 0.2});

        let floor = new Floor({width, height:spacing*2,
                               segments:32, colorNum: 0xffd1dc,
                               pos: new Vector3(-width*0.35, -height/2, 0),
                               size: 0.2});

        this.wall1 = wall1;
        this.wall2 = wall2;
        this.floor = floor;
        this.add(wall1, wall2, lights, floor);

        this.addToUpdateList(wall1);
        this.addToUpdateList(wall2);
        this.addToUpdateList(floor);


        // Set background to a nice color
        this.background = new Color(0x001111);


        const ionDrive = new IonDrive(()=>{ });

        let playerPos = new Vector3(2, 0, 0);
        let player = new Player({radius:1.3, segments:1, playerPos:playerPos, skin:ionDrive, bounds:this.state.spacing});
        this.player = player;
        this.addToUpdateList(player);
        this.add(player);
        this.addToUpdateList(ionDrive);


        // Add orbs


        this.orbs = []

        const NUM_STARTING_ORBS = 8;
        this.orbIncrement = 8;
        for (let i = 0; i < NUM_STARTING_ORBS; ++i) {
          let orbXPos = -i * this.orbIncrement;
          let orb = new Orb({xPos: orbXPos, zPrev: this.state.prevOrbZ, speed: this.state.orbSpeed, bounds: this.state.spacing});
          this.addToUpdateList(orb);
          this.add(orb);
          this.orbs.push(orb);

          this.state.prevOrbZ = orb.position.z;
        }


        // now populate the array of attributes



        this.delta = 0;
        this.intDel = 0;
        this.add( player );

        this.addToUpdateList(ionDrive);



        // Populate GUI
        this.state.gui.add(this.state, 'speed', 0, 3).onChange( (val) => {
            this.wall1.setSpeed(val);
            this.wall2.setSpeed(val);
            this.floor.setSpeed(val);
        })
        this.state.gui.add(this.state, 'size', 0, 5).onChange( (val) => { 
            this.wall1.setStripSize(val);
            this.wall2.setStripSize(val);
            this.floor.setSize(val);
        
        });

        this.state.gui.add(this.state, 'offset', 0, 5).onChange( (val) => { 
            this.wall1.setStripOffset(val);
            this.wall2.setStripOffset(val);
        
        });
        this.state.gui.add(this.state, 'bloomStrength', -2, 2).onChange( (val) => { onBloomParamsUpdated('strength', val)})
        this.state.gui.add(this.state, 'bloomRadius', 0, 5).onChange( (val) => { onBloomParamsUpdated('radius', val)})
        this.state.gui.add(this.state, 'bloomThreshold', 0, 1).onChange( (val) => { onBloomParamsUpdated('threshold', val)})
        class ColorGUIHelper {
            constructor(object, prop) {
                this.object = object;
                this.prop = prop;
            }

            get value() {
                return `#${this.object[this.prop].getHexString()}`;
            }

            set value(hexString) {
                /* Logic For setting */
            }
        }

        this.delta = 0;
        this.intDel = 0;

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

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    update(timeStamp) {
        let {updateList, deltaInt} = this.state;

        if (this.state.playerInputs.jumped) {
          this.player.state.jumped = true;
        }

        if (this.state.playerInputs.left) {
          this.player.state.left = true;
        }

        if (this.state.playerInputs.right) {
          this.player.state.right = true;
        }

        // destroy orbs behind the camera / add new ones
        const CAMERA_X = 10;
        while (this.orbs[0] && this.orbs[0].position.x > CAMERA_X) {
            // add new barrier to replace the old one
            let orbXPos = this.orbs[this.orbs.length - 1].position.x - this.orbIncrement;
            const newOrb = new Orb({xPos: orbXPos, zPrev: this.state.prevOrbZ, speed: this.state.orbSpeed, bounds: this.state.spacing});
            this.orbs.push(newOrb);
            this.addToUpdateList(newOrb);
            this.add(newOrb);

            this.state.prevOrbZ = newOrb.position.z;

            // dispose of old orb
            this.orbs.shift();
        }


        if (deltaInt % 60 == 0){
            let newInts = new Float32Array(this.wall1.stripNum);
            for (let i = 0; i < this.wall1.stripNum; i++ ) {
                newInts[i] = Math.random();
            }

            this.wall1.setStripIntensities(newInts);
            this.wall2.setStripIntensities(newInts);
            
        }

        if (deltaInt % (this.getRandomInt(15) + 20) == 0){
            //debugger;
            this.ionDrive.reactToBeat(2);
            //this.floor.setIntensity(0.2);
        }


        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }

        deltaInt += 1;
        this.state = {...this.state, deltaInt};
    }
}

export default SimpleScene;
