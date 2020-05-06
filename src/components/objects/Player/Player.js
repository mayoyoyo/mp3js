import { Group, Vector3 } from 'three';
import { SphereBufferGeometry, MeshPhongMaterial, Mesh } from 'three';

class Player extends Group {
    constructor(data){
        let {radius, segments, playerPos} = data;
        super();
        const geometry = new SphereBufferGeometry(radius, segments, segments);
        const material = new MeshPhongMaterial( { color: 0xff1124, specular: 0x666666, emissive: 0xff0000, shininess: 100, opacity: 1, transparent: false } );

        let playerMesh = new Mesh(geometry, material);

        this.state = {
            // collide: false,
            currTouchingGround: true,
            left: false,
            right: false,
            jumped: false
        }

        this.velocity = new Vector3();
        this.netForces = new Vector3();

        this.add(playerMesh);
        this.position.set(playerPos.x, playerPos.y, playerPos.z);
    }

    // TODO: Fill in this stub function
    collideWithFloor() {
      if (this.position.y < -2) {
        this.position.y = -2;
      }
    }

    // TODO: Figure out where ground is to fill in this function
    currTouchingGround() {
      return (this.position.y + 2 < 0.001);
    }

    handleJump() {
      this.state.jumped = false;
      if (this.state.currTouchingGround) {
  	     this.velocity = new Vector3();
         let jumpForce = new Vector3(0, .25, 0);
         this.netForces.add(jumpForce);
      }
    }

    handleLeft() {
      this.state.left = false;
  	  this.velocity = new Vector3(0, this.velocity.y, 0);
      let moveForce = new Vector3(0, 0, .2);
      this.netForces.add(moveForce);
    }

    handleRight() {
      this.state.right = false;
  	  this.velocity = new Vector3(0, this.velocity.y, 0);
      let moveForce = new Vector3(0, 0, -.2);
      this.netForces.add(moveForce);
    }

    addGravity() {
      // actual gravity
      // const GRAVITY = new Vector3(0, -.0035, 0);

      const GRAVITY = new Vector3(0, -.01, 0);
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
    }
}

export default Player;
