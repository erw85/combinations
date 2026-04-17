// Modified from Daniel Shifman - codingtra.in
// Starter Option One: Particles
//Things to try:
// - Change the words - try phrases for more narrative / poetics!
// - Change the colors - try the background, and the words!
// - Change the font and size of the words
// - Change the particle system - try changing the starting points
// - Change the movement - try playing with the alpha and direction

particles = [];
clouds = [];
treeline = [];
flockX = 0;
flockY = 0;
//Just like with Tracery, put anything you want in the ""s
words = [
  "northern cardinal","northern cardinal","northern cardinal","northern cardinal","northern cardinal",
  "house finch","house finch","house finch","house finch","house finch",
  "tufted titmouse","tufted titmouse","tufted titmouse","tufted titmouse","tufted titmouse",
  "mourning dove",
  "blue jay",
  "brown thrasher",
  "red-bellied woodpecker",
  "northern mockingbird",
]

function setup() {
  createCanvas(windowWidth, windowHeight);
  generateTreeline();
  for (let i = 0; i < 12; i++) {
    clouds.push(new Cloud(random(windowWidth), random(windowHeight * 0.55)));
  }
}

function generateTreeline() {
  treeline = [];
  let x = -30;
  let baseY = windowHeight - 60;
  while (x <= windowWidth + 80) {
    let type = random();
    if (type < 0.50) {
      // Sabal/Cabbage palm — tall thin trunk, radiating fronds
      let trunkH   = random(80, 190);
      let trunkW   = random(6, 12);
      let lean     = random(-0.12, 0.12);
      let span     = random(45, 90);
      let fronds   = [];
      let nFronds  = floor(random(7, 11));
      for (let i = 0; i < nFronds; i++) {
        fronds.push({
          angle: map(i, 0, nFronds - 1, -PI + 0.25, 0.25),
          len:   span * random(0.8, 1.2),
        });
      }
      treeline.push({ type:'palm', x, baseY, trunkH, trunkW, lean, fronds });
      x += random(45, 100);
    } else if (type < 0.75) {
      // Live oak — wide rounded canopy
      let w = random(70, 150);
      let h = random(55, 115);
      treeline.push({ type:'oak', x: x + w/2, baseY, w, h });
      x += w * random(0.6, 0.9);
    } else {
      // Saw palmetto — low bushy fan cluster
      let w = random(50, 100);
      let h = random(20, 48);
      treeline.push({ type:'palmetto', x: x + w/2, baseY, w, h });
      x += w * random(0.5, 0.8);
    }
  }
}

function drawTreeline() {
  fill(20, 55, 20);
  noStroke();
  for (let tree of treeline) {
    if (tree.type === 'palm') {
      let topX = tree.x + tree.trunkH * tree.lean;
      let topY = tree.baseY - tree.trunkH;
      // Trunk
      beginShape();
      vertex(tree.x - tree.trunkW / 2, tree.baseY);
      vertex(tree.x + tree.trunkW / 2, tree.baseY);
      vertex(topX + tree.trunkW / 3,   topY);
      vertex(topX - tree.trunkW / 3,   topY);
      endShape(CLOSE);
      // Fronds
      for (let f of tree.fronds) {
        push();
        translate(topX, topY);
        rotate(f.angle);
        beginShape();
        vertex(0,        0);
        vertex(f.len * 0.12, -f.len * 0.07);
        vertex(f.len,        -f.len * 0.04);
        vertex(f.len * 0.95,  f.len * 0.04);
        vertex(f.len * 0.12,  f.len * 0.07);
        endShape(CLOSE);
        pop();
      }
    } else if (tree.type === 'oak') {
      // Trunk stub
      rect(tree.x - 6, tree.baseY - 22, 12, 22);
      // Overlapping ellipses for rounded canopy
      ellipse(tree.x,                tree.baseY - tree.h * 0.65, tree.w,        tree.h);
      ellipse(tree.x - tree.w * 0.28, tree.baseY - tree.h * 0.5,  tree.w * 0.72, tree.h * 0.8);
      ellipse(tree.x + tree.w * 0.28, tree.baseY - tree.h * 0.5,  tree.w * 0.72, tree.h * 0.8);
    } else {
      // Saw palmetto: low overlapping fan shapes
      ellipse(tree.x,                 tree.baseY - tree.h * 0.45, tree.w,        tree.h);
      ellipse(tree.x - tree.w * 0.22, tree.baseY - tree.h * 0.35, tree.w * 0.65, tree.h * 0.7);
      ellipse(tree.x + tree.w * 0.22, tree.baseY - tree.h * 0.35, tree.w * 0.65, tree.h * 0.7);
    }
  }
}

