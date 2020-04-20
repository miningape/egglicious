
let lost = false;
let won = false;
class actor {
  constructor(sprite, holdSprite, xi, yi) {
    this.pos = {x: xi, y: yi};
    this.vel = 4;
    this.holding = true;
    this.attacking = false;
    this.sword = {x: 0, y: 0};
    this.dir = 0;
    this.timer = millis();
    this.sprite = sprite;
    this.hSprite = holdSprite;
    this.health = 7;
  }

  hit() {
    this.health -= 1;

    if (this.health < 0) {
      lost = true;
    }
  }

  draw () {
    imageMode(CENTER);
    if (this.holding) {
      image(this.hSprite, this.pos.x, this.pos.y, boxWidth, boxHeight);
    } else {
      image(this.sprite, this.pos.x, this.pos.y, boxWidth, boxHeight);
    }
  }

  attack (atk_dir) {
    this.attacking = true;
    this.timer = millis() + 500;

    switch(atk_dir) {
      case 1: // Atack up
        this.sword.x = 0;
        this.sword.y = -30;
        this.dir = 1;
        break;

      case 2: // atack down
        this.sword.x = 0;
        this.sword.y = 30;
        this.dir = 2;
        break;
      
      case 3: // attack left
        this.sword.x = -30;
        this.sword.y = 0;
        this.dir = 3;
        break;

      case 4: // attack right
        this.sword.x = 30;
        this.sword.y = 0;
        this.dir = 4;
        break;

      default:
        console.log("Attack in an unknown Direction");
        break;
    }
  }
}

class victim {
  constructor(sprite, xi = 0, yi = 0) {
    this.pos = {x: xi, y: yi};
    this.vel = 1;
    this.onGround = false;
    this.sprite = sprite;
  }

  draw () {
    imageMode(CENTER);
    if (this.onGround) {
      image(this.sprite, this.pos.x, this.pos.y, boxWidth, boxHeight);
    }
  }

}

class monster {
  constructor(sprite, xi = 0, yi = 0) {
    this.pos = {x: xi, y: yi};
    this.vel = 2;
    this.dir = {x: 0, y: 0};
    this.sprite = sprite;
    this.health = 12;
    this.runAway = false;
  }

  attack() {
    let player_distance = dist(player.pos.x, player.pos.y, this.pos.x, this.pos.y);
    let egg_distance = dist(baby.pos.x, baby.pos.y, this.pos.x, this.pos.y);
    if (!baby.onGround) {
    if (player_distance < min(boxHeight, boxWidth)- 20 ) {
      player.hit();
    } 
    } else {
      if (player_distance < min(boxHeight, boxWidth)- 20 ) {
        player.hit();
      } 
      if (egg_distance < 25 ) {
      lost = true;
    } }
  }

  seek () {
    let distance = dist(player.pos.x, player.pos.y, this.pos.x, this.pos.y);

    if (distance < 150){
      let desired = {x: baby.pos.x - this.pos.x, y: baby.pos.y - this.pos.y};

      let size = sqrt((desired.x*desired.x) + (desired.y*desired.y));

      this.dir.x = desired.x - this.dir.x;
      this.dir.y = desired.y - this.dir.y;

      size = sqrt((this.dir.x*this.dir.x) + (this.dir.y*this.dir.y));
      this.dir.x /= size;
      this.dir.y /= size;
      this.dir.x *= this.vel;
      this.dir.y *= this.vel;
    }

    if (this.runAway) {
      let desired = {x:  - player.pos.x + this.pos.x, y:  - player.pos.y + this.pos.y};

      let size = sqrt((desired.x*desired.x) + (desired.y*desired.y));

      this.dir.x = desired.x;
      this.dir.y = desired.y;

      size = sqrt((this.dir.x*this.dir.x) + (this.dir.y*this.dir.y));
      this.dir.x /= size;
      this.dir.y /= size;
      this.dir.x *= this.vel * 2;
      this.dir.y *= this.vel * 2;
    }
  }


  draw () {
    imageMode(CENTER);
    image(this.sprite, this.pos.x, this.pos.y, boxWidth, boxHeight);
  }

  hit () {
    this.runAway = true;
    this.health -= 1;
    setTimeout(() => {this.runAway = false}, 2000);
    if (this.health == 0) {return true} else {return false};
  }

  move () {
    //this.pos.x += this.dir.x;
    //this.pos.y += this.dir.y;

    let newPos = Object.assign({}, this.pos);

    newPos.x += this.dir.x;
    newPos.y += this.dir.y;

    // Detect what cell on the lvl map we are on
    let cell = lvl[floor(newPos.y/boxHeight)][floor(newPos.x/boxWidth)];

    // Hacky code that allows you so move even if you are touching a wall (needs to get fixed)
    if (cell == 0) {
      this.pos = Object.assign({}, newPos);
    } else {
      newPos = Object.assign({}, this.pos);
      newPos.y += this.dir.y/2; // w = up
      cell = lvl[floor(newPos.y/boxHeight)][floor(newPos.x/boxWidth)];
      if (cell == 0) { 
        this.pos = Object.assign({}, newPos) 
      } else {
        newPos = Object.assign({}, this.pos);
        newPos.x += this.dir.x/2; // D = right
        cell = lvl[floor(newPos.y/boxHeight)][floor(newPos.x/boxWidth)];
        if (cell == 0) { this.pos = Object.assign({}, newPos) }
      }
    }

  }
}

