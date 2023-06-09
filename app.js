let canvas = document.getElementById("canvas");
let c = canvas.getContext("2d");
let tx = window.innerWidth;
let ty = window.innerHeight;
canvas.width = tx;
canvas.height = ty;
var wallImg = new Image();
wallImg.src = 'brick_mini.png';

let brickWidth = 30;
let brickHeight = 30;
let walls = [];

function update_walls() {
  let bricksPerRow = Math.floor(tx / brickWidth);
  let bricksPerColumn = Math.floor(ty / brickHeight);
  // up and down walls
  for (let row of [0, bricksPerColumn - 1]) {
    for (let col = 0; col < bricksPerRow; col++) {
      let brick = {
        x: col * brickWidth,
        y: row * brickHeight,
        width: brickWidth,
        height: brickHeight
      };
      walls.push(brick);
    }
  }
  
  // Left and right walls
  for (let col of [0, bricksPerRow - 0.5]) {
    for (let row = 0; row < bricksPerColumn; row++) {
      let brick = {
        x: col * brickWidth,
        y: row * brickHeight,
        width: brickWidth,
        height: brickHeight
      };
      walls.push(brick);
    }
  }
}
update_walls();
function clearWalls() {
  walls = [];
  c.clearRect(0, 0, tx, ty);
}

function handleResize() {
  clearWalls();
  tx = window.innerWidth;
  ty = window.innerHeight;
  canvas.width = tx;
  canvas.height = ty;
  update_walls();
}

// Top and bottom walls

wallImg.onload = function() {
  for (var i = 0; i < walls.length; i++) {
      var wall = walls[i];
      c.drawImage(wallImg, wall.x, wall.y, wall.width, wall.height);
      c.strokeStyle = '#000000';
      c.strokeRect(wall.x, wall.y, wall.width, wall.height);
  }
};
let mousex = 0;
let mousey = 0;

addEventListener("mousemove", function(event) {
  mousex = event.clientX;
  mousey = event.clientY;
});


let grav = 1.00001;
c.strokeWidth = 5;

class Box {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  // Method to draw the box on the canvas
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
class Ball {
    constructor() {
      this.color = this.randomColor();
      this.radius = Math.random() * 1 + 14;
      this.startRadius = this.radius;
      this.x = Math.random() * (tx - this.radius * 2) + this.radius;
      this.y = Math.random() * (ty - this.radius);
      this.dy = Math.random() * 2;
      this.dx = Math.round((Math.random() - 0.5) * 10);
      this.vel = Math.random() / 5;
      this.rotationAngle = 0;
      this.vx = 0;
      this.vy = 0;
    }
    checkCollision(otherBall) {
        const dx = otherBall.x - this.x;
        const dy = otherBall.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        if (distance < this.radius + otherBall.radius) {
          return true;
        }
    
        return false;
      }
      
    randomColor() {
      return (
        "rgba(" +
        Math.round(Math.random() * 400) +
        "," +
        Math.round(Math.random() * 400) +
        "," +
        Math.round(Math.random() * 450) +
        "," +
        Math.ceil(Math.random() * 10) / 10 +
        ")"
      );
    }

    repelMouse() {
        const dx = this.x - mousex;
        const dy = this.y - mousey;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2000) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const forceMagnitude = 20000;

