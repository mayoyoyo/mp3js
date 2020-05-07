import { Group, Clock, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {AnimationMixer} from 'three';
import MODEL from './IonDrive.glb';

class IonDrive extends Group {
    constructor(onLoad) {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'drive';

        this.clock = new Clock();
        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
            this.ringObj = gltf.scene.getChildByName('circle');
            gltf.scene.rotation.y = Math.PI/ 2;
            gltf.scene.scale.multiplyScalar(0.6);
            this.mixer = new AnimationMixer( gltf.scene);
            var clip = gltf.animations[0];
            this.mixer.clipAction( clip.optimize()).play();
            onLoad();
        });

        this.deltaInt = 0;
        this.targetScale = 1;
        this.decay = 0.95;
    }

    reactToBeat(magnitude){
        this.targetScale = magnitude;
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    update(timeStamp) {
        if (this.mixer){
            const delta = this.clock.getDelta() / 2;
            this.mixer.update(delta);
        }


        if (this.ringObj){
            let targetVec = new Vector3(0.8, this.targetScale, this.targetScale);
            this.ringObj.scale.lerp(targetVec, 0.2);
            let decayed = Math.max(0.8, this.decay * this.targetScale);

            this.targetScale = decayed;
            this.deltaInt += 1;

            if (this.deltaInt % (this.getRandomInt(15) + 20) == 0){
                //debugger;
                this.reactToBeat(2);
            }
        }

    }
}

export default IonDrive;
