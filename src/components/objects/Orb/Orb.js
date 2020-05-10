import { Group, Vector3 } from 'three';
import { SphereBufferGeometry, MeshPhongMaterial, Mesh, Color } from 'three';

class Orb extends Group {
    constructor(data){
        let {xPos, zPrev, speed, bounds, player, isPlaceholder} = data;
        super();

        this.state = {
          visible: !isPlaceholder,
          speed: speed,
          negative: false,
          high: false,
          double: false,
          magnet: false,
          isPlaceholder: isPlaceholder
        }

        this.radius = 0.5;
        let color = 0xFFFFFF;

        let geometry = new SphereBufferGeometry(this.radius, 1, 1);

        let randomVar = Math.random();
        let opacityVar = 0.4;

        // negative orbs
        if (randomVar < .1) {
          this.state.negative = true;
          color = 0xFF1100;
          this.radius = 1;
          geometry = new SphereBufferGeometry(this.radius, 4, 4);
          opacityVar = 0.7;
        }

        // yellow orbs
        if (randomVar < .25 && randomVar >= 0.1) {
          this.state.high = true;
          color = 0xFFDD00;
          this.radius = 0.7;
          opacityVar = 0.7;
        }

        const material = new MeshPhongMaterial( { color: color, opacity: 0.4, transparent: true} );

        let orbMesh = new Mesh(geometry, material);
        this.orbMesh = orbMesh;
        this.player = player;

        this.add(orbMesh);
        const DEVIATION = 2.5;
        let yPos = this.state.high ? -1 : -3.5;
        this.position.set(xPos, yPos, this.randomZ(zPrev, DEVIATION, bounds));
    }

    // returns a random z-value +/- range from zPrev, bound by [-bounds, bounds]
    randomZ(zPrev, deviation, bounds) {
      if (this.state.high == true) {
        return zPrev;
      }
      let zval = zPrev;
      let rand = Math.random();
      if (rand < .33) {
        zval += deviation;
      }
      else if (rand > 0.66) {
        zval -= deviation;
      }
      if (zval > bounds - 2) {
        return bounds - 2;
      }
      if (zval < -bounds + 2) {
        return -bounds + 2;
      }
      return zval;
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
