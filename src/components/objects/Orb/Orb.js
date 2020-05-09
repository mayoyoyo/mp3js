import { Group, Vector3 } from 'three';
import { SphereBufferGeometry, MeshPhongMaterial, Mesh, Color } from 'three';

class Orb extends Group {
    constructor(data){
        let {xPos, zPrev, speed, bounds, player} = data;
        super();

        this.state = {
          visible: true,
          speed: speed,
          negative: false,
          high: false,
          double: false,
          magnet: false
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
        this.orbMesh = orbMesh;
        this.player = player;

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


    update() {
      this.position.x += this.state.speed;
      if (!this.state.visible) {
        this.children[0].material.opacity = 0;
      }
      if (this.state.double) {
        this.orbMesh.material.color = new Color(0, 1, 0);
      }
      if (this.state.magnet && this.position.x < this.player.position.x) {
        this.orbMesh.material.color = new Color(0, 0.6, 1);
        let pullVec = this.player.position.clone().sub(this.position);
        this.position.add(pullVec.multiplyScalar(0.01));
      }
    }
}

export default Orb;
