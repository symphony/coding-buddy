import selectAvatar from "./selectAvatar";

const facing = {
  up: 3,
  down: 0,
  left: 1,
  right: 2
}
// facing direction
const cycleLoop = [0, 1, 2, 3];
class Characters {

  constructor(config) {
    this.state = {
      username: config.username,
      x: config.x,
      y: config.y,
      currentDirection: config.currentDirection,
      frameCount: config.frameCount,
      avatar: config.avatar
    }
    this.img = new Image();
    this.img.src = selectAvatar(this.state.avatar)
    this.movement_speed = 10;
    this.width = 63.5;
    this.height = 63.5;
    this.currentLoopIndex = 0;
    this.frameLimit = 4;
  }

  frameDirection = () => {
    this.state.frameCount += 1;
    // console.log(this.state.frameCount)
    if (this.state.frameCount >= this.frameLimit) {
      this.state.frameCount = 0;
    }
  }

  // add websocket
  move = (e) => {
    // console.log('inside move', this)
    if (e.key === 'ArrowUp') {
      this.state.y -= this.movement_speed;
      this.state.currentDirection = facing.up;
      this.frameDirection()
    }
    if (e.key === 'ArrowLeft') {
      this.state.x -= this.movement_speed;
      this.state.currentDirection = facing.left;
      this.frameDirection()
    }
    if (e.key === 'ArrowDown') {
      this.state.y += this.movement_speed;
      this.state.currentDirection = facing.down;
      this.frameDirection()
    }
    if (e.key === 'ArrowRight') {
      this.state.x += this.movement_speed;
      this.state.currentDirection = facing.right;
      this.frameDirection()
    }
  }

  drawFrame = (ctx) => {
    const frameX = cycleLoop[this.state.frameCount];
    // console.log(frameX, this.state.frameCount)
    ctx.drawImage(this.img,
      frameX * this.width, this.state.currentDirection * this.height,
      this.width, this.height,
      this.state.x, this.state.y,
      this.width, this.height
    )

  }

  showName = (ctx) => {
    // name over head
    ctx.font = 'bold 25px monospace';
    ctx.fillRect(
      this.state.x,
      this.state - 10,
      80,
      20
    )
    ctx.fillStyle = "black";
    ctx.fillText(
      this.state.username,
      this.state.x + 10,
      this.state.y + 5
    )
  };


  showChat = (ctx, msg) => {
    ctx.font = 'bold 30px monospace'
    ctx.fillStyle = "blue"
    ctx.fillText(
      msg,
      this.state.x,
      this.state.y - 13
    );
  }
};

export default Characters;