function drawSky() {
  let topCol    = color(80,  150, 220);
  let bottomCol = color(140, 205, 235);
  noStroke();
  let strips = 80;
  for (let i = 0; i < strips; i++) {
    fill(lerpColor(topCol, bottomCol, i / strips));
    rect(0, (i / strips) * windowHeight, windowWidth, windowHeight / strips + 1);
  }
}

function draw() {
  drawSky();

  for (let cloud of clouds) {
    cloud.update();
    cloud.show();
  }

  // Update flock centroid for cohesion
  if (particles.length > 0) {
    flockX = 0; flockY = 0;
    for (let p of particles) { flockX += p.x; flockY += p.y; }
    flockX /= particles.length;
    flockY /= particles.length;
  }

  //This creates the particles
  for (let i = 0; i < 3; i++) {
    let p = new Particle();
    particles.push(p);
  }
  //This moves the particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].finished()) {
      particles.splice(i, 1);
    }
  }

  // Treeline and grass drawn last so text emerges from behind them
  drawTreeline();
  noStroke();
  fill(34, 100, 20);
  rect(0, windowHeight - 60, windowWidth, 60);
  fill(50, 140, 30);
  rect(0, windowHeight - 68, windowWidth, 16);
}

class Cloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(0.1, 0.35);
    this.alpha = random(110, 170);
    let base = random(40, 90);
    this.halfWidth = base * 2.2;
    this.bumps = [];
    let count = floor(random(4, 9));
    for (let i = 0; i < count; i++) {
      this.bumps.push({
        ox: random(-base, base),
        oy: random(-base * 0.25, base * 0.25),
        w:  random(base * 0.6, base * 1.3),
        h:  random(base * 0.4, base * 0.85),
      });
    }
  }

  update() {
    this.x += this.speed;
    if (this.x > windowWidth + this.halfWidth) {
      this.x = -this.halfWidth;
      this.y = random(windowHeight * 0.55);
    }
  }

  show() {
    noStroke();
    fill(255, 255, 255, this.alpha);
    for (let b of this.bumps) {
      ellipse(this.x + b.ox, this.y + b.oy, b.w, b.h);
    }
  }
}

class Particle {
  constructor() {
    this.x = random(0, windowWidth);
    this.y = windowHeight;
    this.baseVx = random(-1, 1);
    this.vy = random(-5, -1);
    this.phase = random(TWO_PI);
    this.alpha = 255;
    this.text = random(words);
    let colorMap = {
      "blue jay":              [20,  60,  200],
      "brown thrasher":        [110, 55,  10 ],
      "northern mockingbird":  [130, 130, 130],
      "mourning dove":         [150, 130, 110],
      "red-bellied woodpecker":[40,  40,  40 ],
      "house finch":           [240, 130, 20 ],
      "tufted titmouse":       [200, 200, 210],
    };
    if (colorMap[this.text]) {
      [this.r, this.g, this.b] = colorMap[this.text];
    } else {
      this.r = 255; this.g = 0; this.b = 0;
    }
  }

  finished() {
    return this.alpha < 0;
  }

  update() {
    let wind  = sin(frameCount * 0.015 + this.phase) * 0.8;
    let flock = (flockX - this.x) * 0.0004;
    this.vx   = this.baseVx + wind + flock;
    this.x   += this.vx;
    this.y   += this.vy;
    this.alpha -= 1;
  }

  show() {
    noStroke();
    let brightness = map(this.y, windowHeight, 0, 0.35, 1.0);
    fill(this.r * brightness, this.g * brightness, this.b * brightness, this.alpha);
    text(this.text, this.x, this.y);
  }
}
