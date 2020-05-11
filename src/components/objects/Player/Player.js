import { Group, Vector3 } from 'three';
import { SphereBufferGeometry, MeshPhongMaterial, Mesh } from 'three';

class Player extends Group {
  constructor(data) {
    let { radius, segments, playerPos, ionDrive, bounds, scene } = data;
    super();
    let geometry = new SphereBufferGeometry(radius, segments, segments);
    let material = new MeshPhongMaterial({ opacity: 0, transparent: true });

    let sphereMesh = new Mesh(geometry, material);

    this.state = {
      currTouchingGround: true,
      left: false,
      right: false,
      jumped: false,
    }
    this.bounds = bounds;
    this.radius = radius;
    this.ionDrive = ionDrive;
    this.scene = scene;

    this.velocity = new Vector3();
    this.netForces = new Vector3();

    this.sphereMesh = sphereMesh;
    this.add(sphereMesh);
    this.add(ionDrive);
    this.position.set(playerPos.x, playerPos.y, playerPos.z);

    // console.log(this.sphereMesh.material)

    // add shield mesh
    geometry = new SphereBufferGeometry(radius + 0.7, 16, 16);
    material = new MeshPhongMaterial({ opacity: 0, transparent: true });
    let shieldMesh = new Mesh(geometry, material);
    this.shieldMesh = shieldMesh;
    this.add(shieldMesh);
  }

  // returns score received
  collideWithOrb(orb) {
    if (!orb.state.visible) return 0;

    let oPos = orb.position;
    let pPos = this.position;
    let pts = 0;
    if (oPos.x > pPos.x - this.radius
      && oPos.x < pPos.x + this.radius
      && oPos.z > pPos.z - this.radius
      && oPos.z < pPos.z + this.radius
      && oPos.y > pPos.y - this.radius
      && oPos.y < pPos.y + this.radius) {

      this.sphereMesh.material.color = orb.orbMesh.material.color;
      this.sphereMesh.material.opacity = 0.4;
      this.ionDrive.reactToBeat(2);

      orb.state.visible = false;

      // check kind of orb
      if (orb.state.negative) {
        pts = -1000;
      } else {
        pts = orb.state.high ? 500 : 100;
      }

      // apply powerups
      if (orb.state.magnet) {
        pts = Math.abs(pts);
      }
      else if (orb.state.double) {
        pts = Math.abs(pts) * 2;
      }
    }
    return pts;
  }

  collideWithPowerup(powerup) {
    if (!powerup.state.visible) return false;

    let pwPos = powerup.position;
    let plPos = this.position;
    if (pwPos.x > plPos.x - this.radius
      && pwPos.x < plPos.x + this.radius
      && pwPos.z > plPos.z - this.radius
      && pwPos.z < plPos.z + this.radius
      && pwPos.y > plPos.y - this.radius
      && pwPos.y < plPos.y + this.radius) {

      this.sphereMesh.material.color = powerup.powerupMesh.material.color;
      this.sphereMesh.material.opacity = 0.4;
      this.ionDrive.reactToBeat(3);

      powerup.state.visible = false;

      // set powerup timer and next powerup recharge
      this.scene.state.powerupTimer = 20;
      return true;
    }
    return false;
  }

  collideWithWalls() {
    const min = -this.bounds + this.radius;
    const max = this.bounds - this.radius;
    if (this.position.z < min || this.position.z > max) {
      this.position.z = Math.min(Math.max(this.position.z, min), max);
      this.velocity = new Vector3(0, this.velocity.y, 0);
    }
  }

  // TODO: Fill in this stub function
  collideWithFloor() {
    if (this.position.y < -5 + this.radius) {
      this.position.y = -5 + this.radius;
    }
  }

  // TODO: Figure out where ground is to fill in this function
  currTouchingGround() {
    return (this.position.y + 5 - this.radius < 0.001);
  }

  handleJump() {
    if (this.scene.state.paused) return;
    this.state.jumped = false;
    if (this.state.currTouchingGround) {
      this.velocity = new Vector3();
      let jumpForce = new Vector3(0, .55, 0);
      this.netForces.add(jumpForce);
    }
  }

  handleLeft() {
    if (this.scene.state.paused) return;
    this.state.left = false;
    if (this.velocity.z < 0) this.velocity.z = 0;
    let moveForce = new Vector3(0, 0, .023);
    this.netForces.add(moveForce);
  }

  handleRight() {
    if (this.scene.state.paused) return;
    this.state.right = false;
    if (this.velocity.z > 0) this.velocity.z = 0;
    let moveForce = new Vector3(0, 0, -.023);
    this.netForces.add(moveForce);
  }

  addGravity() {
    const GRAVITY = new Vector3(0, -.043, 0);
    this.netForces.add(GRAVITY);
  }

  addFriction() {
    if (!this.currTouchingGround) return;

    let frictionForce = new Vector3(0, 0, -this.velocity.z);
    frictionForce.multiplyScalar(0.08);

    this.netForces.add(frictionForce);
  }

  updateVelocity() {
    this.velocity.add(this.netForces);
  }

  updatePosition() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;
  }

  simulateForces() {
    this.state.currTouchingGround = this.currTouchingGround();
    this.netForces = new Vector3();
    if (this.state.jumped) {
      this.handleJump();
    }
    if (this.state.left) {
      this.handleLeft();
    }
    if (this.state.right) {
      this.handleRight();
    }
    this.addGravity();
    this.addFriction();
    this.updateVelocity();
    this.updatePosition();
  }

  update() {
    this.simulateForces();
    this.collideWithFloor();
    this.collideWithWalls();
    this.sphereMesh.material.opacity -= 0.035;
  }
}

export default Player;
