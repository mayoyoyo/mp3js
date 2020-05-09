import { Group, Vector3 } from 'three';
import { SphereBufferGeometry, MeshPhongMaterial, Mesh } from 'three';

class Orb extends Group {
  constructor(data) {
    let { xPos, zPrev, speed, bounds } = data;
    super();

    this.state = {
      visible: true,
      speed: speed,
      negative: false,
      high: false
    }

    this.radius = 0.5;
    let color = 0xFFFFFF;

    let randomVar = Math.random();
    let opacityVar = 0.4;

    // red orbs
    if (randomVar < .1) {
      this.state.negative = true;
      color = 0xFF1100;
      this.radius = 1;
      opacityVar = 0.7;
    }

    // yellow orbs
    if (randomVar < .25 && randomVar >= 0.1) {
      this.state.high = true;
      color = 0xFFDD00;
      this.radius = 0.7;
      opacityVar = 0.7;
    }

    const geometry = new SphereBufferGeometry(this.radius, 1, 1);
    const material = new MeshPhongMaterial({ color: color, opacity: opacityVar, transparent: true });

    let orbMesh = new Mesh(geometry, material);
    this.orbMesh = orbMesh;

    this.add(orbMesh);
    const DEVIATION = 3;
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
    if (rand < .25) {
      zval += deviation;
    }
    else if (rand > 0.75) {
      zval -= deviation;
    }

    if (zval > bounds - 1) {
      return bounds - 1;
    }
    if (zval < -bounds + 1) {
      return -bounds + 1;
    }
    return zval;
    //let min = Math.max(zPrev - range, -bounds + 0.35);
    //let max = Math.min(zPrev + range, bounds - 0.35);
    //return Math.random() * (max - min) + min;
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
