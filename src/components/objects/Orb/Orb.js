import { Group, Vector3 } from 'three';
import { SphereBufferGeometry, MeshPhongMaterial, Mesh } from 'three';

class Orb extends Group {
    constructor(data){
        let {xPos, zPrev, speed, bounds} = data;
        super();

        this.radius = 0.5;
        const geometry = new SphereBufferGeometry(this.radius, 8, 8);
        const material = new MeshPhongMaterial( { color: 0xFFFFFF, opacity: 0.25, transparent: true} );

        let orbMesh = new Mesh(geometry, material);

        this.state = {
          visible: true,
          speed: speed
        }

        this.add(orbMesh);
        const DEVIATION = 2;
        this.position.set(xPos, -3, this.randomZ(zPrev, DEVIATION, bounds));
    }

    // returns a random z-value +/- range from zPrev, bound by [-bounds, bounds]
    randomZ(zPrev, range, bounds) {
      let min = Math.max(zPrev - range, -bounds + 0.35);
      let max = Math.min(zPrev + range, bounds - 0.35);

      return Math.random() * (max - min) + min;
    }

    // collideWithPlayer() {
    // }

    update() {
      // console.log(this.position.x)
      this.position.x += this.state.speed;
      if (!this.state.visible) {
        this.children[0].material.opacity = 0;
      }
    }
}

export default Orb;