let lvl = [[5, 1, 1, 1, 1, 9, 1, 1, 1, 6],
           [2, 0, 0, 0, 0, 0, 0, 1, 6, 4],
           [2, 0, 0, 0, 0, 0, 0, 0, 0, 4],
           [2, 0, 10, 0, 0, 0, 0, 10, 10, 4],
           [2, 0, 10, 0, 0, 0, 0, 0, 0, 4],
           [2, 10, 0, 0, 0, 0, 0, 0, 0, 4],
           [2, 0, 0, 0, 0, 10, 0, 0, 10, 4],
           [2, 5, 6, 0, 0, 0, 0, 10, 0, 4],
           [2, 7, 8, 0, 0, 0, 10, 0, 0, 4],
           [7, 3, 3, 3, 3, 3, 3, 3, 3, 8]];

let radius = 170;

function drawStuff() {
  stroke(0);
  // Draw from sprite sheet and lvl
  imageMode(CORNER);
  for (let y = 0; y < lvl.length; y++) {
    let side = lvl[y];
    for (let x = 0; x < side.length; x++) {
      image(walls[side[x]], boxWidth * x, boxHeight * y, boxWidth, boxHeight);
    }
  }

  // draw characters
  monsters.forEach((mons) => {
    mons.draw();
  });

  baby.draw();

  player.draw();



  stroke(255, 0, 0);
  strokeWeight(3);
  if (player.sword.x != 0 || player.sword.y != 0) line(player.pos.x, player.pos.y, player.pos.x + player.sword.x, player.pos.y + player.sword.y);
 
  // Draw flashlight
  loadPixels();
  
  for (var y = 0; y < min(yy + radius, height); y++ ) {
    for (var x = 0; x < min(xx + radius, width); x++ ) {
      var loc = (x + (y * width)) * 4;
      // The functions red(), green(), and blue() pull out the three color components from a pixel.
      var r = pixels[loc   ]; 
      var g = pixels[loc + 1];
      var b = pixels[loc + 2];

      // Calculate an amount to change brightness
      // based on proximity to the baby
      var distance = dist(x, y, xx, yy);

      // The closer the pixel is to the player, the lower the value of "distance" 
      // We want closer pixels to be brighter, however, so we invert the value using map()
      // Pixels with a distance greater than the lightRadius have a brightness of 0.0 
      // (or negative which is equivalent to 0 here)
      // Pixels with a distance of 0 have a brightness of 1.0.
      var adjustBrightness = map(distance, 0, radius, 1, 0);

      r *= adjustBrightness;
      g *= adjustBrightness;
      b *= adjustBrightness;
      
      // Set the display pixel to the image pixel
      pixels[loc    ] = r;
      pixels[loc + 1] = g;
      pixels[loc + 2] = b;
      pixels[loc + 3] = 255; // Always have to set alpha
    }
  }

  updatePixels();

  fill(0);
  stroke(0);
  rect(0, baby.pos.y + radius, width,  height - (baby.pos.y + radius));
  rect(baby.pos.x + radius, 0, width,  baby.pos.y + radius);

  if (lost) {
    textSize(34);
    fill(0);
    rect(0, 0, width, height);
    fill(255);
    text("You Were Eaten with a side of fried egg \n\n\tRefresh the Page to Retry", 10, 10, 500, 500);
    noLoop();
  }

  if (won) {
    textSize(34);
    fill(0);
    rect(0, 0, width, height);
    fill(255);
    text("You Won! \n\n Thanks for playing \n the only level :)", 10, 10, 500, 500);
    noLoop();
  }
}

