import { Group, Vector3 } from 'three';
import { SphereBufferGeometry, MeshPhongMaterial, Mesh } from 'three';

class Player extends Group {
    constructor(data){
        let {radius, segments, playerPos, skin, bounds} = data;
        super();
        const geometry = new SphereBufferGeometry(radius, segments, segments);
        const material = new MeshPhongMaterial( { opacity: 0, transparent: true } );

        let playerMesh = new Mesh(geometry, material);

        this.state = {
            // collide: false,
            currTouchingGround: true,
            left: false,
            right: false,
            jumped: false,
        }
        this.bounds = bounds;
        this.radius = radius;


        this.velocity = new Vector3();
        this.netForces = new Vector3();

        this.add(playerMesh);
        this.add(skin);
        this.position.set(playerPos.x, playerPos.y, playerPos.z);
    }

    // returns score received
    collideWithOrb(orb) {
      if (!orb.state.visible) return 0;

      let oPos = orb.position;
      let pPos = this.position;
      if (oPos.x > pPos.x - this.radius
          && oPos.x < pPos.x + this.radius
          && oPos.z > pPos.z - this.radius
          && oPos.z < pPos.z + this.radius
          && oPos.y > pPos.y - this.radius
          && oPos.y < pPos.y + this.radius) {
        orb.state.visible = false;

        // check kind of orb
        if (orb.state.negative) {
          return -1000;
        } else {
          return orb.state.high ? 500 : 100;
        }

      }
      return 0;
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
      if (this.position.y < -6 + this.radius) {
        this.position.y = -6 + this.radius;
      }
    }

    // TODO: Figure out where ground is to fill in this function
    currTouchingGround() {
      return (this.position.y + 6 - this.radius < 0.001);
    }

    handleJump() {
      this.state.jumped = false;
      if (this.state.currTouchingGround) {
  	     this.velocity = new Vector3();
         let jumpForce = new Vector3(0, .35, 0);
         this.netForces.add(jumpForce);
      }
    }

    handleLeft() {
      this.state.left = false;
      if (this.velocity.z < 0) this.velocity.z = 0;
  	  // this.velocity = new Vector3(0, this.velocity.y, 0);
      let moveForce = new Vector3(0, 0, .04);
      this.netForces.add(moveForce);
    }

    handleRight() {
      this.state.right = false;
      if (this.velocity.z > 0) this.velocity.z = 0;
  	  // this.velocity = new Vector3(0, this.velocity.y, 0);
      let moveForce = new Vector3(0, 0, -.04);
      this.netForces.add(moveForce);
    }

    addGravity() {
      // actual gravity
      // const GRAVITY = new Vector3(0, -.0035, 0);

      const GRAVITY = new Vector3(0, -.015, 0);
      this.netForces.add(GRAVITY);
    }

    addFriction() {
        if (!this.currTouchingGround) return;

        let frictionForce = new Vector3(0, 0, -this.velocity.z);
        frictionForce.multiplyScalar(0.06);

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
    }
}

export default Player;
