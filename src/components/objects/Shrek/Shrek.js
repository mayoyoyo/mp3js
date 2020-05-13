import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';
import MODEL from './shrek.glb';

class Shrek extends Group {
    constructor(onLoad) {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();
        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
            gltf.scene.position.y -= 1;
            gltf.scene.rotation.y = -Math.PI / 2;
            gltf.scene.scale.multiplyScalar(1.7);
        });
    }

    reactToBeat(magnitude) {
    }

    update(timeStamp) {
    }
}

export default Shrek;