function handleInput() {

  // Doing movement
  let newPos = Object.assign({}, player.pos);

  // take input
  if (keyIsDown(87)) newPos.y -= (keyIsDown(65) || keyIsDown(68)) ? player.vel/1.4 : player.vel; // w = up
  if (keyIsDown(83)) newPos.y += (keyIsDown(65) || keyIsDown(68)) ? player.vel/1.4 : player.vel; // S = down
  
  if (keyIsDown(65)) newPos.x -= (keyIsDown(83) || keyIsDown(87)) ? player.vel/1.4 : player.vel; // A = left
  if (keyIsDown(68)) newPos.x += (keyIsDown(83) || keyIsDown(87)) ? player.vel/1.4 : player.vel; // D = right

  if (!player.attacking && !player.holding) {
    if (keyIsDown(UP_ARROW)) player.attack(1);
    if (keyIsDown(DOWN_ARROW)) player.attack(2);
    if (keyIsDown(LEFT_ARROW)) player.attack(3);
    if (keyIsDown(RIGHT_ARROW)) player.attack(4);
  }

  // Detect what cell on the lvl map we are on
  let cell = lvl[floor(newPos.y/boxHeight)][floor(newPos.x/boxWidth)];

  // Hacky code that allows you so move even if you are touching a wall (needs to get fixed)
  if (cell == 0 || (cell == 9 && open)) {
    player.pos = Object.assign({}, newPos);
  } else {
    newPos = Object.assign({}, player.pos);
    if (keyIsDown(87)) newPos.y -= player.vel/2; // w = up
    if (keyIsDown(83)) newPos.y += player.vel/2; // S = down
    cell = lvl[floor(newPos.y/boxHeight)][floor(newPos.x/boxWidth)];
    if (cell == 0 || (cell == 9 && open)) { 
      player.pos = Object.assign({}, newPos) 
    } else {
      newPos = Object.assign({}, player.pos);
      if (keyIsDown(65)) newPos.x -= player.vel/2; // A = left
      if (keyIsDown(68)) newPos.x += player.vel/2; // D = right
      cell = lvl[floor(newPos.y/boxHeight)][floor(newPos.x/boxWidth)];
      if (cell == 0 || (cell == 9 && open)) { player.pos = Object.assign({}, newPos) }
    }
  }

  // Handling baby
  if (keyIsDown(70) && babyTimer < millis()) {
    if (player.holding) player.holding = false 
    else {
      let distance = dist(player.pos.x, player.pos.y, baby.pos.x, baby.pos.y);
      if (distance <= 40) player.holding = true;
    }
    babyTimer = millis() + 300;
  }; // f = drop
}
let babyTimer;
function update() {
  let cell = lvl[floor(player.pos.y/boxHeight)][floor(player.pos.x/boxWidth)];

  if (cell == 9) won = true;

  // The player has just put baby on ground
  if (!player.holding && !baby.onGround) {
    baby.pos.x = player.pos.x;
    baby.pos.y = player.pos.y;
    baby.onGround = true;
  }

  // Player has just picked up the baby
  if (player.holding && baby.onGround) {
    baby.onGround = false;
  }

  // Baby is safe in arms
  if (player.holding) {
    baby.pos = Object.assign({}, player.pos);
  }

  let monDist = [];

  if (millis() > player.timer) { // Not attacking
    player.sword.x = 0;
    player.sword.y = 0;
    player.attacking = false;
  } else { // Are attacking
    monsters.forEach(monst => {
      monDist.push((dist(player.pos.x + (player.sword.x), player.pos.y + (player.sword.y), monst.pos.x, monst.pos.y) < 20) ? true : false);
    });
  }

  if (monsters.length == 0) {
    walls[9] = doorSheet.get(0, 16, 16, 16);
    open = true;
  }

  // Move monsters
  monsters.forEach((mons) => {
    mons.seek();
    mons.move();
    mons.attack();
  });

  for (let i = monsters.length - 1; i >= 0; i--) {
    if (monDist[i]) {
      let killed = monsters[i].hit();
      if (killed) monsters.splice(i, 1);
    }
  }
}

let open = false;

let sheet, n_wall, player, baby;
let boxHeight, boxWidth;
let tree;
let walls = [];
let monsters = [];

function preload() {
  sheet = loadImage("walls.png");
  pSprite = loadImage("dino.png");
  cSprite = loadImage("moma.png")
  bSprite = loadImage("egg.png")
  eSprite = loadImage("skeleton.png")
  doorSheet = loadImage("doors.png");
  tree = loadImage("tree.png");
}

function setup() {
  p5.disableFriendlyErrors = true;
  createCanvas(500, 500);
  pixelDensity(1);
  babyTimer = millis();
  walls.push(sheet.get(16, 16, 16, 16)); // 0 = free

  walls.push(sheet.get(16, 0, 16, 16)); // 1 = north wall
  walls.push(sheet.get(0, 16, 16, 16)); // 2 = west wall
  walls.push(sheet.get(16, 32, 16, 16)); // 3 = south wall
  walls.push(sheet.get(32, 16, 16, 16)); // 4 = east wall

  walls.push(sheet.get(0, 0, 16, 16)); // 5 = north-west corner
  walls.push(sheet.get(32, 0, 16, 16)); // 6 = north-east corner
  walls.push(sheet.get(0, 32, 16, 16)); // 7 = south-west wall
  walls.push(sheet.get(32, 32, 16, 16)); // 8 = south-east wall

  walls.push(doorSheet.get(16, 16, 16, 16));

  walls.push(tree);
  
  player = new actor(pSprite, cSprite, 250, 250);
  baby = new victim(bSprite);

  monsters.push(new monster(eSprite, 200, 200));
  monsters.push(new monster(eSprite, 100, 50));

  monsters.push(new monster(eSprite, 400, 450));
  monsters.push(new monster(eSprite, 450, 150));

  boxHeight = height / lvl.length;
  boxWidth = width / lvl[0].length;
}
let xx, yy;

function draw() {
  update();
  xx = baby.pos.x;
  yy = baby.pos.y;
  drawStuff();

  handleInput();

}