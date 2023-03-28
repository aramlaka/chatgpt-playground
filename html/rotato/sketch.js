const particles = [];
const particleCount = 1000;
const maxDistance = 50; // Increased max distance for connecting lines

class Particle {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.hue = random(360); // Added hue property for color shifting
  }

  update() {
    this.position.add(this.velocity);
    if (this.position.x < 0 || this.position.x > width) {
      this.velocity.x *= -1;
    }
    if (this.position.y < 0 || this.position.y > height) {
      this.velocity.y *= -1;
    }

    this.hue = (this.hue + 1) % 360; // Update hue value for color shifting
  }

  show() {
    stroke(color(this.hue, 255, 255)); // Use HSB color
    strokeWeight(4);
    point(this.position.x, this.position.y);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 255, 255); // Change color mode to HSB
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  background(0);
  particles.forEach((p, index) => {
    p.update();
    p.show();
    for (let i = index + 1; i < particles.length; i++) {
      const d = p.position.dist(particles[i].position);
      if (d < maxDistance) {
        stroke(p.hue, 255, 255, map(d, 0, maxDistance, 255, 0)); // Use the hue value of the current particle
        strokeWeight(1);
        line(p.position.x, p.position.y, particles[i].position.x, particles[i].position.y);
      }
    }
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}