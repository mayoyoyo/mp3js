import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Floor, IonDrive, Wall, Player } from 'objects';

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
            updateList: [],
            color: new Color('white'),
            bloomStrength: 0.7,
            bloomRadius: 0.2,
            bloomThreshold: 0.1,
            speed: 0.1,
            deltaInt: 0
        };

        const lights = new BasicLights();


        //this.add( new AxesHelper(3));



        let width = 60;
        let height = 7;
        let spacing = 7;
        let n = 7;
        let wall1 = new Wall({width, height,
                             segments:32, color: 0x000000,
                             wallPos: new Vector3(-width*0.35, 0, spacing),
                             margin: 0.3, padding: 0.2, n, size: 0.2});
                             
        let wall2 = new Wall({width, height,
                              segments:32, color: 0x000000,
                              wallPos: new Vector3(-width*0.35, 0, -spacing),
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

        // Add player

        const ionDrive = new IonDrive(()=>{ });


        let playerPos = new Vector3(0, 0, 0);
        let player = new Player({radius:1, segments:16, playerPos:playerPos});
        this.player = player;
        this.player.add(ionDrive);
        this.ionDrive = ionDrive;
        this.addToUpdateList(player);


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