            this.vx = forceDirectionX * forceMagnitude;
            this.vy = forceDirectionY * forceMagnitude;
        } else {
            this.vx *= 0.99;
            this.vy *= 0.99;
        }
    }

    draw() {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      c.shadowColor = 'rgba(0, 0, 0, 0.2)'; // Shadow color
      c.shadowBlur = 10;
      c.fillStyle = this.color;
      c.fill();
    }

    
    sharecolors(x, y) {
        if (x.radius > y.radius) x.color = y.color;
        else y.color = x.color;
    }

    update() {
        this.draw();
        if (this.y - this.radius < 30) {
            this.y = this.radius + 30;
            this.dy = -this.dy; // Reverse the vertical direction
          } else if (this.y + this.radius > ty - 50) {
            this.y = ty - this.radius - 50;
            this.dy = -this.dy; // Reverse the vertical direction
          }
          
          if (this.x - this.radius < 30) {
            this.x = this.radius + 30;
            this.dx = -this.dx; // Reverse the horizontal direction
          } else if (this.x + this.radius > tx - 40) {
            this.x = tx - this.radius - 40;
            this.dx = -this.dx; // Reverse the horizontal direction
          }


        for (let i = 0; i < balls.length; i++) {
          if (balls[i] !== this && this.checkCollision(balls[i])) {
            const dx = balls[i].x - this.x;
            const dy = balls[i].y - this.y;
            const angle = Math.atan2(dy, dx);
      
            const distance = Math.sqrt(dx * dx + dy * dy);
      
            const overlap = this.radius + balls[i].radius - distance;
      
            const displacement = overlap / 2;
    
            this.x -= displacement * Math.cos(angle);
            this.y -= displacement * Math.sin(angle);
            balls[i].x += displacement * Math.cos(angle);
            balls[i].y += displacement * Math.sin(angle);
      

            const normalX = dx / distance;
            const normalY = dy / distance;
      
            const tangentX = -normalY;
            const tangentY = normalX;
      
            const thisNormalVelocity = normalX * this.dx + normalY * this.dy;
            const thisTangentVelocity = tangentX * this.dx + tangentY * this.dy;
            const otherNormalVelocity = normalX * balls[i].dx + normalY * balls[i].dy;
            const otherTangentVelocity = tangentX * balls[i].dx + tangentY * balls[i].dy;
      
            const thisFinalNormalVelocity = otherNormalVelocity;
            const otherFinalNormalVelocity = thisNormalVelocity;
      
            this.dx = thisFinalNormalVelocity * normalX + thisTangentVelocity * tangentX;
            this.dy = thisFinalNormalVelocity * normalY + thisTangentVelocity * tangentY;
            balls[i].dx = otherFinalNormalVelocity * normalX + otherTangentVelocity * tangentX;
            balls[i].dy = otherFinalNormalVelocity * normalY + otherTangentVelocity * tangentY;
          }
        }
      
        this.x += this.dx;
        this.y += this.dy;
      }
      

    
    handleMouse() {
        if(mousex > this.x - 20 && 
          mousex < this.x + 20 &&
          mousey > this.y -50 &&
          mousey < this.y +50 &&
          this.radius < 70){
            const direction = this.getDirectionToMouse();
            this.dx += 5 * direction.dx;
            this.dy += 5 * direction.dy;
          } else {
            if(this.radius > this.startRadius){
              this.radius -= 5;
            }
            this.color = this.randomColor(); // reverts to random color
          }
      }
    
      handleMouseClick() {
        if(mousex > this.x - 20 && 
          mousex < this.x + 20 &&
          mousey > this.y -50 &&
          mousey < this.y +50) {
            return true;
          }
        return false;
      }

      getDirectionToMouse() {
        const dx = this.x - mousex;
        const dy = this.y - mousey;
        const distance = Math.sqrt(dx*dx + dy*dy);
    
        return {
            dx: dx / distance,
            dy: dy / distance
        };
    }
}

let balls = [];
for (let i=0; i<150; i++){
  balls.push(new Ball());
}


let animationId;

function animate() {
  if (tx != window.innerWidth || ty != window.innerHeight) {
    tx = window.innerWidth;
    ty = window.innerHeight;
    canvas.width = tx;
    canvas.height = ty;
  }

  animationId = requestAnimationFrame(animate);
  c.clearRect(0, 0, tx, ty);

  for (let i = 0; i < walls.length; i++) {
    let wall = walls[i];
    c.drawImage(wallImg, wall.x, wall.y, wall.width, wall.height);
    c.strokeStyle = '#000000';
    c.strokeRect(wall.x, wall.y, wall.width, wall.height);
  }

  for (let i = 0; i < balls.length; i++) {
    balls[i].update();
  }
}
window.addEventListener("resize", handleResize);  
animate();

addEventListener("click", function(event) {
  mousex = event.clientX;
  mousey = event.clientY;
  for (let i = 0; i < balls.length; i++) {
    if (balls[i].handleMouseClick()) {
      balls.splice(i, 1);
      break;
    }
  }
});

let isPaused = false;

function pausePlay() {
  if (isPaused) {
    animate();
    isPaused = false;
  } else {
    cancelAnimationFrame(animationId);
    isPaused = true;
  }
}

// Call the pausePlay function when the space key is pressed
window.addEventListener("keydown", function(event) {
  if (event.key === " ") {
    pausePlay();
  }
});