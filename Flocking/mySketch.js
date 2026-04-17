let flock;
let clouds = [];

function setup() {
  createCanvas(640, 360);
  createP('Drag the mouse to generate new boids.');

  flock = new Flock();
  for (let i = 0; i < 100; i++) flock.addBoid(new Boid(width/2, height/2));

  clouds.push(new Cloud(80,   55,  1.0, 0.28));
  clouds.push(new Cloud(260,  38,  0.7, 0.18));
  clouds.push(new Cloud(430,  70,  1.2, 0.22));
  clouds.push(new Cloud(580,  42,  0.6, 0.32));
  clouds.push(new Cloud(150, 110,  0.8, 0.15));
  clouds.push(new Cloud(490, 125,  0.9, 0.20));
  clouds.push(new Cloud(330, 290, 0.65, 0.24));
  clouds.push(new Cloud(60,  270,  1.1, 0.17));
  clouds.push(new Cloud(600, 300, 0.75, 0.26));
}

function draw() {
  background(135, 206, 235);
  for (let c of clouds) { c.update(); c.draw(); }
  flock.run();
}

function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY));
}

class Cloud {
  constructor(x, y, s, speed) {
    this.x = x; this.y = y; this.s = s; this.speed = speed;
    this.puffs = [];
    let n = floor(random(4, 8));
    for (let i = 0; i < n; i++) {
      this.puffs.push({
        ox: (random() - 0.3) * 70 * s,
        oy: (random() * 0.5 - 0.5) * 28 * s,
        r:  (18 + random(22)) * s
      });
    }
  }
  update() {
    this.x += this.speed;
    if (this.x - 120 * this.s > width) this.x = -120 * this.s;
  }
  draw() {
    push();
    translate(this.x, this.y);
    fill(255, 255, 255, 224);
    noStroke();
    for (let p of this.puffs) circle(p.ox, p.oy, p.r * 2);
    pop();
  }
}

class Flock {
  constructor() { this.boids = []; }
  run() { for (let b of this.boids) b.run(this.boids); }
  addBoid(b) { this.boids.push(b); }
}

class Boid {
  constructor(x, y) {
    this.acc      = createVector(0, 0);
    this.vel      = createVector(random(-1, 1), random(-1, 1));
    this.position = createVector(x, y);
    this.size      = 6;
    this.maxSpeed  = 3;
    this.maxForce  = 0.05;
    this.lightness = random(15, 70);
    this.wingPhase = random(TWO_PI);
    this.wingSpeed = random(0.18, 0.28);
  }

  run(boids) { this.flock(boids); this.update(); this.borders(); this.render(); }

