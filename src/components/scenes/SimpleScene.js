// import * as Dat from 'dat.gui';
import { Scene, Color, Plane, SphereGeometry, MeshBasicMaterial } from 'three';
import { SphereBufferGeometry, MeshPhongMaterial, BufferAttribute, Mesh, DoubleSide, ShaderMaterial } from 'three';
import { IonDrive, Wall, Floor, Player, Orb, Powerup } from 'objects';
import { AudioData } from 'music';
import { BasicLights } from 'lights';
import { Vector3 } from 'three';

class SimpleScene extends Scene {
    constructor(onBloomParamsUpdated) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            // gui: new Dat.GUI(), // Create GUI for scene
            paused: true,
            size: 1,
            offset: 0,
            playerDodge: false,
            playerInputs: { left: false, right: false, jumped: false },
            prevOrbZ: 0,
            score: 0,
            powerup: "",
            powerupTimer: 0,
            powerupRecharge: 50,
            orbsCollected: 0,
            redOrbsCollected: 0,
            orbsMissed: 0,
            spacing: 15,
            updateList: [],
            color: new Color('white'),
            bloomStrength: 0.7,
            bloomRadius: 0.2,
            bloomThreshold: 0.1,
            speed: 0,
            deltaInt: 0,
            avgFreq: 1,
            cameraAngle: "ViewOne"
        };

        // audio frequency data
        this.audiodata = new AudioData([], []);

        // Add lights
        const lights = new BasicLights();


        // Add walls
        let width = 80;
        let height = 12;
        let n = 32;
        this.strips = n;
        // Set background to a nice color
        this.background = new Color(0x4A677F);
        let wall1 = new Wall({
            width, height,
            segments: 32, color: 0x000000,
            wallPos: new Vector3(-width * 0.35, 0, this.state.spacing),
            margin: 0.3, padding: 0.0, n, size: 0.2
        });

        let wall2 = new Wall({
            width, height,
            segments: 32, color: 0x000000,
            wallPos: new Vector3(-width * 0.35, 0, -this.state.spacing),
            margin: 0.3, padding: 0.0, n, size: 0.2
        });

        let floor = new Floor({
            width, height: this.state.spacing * 2,
            segments: 32, colorNum: 0x000022,
            pos: new Vector3(-width * 0.35, -height / 2, 0),
            size: 0.2
        });

        this.wall1 = wall1;
        this.wall2 = wall2;
        this.floor = floor;
        this.wall1.setSpeed(this.state.speed);
        this.wall2.setSpeed(this.state.speed);
        this.floor.setSpeed(this.state.speed);
        let sunGeom = new SphereBufferGeometry(60, 32, 32);
        let sunMat = new MeshBasicMaterial({ color: 0x56467F })
        let sun = new Mesh(sunGeom, sunMat);
        sun.position.set(-250, 80, -20);
        this.add(wall1, wall2, lights, floor, sun);

        this.addToUpdateList(wall1);
        this.addToUpdateList(wall2);
        this.addToUpdateList(floor);

        // Add player

        const ionDrive = new IonDrive(() => { });

        let playerPos = new Vector3(-0.8, 0, 0);
        let player = new Player({ radius: 1.4, segments: 1, playerPos: playerPos, ionDrive: ionDrive, bounds: this.state.spacing - 6, scene: this });
        this.player = player;
        this.addToUpdateList(player);
        this.add(player);
        this.addToUpdateList(ionDrive);


        // Add initial placeholder orbs
        this.orbs = []

        this.numStartingOrbs = 8;
        this.orbIncrement = 8;

        this.initializeOrbs(this.numStartingOrbs, this.orbIncrement);

        // Add powerups
        this.powerups = [];


        // now populate the array of attributes

        this.delta = 0;
        this.intDel = 0;
        this.add(player);
        this.ionDrive = ionDrive;
        this.addToUpdateList(ionDrive);


        // Populate GUI
        // this.state.gui.add(this.state, 'speed', 0, 3).onChange((val) => {
        //     this.wall1.setSpeed(val);
        //     this.wall2.setSpeed(val);
        //     this.floor.setSpeed(val);
        //     this.state.speed = val;
        //     for (let i = 0; i < this.orbs.length; i++) this.orbs[i].state.speed = val;
        // })
        // this.state.gui.add(this.state, 'size', 0, 5).onChange((val) => {
        //     this.wall1.setStripSize(val);
        //     this.wall2.setStripSize(val);
        //     this.floor.setSize(val);
        //
        // });
        //
        // this.state.gui.add(this.state, 'offset', 0, 5).onChange((val) => {
        //     this.wall1.setStripOffset(val);
        //     this.wall2.setStripOffset(val);
        //
        // });
        // this.state.gui.add(this.state, 'bloomStrength', -2, 2).onChange((val) => { onBloomParamsUpdated('strength', val) })
        // this.state.gui.add(this.state, 'bloomRadius', 0, 5).onChange((val) => { onBloomParamsUpdated('radius', val) })
        // this.state.gui.add(this.state, 'bloomThreshold', 0, 1).onChange((val) => { onBloomParamsUpdated('threshold', val) })
        // class ColorGUIHelper {
        //     constructor(object, prop) {
        //         this.object = object;
        //         this.prop = prop;
        //     }
        //
        //     get value() {
        //         return `#${this.object[this.prop].getHexString()}`;
        //     }
        //
        //     set value(hexString) {
        //         /* Logic For setting */
        //     }
        // }
        //
        // this.state.gui.addColor(new ColorGUIHelper(this.state, 'color'), 'value').name('color')
    }

    // reset orbs
    initializeOrbs(numOrbs, increment) {
      // remove any existing orbs from scene
      for (let i = 0; i < this.orbs.length; i++) this.remove(this.orbs[i]);
      this.orbs = [];

      for (let i = 0; i < numOrbs; ++i) {
          let orbXPos = -i * increment;
          let orb = new Orb({ xPos: orbXPos, zPrev: this.state.prevOrbZ, speed: this.state.speed, bounds: this.state.spacing - 6, player: this.player, isPlaceholder: true });
          this.addToUpdateList(orb);
          this.add(orb);
          this.orbs.push(orb);

          this.state.prevOrbZ = orb.position.z;
      }
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    reset() {
      this.state.prevOrbZ = 0;
      this.state.powerup = "";
      this.state.powerupTimer = 0;
      this.state.powerupRecharge = 50;
      this.state.orbsCollected = 0;
      this.state.redOrbsCollected = 0;
      this.state.orbsMissed = 0;
      this.initializeOrbs(this.numStartingOrbs, this.orbIncrement);
    }

    // Just prints to console for now
    reportStats() {
      let accuracy = 0;
      let totalOrbs = this.state.orbsCollected + this.state.orbsMissed;
      if (totalOrbs != 0) {
        accuracy = (this.state.orbsCollected / totalOrbs).toFixed(2);
      }
      accuracy *= 100;
      console.log(`Game Stats \n\nOrbs Collected: ${this.state.orbsCollected} \nRed Orbs Collected: ${this.state.redOrbsCollected} \nOrbs Missed: ${this.state.orbsMissed} \nAccuracy: ${accuracy}%`);
    }

    createPowerup(xPos, speed, bounds) {
      let rand = Math.random();

      if (rand < 0.5) {
        const newPowerup = new Powerup({ xPos: xPos, speed: speed, bounds: bounds, type: "Magnet" });
        this.powerups.push(newPowerup);
        this.addToUpdateList(newPowerup);
        this.add(newPowerup);
      }
      else {
        const newPowerup = new Powerup({ xPos: xPos, speed: speed, bounds: bounds, type: "Double" });
        this.powerups.push(newPowerup);
        this.addToUpdateList(newPowerup);
        this.add(newPowerup);
      }

      // set powerup timer
      this.state.powerupRecharge = 50;
    }

    update(timeStamp) {
        let { updateList, deltaInt } = this.state;

        if (this.state.playerInputs.jumped) {
            this.player.state.jumped = true;
        }

        if (this.state.playerInputs.left) {
            this.player.state.left = true;
        }

        if (this.state.playerInputs.right) {
            this.player.state.right = true;
        }

        // check collision with orbs and add score
        if (!this.state.playerDodge) {
            for (let i = 0; i < this.orbs.length; i++) {
                this.state.score += this.player.collideWithOrb(this.orbs[i]);
                if (this.state.score < 0) {
                    this.state.score = 0;
                }
            }

            for (let i = 0; i < this.powerups.length; i++) {
                if (this.player.collideWithPowerup(this.powerups[i])) {
                  this.state.powerup = this.powerups[i].state.type;
                }
            }
        }

        // destroy orbs behind the camera / add new ones
        const CAMERA_X = 10;
        while (this.orbs[0] && this.orbs[0].position.x > CAMERA_X) {
            // add new barrier to replace the old one
            let orbXPos = this.orbs[this.orbs.length - 1].position.x - this.orbIncrement;
            const newOrb = new Orb({ xPos: orbXPos, zPrev: this.state.prevOrbZ, speed: this.state.speed, bounds: this.state.spacing - 6, player: this.player, isPlaceholder: false });
            this.orbs.push(newOrb);
            this.addToUpdateList(newOrb);
            this.add(newOrb);

            this.state.prevOrbZ = newOrb.position.z;

            // count collected/missed for stats
            let existsPowerup = this.orbs[0].state.double || this.orbs[0].state.magnet;
            let negative = this.orbs[0].state.negative;
            let isPlaceholder = this.orbs[0].state.isPlaceholder;

            // don't count if a placeholder orb
            if (!isPlaceholder) {
              if (this.orbs[0].state.visible) {
                if (!negative || existsPowerup) {
                  this.state.orbsMissed += 1;
                }
              } else {
                if (!negative || existsPowerup) {
                  this.state.orbsCollected += 1;
                } else {
                  this.state.redOrbsCollected += 1;
                }
              }
            }

            // dispose of old orb
            this.remove(this.orbs[0]);
            this.orbs.shift();

            // randomly create a powerup
            if (Math.random() < .05 && this.state.powerupRecharge == 0) {
              this.createPowerup(orbXPos, this.state.speed + 0.2, this.state.spacing-6);
            }

            // update powerup timers and recharge
            if (this.state.powerupRecharge > 0) this.state.powerupRecharge -= 1;
            if (this.state.powerupTimer > 0) this.state.powerupTimer -= 1;
            if (this.state.powerupTimer == 0) this.state.powerup = "";
        }

        // apply powerups
        switch (this.state.powerup) {
          case "Double":
            for (let i = 0; i < this.orbs.length; i++) {
              this.orbs[i].state.double = true;
            }
            break;
          case "Magnet":
            for (let i = 0; i < this.orbs.length; i++) {
              this.orbs[i].state.magnet = true;
            }
            break;
        }


        if (deltaInt % 2 == 0) {
            var levels = [];
            if (this.audiodata.data.length > 0) {
                for (var i = 0; i < this.strips; i++) {
                    levels.push(this.audiodata.data[i] / 256);
                }
                levels.reverse();
            }
            this.wall1.setStripIntensities(levels);
            this.wall2.setStripIntensities(levels);
        }


        if (deltaInt % (Math.round(Math.random() * 15) + 20) == 0) {
            let { avgFreq } = this.state;
            //this.ionDrive.reactToBeat(4 * avgFreq/ 256);
            //this.floor.setIntensity(0.2);
        }


        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }

        deltaInt += 1;
        this.state = { ...this.state, deltaInt };
    }
}

export default SimpleScene;
