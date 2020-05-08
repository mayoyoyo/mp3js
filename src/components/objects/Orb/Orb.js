import { Group, Vector3 } from 'three';
import { SphereBufferGeometry, MeshPhongMaterial, Mesh } from 'three';

class Orb extends Group {
    constructor(data){
        let {xPos, zPrev, speed, bounds} = data;
        super();

        this.state = {
          visible: true,
          speed: speed,
          negative: false,
          high: false
        }

        this.radius = 0.5;
        let color = 0xFFFFFF;

        // negative orbs
        if (Math.random() < .1) {
          this.state.negative = true;
          color = 0xFF1100;
          this.radius = 0.7;
        }

        // changing height of orbs
        if (Math.random() < .25) {
          this.state.high = true;
          if (!this.state.negative) {
            color = 0xFFDD00;
            this.radius = 0.7;
          }
        }

        const geometry = new SphereBufferGeometry(this.radius, 1, 1);
        const material = new MeshPhongMaterial( { color: color, opacity: 0.4, transparent: true} );

        let orbMesh = new Mesh(geometry, material);

        this.add(orbMesh);
        const DEVIATION = 3;
        let yPos = this.state.high ? -1 : -4.5;
        this.position.set(xPos, yPos, this.randomZ(zPrev, DEVIATION, bounds));
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