  flock(boids) {
    let sep = this.separate(boids); sep.mult(1.5);
    let ali = this.align(boids);
    let coh = this.cohesion(boids);
    this.acc.add(sep); this.acc.add(ali); this.acc.add(coh);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.position.add(this.vel);
    this.acc.mult(0);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.normalize();
    desired.mult(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  }

  render() {
    let speed = this.vel.mag();
    this.wingPhase += this.wingSpeed * (0.6 + speed * 0.25);
    let dip = sin(this.wingPhase) * 3.5;

    let theta = this.vel.heading() + HALF_PI;
    let s = this.size;
    let l = this.lightness;

    let clamp = (v) => min(100, max(0, v));
    let mid   = `hsl(0,0%,${clamp(l).toFixed(0)}%)`;
    let dark  = `hsl(0,0%,${clamp(l-18).toFixed(0)}%)`;
    let light = `hsl(0,0%,${clamp(l+14).toFixed(0)}%)`;
    let beak  = `hsl(40,30%,${clamp(l+20).toFixed(0)}%)`;

    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    strokeWeight(0.6);

    // Body
    fill(mid); stroke(dark);
    ellipse(0, 0, s*1.1, s*3.4);

    // Right wing base
    fill(mid); stroke(dark);
    beginShape();
    vertex(s*0.4, -s*0.2);
    bezierVertex(s*1.4,-s*0.5+dip*0.4, s*3.2,-s*0.2+dip,  s*3.6, s*0.3+dip);
    bezierVertex(s*2.8, s*0.9+dip*0.7, s*1.2, s*0.9,       s*0.4, s*0.5);
    endShape(CLOSE);

    // Right wing secondary shading
    fill(dark); noStroke();
    beginShape();
    vertex(s*0.4, s*0.1);
    bezierVertex(s*1.2,s*0.5+dip*0.3, s*2.2,s*0.7+dip*0.5, s*2.8,s*0.6+dip*0.6);
    bezierVertex(s*2.0,s*1.0+dip*0.6, s*1.0,s*1.0,          s*0.4,s*0.5);
    endShape(CLOSE);

    // Left wing base
    fill(mid); stroke(dark);
    beginShape();
    vertex(-s*0.4, -s*0.2);
    bezierVertex(-s*1.4,-s*0.5+dip*0.4, -s*3.2,-s*0.2+dip,  -s*3.6, s*0.3+dip);
    bezierVertex(-s*2.8, s*0.9+dip*0.7, -s*1.2, s*0.9,       -s*0.4, s*0.5);
    endShape(CLOSE);

    // Left wing secondary shading
    fill(dark); noStroke();
    beginShape();
    vertex(-s*0.4, s*0.1);
    bezierVertex(-s*1.2,s*0.5+dip*0.3, -s*2.2,s*0.7+dip*0.5, -s*2.8,s*0.6+dip*0.6);
    bezierVertex(-s*2.0,s*1.0+dip*0.6,  -s*1.0,s*1.0,          -s*0.4,s*0.5);
    endShape(CLOSE);

    // Tail feathers
    strokeWeight(0.5);
    for (let i = -2; i <= 2; i++) {
      let a = i * 0.18;
      fill(i === 0 ? light : mid); stroke(dark);
      beginShape();
      vertex(0, s*1.4);
      vertex(sin(a)*s*1.1,        s*1.4 + cos(a)*s*1.5);
      vertex(sin(a+0.13)*s*1.1,   s*1.4 + cos(a+0.13)*s*1.5);
      endShape(CLOSE);
    }

    // Head
    fill(dark); stroke(dark); strokeWeight(0.4);
    circle(0, -s*1.55, s*0.84);

    // Beak
    fill(beak); noStroke();
    triangle(-s*0.18, -s*1.9,  s*0.18, -s*1.9,  0, -s*2.35);

    // Eye highlight
    fill(255); noStroke();
    circle(s*0.14, -s*1.6, s*0.24);

    pop();
  }

  borders() {
    let sz = this.size * 4;
    if (this.position.x < -sz)         this.position.x = width + sz;
    if (this.position.y < -sz)         this.position.y = height + sz;
    if (this.position.x > width + sz)  this.position.x = -sz;
    if (this.position.y > height + sz) this.position.y = -sz;
  }

  separate(boids) {
    let ds = 25, steer = createVector(0,0), count = 0;
    for (let b of boids) {
      let d = p5.Vector.dist(this.position, b.position);
      if (d > 0 && d < ds) {
        let diff = p5.Vector.sub(this.position, b.position);
        diff.normalize(); diff.div(d); steer.add(diff); count++;
      }
    }
    if (count > 0) steer.div(count);
    if (steer.mag() > 0) {
      steer.normalize(); steer.mult(this.maxSpeed);
      steer.sub(this.vel); steer.limit(this.maxForce);
    }
    return steer;
  }

  align(boids) {
    let nd = 50, sum = createVector(0,0), count = 0;
    for (let b of boids) {
      let d = p5.Vector.dist(this.position, b.position);
      if (d > 0 && d < nd) { sum.add(b.vel); count++; }
    }
    if (count > 0) {
      sum.div(count); sum.normalize(); sum.mult(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.vel);
      steer.limit(this.maxForce); return steer;
    }
    return createVector(0, 0);
  }

  cohesion(boids) {
    let nd = 50, sum = createVector(0,0), count = 0;
    for (let b of boids) {
      let d = p5.Vector.dist(this.position, b.position);
      if (d > 0 && d < nd) { sum.add(b.position); count++; }
    }
    if (count > 0) { sum.div(count); return this.seek(sum); }
    return createVector(0, 0);
  }
}