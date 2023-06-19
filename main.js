"use strict";
const CONSTNUM = 5000;
const CONSTPLIMIT = 5000;
const CONSTBORNB = 1; //-,08
const CONSTESA = 8; //5,7
const CONSTTHL = 500;
const CONSTDRAWLIMIT = 800;
const CONSTBASE = 80; //0,80
const CONSTSN = 500;
const CONSTR = 0.2;
const CONSTD = 10;
const CONSTLIM = 0;
document.oncontextmenu = function () {
  return false;
};
document.body.oncontextmenu = "return false;";
class Window {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.show = false;
    this.texts = [];
  }
  draw(ctx) {
    if (!this.show) {
      return;
    }
    ctx.fillStyle = "rgb(255, 255, 255)";
    this.x = this.x + this.width > canvasX ? this.x - this.width : this.x;
    this.y = this.y + this.height > canvasY ? this.y - this.height : this.y;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "rgb(0,0,0)";
    for (let i in this.texts) {
      ctx.fillText(this.texts[i], this.x + 22, this.y + 10 + i * 20);
    }
  }
  click(x, y) {
    if (
      this.x < x &&
      x < this.x + this.width &&
      this.y < y &&
      y < this.y + this.height
    ) {
      this.show = false;
      return true;
    }
    return false;
  }
}
class makeRandEv {
  rand() {
    let i = 0;
    if (Math.random() > 0.5) {
      i = 1;
    }
    return i;
  }
}
class Animation {
  constructor(images, waits) {
    this.images = images;
    this.num = 0;
    this.state = 0;
    this.waits = waits;
    this.countTime = 0;
  }
  addNum() {
    this.countTime++;
    if (this.countTime > this.waits[this.state][this.num]) {
      this.num++;
      this.countTime = 0;
    }
    this.num = this.num % this.images[this.state].length;
  }
  setState(state) {
    this.state = state;
  }
  getImage() {
    return this.images[this.state][this.num];
  }
}
class ActionPlan {
  constructor(a, parent, speed) {
    this.action = a;
    this.parent = parent;
    this.speed = speed;
  }
  getActionPlan() {
    let x = this.action(this.parent);
    this.parent.speedX = this.limitAdd(this.parent.speedX, x[0], this.speed);
    this.parent.speedY = this.limitAdd(this.parent.speedY, x[1], this.speed);
  }
  limitAdd(a, b, lim) {
    const num = a + b;
    if (a + b > lim) {
      return lim;
    }
    if (a + b < -lim) {
      return -lim;
    }
    return num;
  }
}
class PosList {
  constructor() {
    this.spriteList = [];
    this.material = [];
    this.wallList = [];
    this.grassList = [];
    this.feedList = [];
    this.fishList = [];
    this.poolList = [];
  }
  addList(m) {
    if (m.collisionType == true) {
      this.wallList.push(m);
    }
    if (m.attribute == "Grass") {
      this.grassList.push(m);
    }
    if (m.attribute == "Feed") {
      this.feedList.push(m);
    }
    if (!m.isVirtual) {
      if (this.spriteList.length > NUMLIMIT && m.attribute == "Fish") {
        this.poolList.push(m);
      } else {
        this.spriteList.push(m);
        this.material.push(m);
      }
    } else {
      this.material.push(m);
    }
  }
  check() {
    this.spriteList = this.spriteList.filter((m) => m.alive == true);
    this.material = this.material.filter((m) => m.alive == true);
    this.wallList = this.wallList.filter((m) => m.alive == true);
    this.grassList = this.grassList.filter((m) => m.alive == true);
    this.feedList = this.feedList.filter((m) => m.alive == true);
  }
  poolcheck() {
    while (this.spriteList.length < NUMLIMIT && this.poolList.length > 0) {
      this.spriteList.push(this.poolList.pop());
    }

    while (this.poolList.length > CONSTPLIMIT) {
      this.poolList.shift();
    }
  }
  getFeedList() {
    return this.feedList;
  }
  isCollisionGrass(m) {
    return this.grassList.filter((k) => k.isCollision(m) == true);
  }
  isCollisionList(m) {
    return this.material.filter((k) => k.isCollision(m) == true);
  }
  isCollisionWall(m) {
    return this.wallList.filter((k) => k.isCollision(m) == true);
  }
  isCollisionFish(m) {
    return this.spriteList.filter((k) => k.isCollision(m) == true);
  }
  getTypeList(type) {
    return this.material.filter((k) => k.attribute === type);
  }
  getTypeCollision(type, m) {
    return this.material
      .filter((k) => k.attribute === type)
      .filter((k) => k.isCollision(m) == true);
  }
}

class Position {
  constructor(x, y, width, height, eps, parent, relparent, isStop) {
    this.relPosX = x;
    this.relPosY = y;
    this.baseWidth = width;
    this.baseHeight = height;
    this.eps = eps;
    this.parent = parent;
    this.relparent = relparent;
    this.isStop = isStop;
    this.stopper = false;
  }
  get width() {
    return this.baseWidth * this.parent.size;
  }
  get height() {
    return this.baseHeight * this.parent.size;
  }
  get x() {
    if (this.relparent == null) {
      return this.relPosX;
    } else {
      return this.relPosX + this.relparent.x;
    }
  }
  get y() {
    if (this.relparent == null) {
      return this.relPosY;
    } else {
      return this.relPosY + this.relparent.y;
    }
  }
  noColAddXY(add) {
    this.relPosX += add[0];
    this.relPosY += add[1];
  }
  set setX(val) {
    const bf = this.relPosX;
    this.relPosX = val;
    if (pos.isCollisionWall(this).length > 0 || this.stopper) {
      this.relPosX = bf;
    }
  }
  set setY(val) {
    const bf = this.relPosY;
    this.relPosY = val;
    if (pos.isCollisionWall(this).length > 0 || this.stopper) {
      if (
        !this.stopper &&
        this.isStop &&
        pos.isCollisionWall(this).filter((m) => m.attribute === "BOTTOM")
          .length > 0
      ) {
        this.stopper = true;
      }
      this.relPosY = bf;
    }
  }

  getPosition() {
    return this;
  }
  getParent() {
    return parent;
  }
  isCollision(difPos) {
    const epsilon = this.eps + difPos.eps;
    const check = (a1, a2, b1, b2) => {
      if (a2 < b1 - epsilon) {
        return false;
      } else if (b2 < a1 - epsilon) {
        return false;
      } else {
        return true;
      }
    };
    let x1 = difPos.x;
    let x2 = difPos.width + x1;
    if (check(x1, x2, this.x, this.x + this.width)) {
      let y1 = difPos.y;
      let y2 = difPos.height + y1;
      if (check(y1, y2, this.y, this.y + this.height)) {
        return true;
      }
    }
    return false;
  }
  getDistanceXY(difPos) {
    const epsilon = this.eps - difPos.eps;
    const check = (a1, a2, b1, b2) => {
      if (a2 < b1 - epsilon) {
        return b1 - epsilon - a2;
      } else if (b2 < a1 - epsilon) {
        return b2 - (a1 - epsilon);
      } else {
        return 0;
      }
    };
    let x1 = difPos.x;
    let x2 = difPos.width + x1;
    let y1 = difPos.y;
    let y2 = difPos.height + y1;
    const x = check(x1, x2, this.x, this.x + this.width);
    const y = check(y1, y2, this.y, this.y + this.height);
    return [x, y];
  }
}
class VirtualSprite {
  constructor(
    x,
    y,
    width,
    height,
    eps,
    attribute,
    name,
    actionPlan,
    posParent,
    collisionType,
    isStop,
    size
  ) {
    this.isVirtual = true;
    this.position = new Position(
      x,
      y,
      width,
      height,
      eps,
      this,
      posParent,
      isStop
    );
    this.actionPlan = actionPlan;
    this.collisionType = collisionType;
    this.speedX = 0;
    this.speedY = 0;
    this.parent = null;
    this.attribute = attribute;
    this.name = name;
    this.alive = true;
    this.size = size;
  }
  getSpeedX() {
    return this.speedX;
  }
  getSpeedY() {
    return this.speedY;
  }
  getPosition() {
    return this.position;
  }
  getParent() {
    return this.parent;
  }
  isCollision(difPos) {
    return this.position.isCollision(difPos);
  }
  getAttribute() {
    return this.attribute;
  }
  getName() {
    return this.name;
  }
  isAlive() {
    return this.alive;
  }
  setAlive() {
    this.alive = true;
  }
  killAlive() {
    this.alive = false;
  }
  move() {
    this.actionPlan.getActionPlan();
    const beforeX = this.position.x;
    const beforeY = this.position.y;
    this.position.setX = this.position.x + this.speedX;
    this.position.setY = this.position.y + this.speedY;
    this.animation.addNum();
  }
}
class Sprite extends VirtualSprite {
  constructor(
    x,
    y,
    width,
    height,
    eps,
    attribute,
    name,
    actionPlan,
    animation,
    isTurn,
    posParent,
    collisionType,
    isStop,
    contents,
    size
  ) {
    if (attribute == "Fish") {
      super(
        x,
        y,
        width,
        height,
        eps,
        attribute,
        name,
        contents.getAction(),
        posParent,
        collisionType,
        isStop,
        size
      );
    } else {
      super(
        x,
        y,
        width,
        height,
        eps,
        attribute,
        name,
        actionPlan,
        posParent,
        collisionType,
        isStop,
        size
      );
    }
    this.actionPlan.parent = this;
    this.isVirtual = false;
    this.animation = animation;
    this.isTurn = isTurn;
    this.contents = contents;
  }
  getImage() {
    if (this.isTurn) {
      return [
        this.animation.getImage(),
        this.position.getPosition(),
        this.speedX,
      ];
    } else {
      return [this.animation.getImage(), this.position.getPosition(), -1];
    }
  }
  getContents(attribute) {
    if (attribute === this.attribute) {
      return contents;
    }
    return null;
  }
}
class GrassContents {
  constructor() {
    this.parent = null;
    this.fEgg = [];
    this.mEgg = [];
  }
  addFish() {
    if (count % SEASON == SEASON - 1) {
      if (this.fEgg.length > this.mEgg.length) {
        this.eggToFish(this.mEgg, this.fEgg);
      } else {
        this.eggToFish(this.fEgg, this.mEgg);
      }
      this.fEgg = [];
      this.mEgg = [];
    }
    if (count % SEASON == 599) {
      this.fEgg = [];
      this.mEgg = [];
    }
  }
  eggToFish(a, b) {
    for (let x in a) {
      if (b.length != 0) {
        let num = Math.floor(b.length * Math.random());
        let spA = a[x];
        let spB = b[num];
        makeChildFish(
          spA[0],
          spB[0],
          this.parent.getPosition().x,
          this.parent.getPosition().y,
          (spA[1] + spB[1]) * CONSTBORNB + CONSTBASE
        );
        b.splice(num, num);
      }
      if (b.length == 0) {
        break;
      }
    }
  }
}
class FishGenome {
  constructor(vf, vb, speed, acceleration, sex, motion, mark, red) {
    this.vf = vf;
    this.vb = vb;
    this.speed = speed;
    this.acceleration = acceleration;
    this.sex = sex;
    this.motion = motion;
    this.mark = mark;
    this.red = red;
  }
}
class FishContents {
  constructor(genA, genB, hp, age) {
    this.genA = genA;
    this.genB = genB;
    this.hp = hp;
    this.sizeUpCoolTime = 0;
    this.age = age;
  }
  meiosis() {
    return rnd.rand() == 1
      ? this.makeMeiosis(this.genA, this.genB, 10, 1, 3, 1)
      : this.makeMeiosis(this.genB, this.genA, 10, 1, 3, 1);
  }
  makeMeiosis(mainG, subG, a1, b1, a2, b2) {
    let n = new FishGenome(
      mainG.vf,
      mainG.vb,
      mainG.speed,
      mainG.acceleration,
      mainG.sex,
      mainG.motion,
      mainG.mark,
      mainG.red
    );
    if (this.crossoverRand(a1, b1)) {
      n.vf = subG.vf;
    }
    if (this.crossoverRand(a1, b1)) {
      n.vb = subG.vb;
    }
    if (this.crossoverRand(a1, b1)) {
      n.speed = subG.speed;
    }
    if (this.crossoverRand(a1, b1)) {
      n.acceleration = subG.acceleration;
    }
    if (this.crossoverRand(a1, b1)) {
      n.motion = subG.motion;
    }

    if (this.crossoverRand(a1, b1)) {
      n.red = subG.red;
    }

    if (this.crossoverRand(a2, b2)) {
      n.vf *= 0.95 + Math.random() * 0.1;
    }
    if (this.crossoverRand(a2, b2)) {
      n.vb *= 0.95 + Math.random() * 0.1;
    }
    if (this.crossoverRand(a2, b2)) {
      n.speed *= 0.95 + Math.random() * 0.1;
    }
    if (this.crossoverRand(a2, b2)) {
      n.acceleration *= 0.95 + Math.random() * 0.1;
    }
    if (this.crossoverRand(3, 1)) {
      n.motion = Math.floor(5 + Math.random() * 10);
    }
    if (this.crossoverRand(IROCHIGAI, 1)) {
      n.red = !n.red;
    }
    return n;
  }
  crossoverRand(a, b) {
    return Math.random() * a < b ? true : false;
  }
  get motion() {
    return this.genA.motion > this.genB.motion
      ? this.genA.motoin
      : this.genB.motion;
  }
  get vf() {
    return this.genA.vf > this.genB.vf ? this.genA.vf : this.genB.vf;
  }
  get vb() {
    return this.genA.vb > this.genB.vb ? this.genA.vb : this.genB.vb;
  }
  get speed() {
    return this.genA.speed > this.genB.speed
      ? this.genA.speed
      : this.genB.speed;
  }
  get acceleration() {
    return this.genA.acceleration > this.genB.acceleration
      ? this.genA.acceleration
      : this.genB.acceleration;
  }
  get sex() {
    if (this.genA.sex == 0 && this.genB.sex == 0) {
      return 0;
    }
    if (this.genA.sex == 1 && this.genB.sex == 0) {
      return 1;
    }
    if (this.genA.sex == 0 && this.genB.sex == 1) {
      return 1;
    }
    if (this.genA.sex == 1 && this.genB.sex == 1) {
      return -1;
    }
  }
  sizeUp(t) {
    let wk = t.getPosition().getPosition().width;
    if (wk > 150) {
      return;
    }
    if (this.hp < 100 || this.sizeUpCoolTime > 0) {
      return;
    }
    this.hp -= 10;
    this.sizeUpCoolTime = 30;

    t.size *= 1.01;
    let w = t.getPosition().getPosition().width;
    let h = t.getPosition().getPosition().height;
    t.getPosition()
      .getPosition()
      .noColAddXY([w * 0.01, h * 0.01]);
    if (pos.isCollisionWall(t.getPosition().getPosition()).length > 0) {
      t.getPosition()
        .getPosition()
        .noColAddXY([-w * 0.021, 0]);
      if (pos.isCollisionWall(t.getPosition().getPosition()).length > 0) {
        t.getPosition()
          .getPosition()
          .noColAddXY([w * 0.025, -h * 0.021]);
        if (pos.isCollisionWall(t.getPosition().getPosition()).length > 0) {
          t.getPosition()
            .getPosition()
            .noColAddXY([-w * 0.03, 0]);
        }
      }
    }
  }
  getAction() {
    return new ActionPlan(
      (t) => {
        this.sizeUpCoolTime--;
        this.age++;
        if (this.hp < 0 || this.age > SEASON + 100) {
          t.killAlive();
        }
        const accel = this.acceleration;
        let x = Math.random() * accel - accel / 2;
        let y = Math.random() * accel - accel / 2;
        const tPos = t.getPosition();
        const frontView = this.vf;
        const backView = this.vb;
        let listF = pos.getFeedList();
        if (listF.length > 0) {
          let min;
          if (t.speedX > 0) {
            let num = listF[0].getPosition().getPosition().getDistanceXY(tPos);
            let xm = num[0] > 0 ? num[0] / frontView : num[0] / backView;
            let ym = num[1];
            min = xm * xm + ym * ym;
          } else {
            let num = listF[0].getPosition().getPosition().getDistanceXY(tPos);
            let xm = num[0] < 0 ? num[0] / frontView : num[0] / backView;
            let ym = num[1];
            min = xm * xm + ym * ym;
          }
          let minNum = 0;
          for (let i = 0; i < listF.length; i++) {
            let number = listF[i]
              .getPosition()
              .getPosition()
              .getDistanceXY(tPos);

            if (t.speedX > 0) {
              let num = listF[i]
                .getPosition()
                .getPosition()
                .getDistanceXY(tPos);
              let x = num[0] > 0 ? num[0] / frontView : num[0] / backView;
              let y = num[1];
              number = x * x + y * y;
            } else {
              let num = listF[i]
                .getPosition()
                .getPosition()
                .getDistanceXY(tPos);
              let x = num[0] < 0 ? num[0] / frontView : num[0] / backView;
              let y = num[1];
              number = x * x + y * y;
            }
            if (number <= 0) {
              listF[i].killAlive();
              this.hp += 60;
            }
            if (min > number) {
              min = number;
              minNum = i;
            }
          }
          if (min < 10000) {
            let xy = listF[minNum]
              .getPosition()
              .getPosition()
              .getDistanceXY(tPos);
            x += xy[0] / 1000;
            y += xy[1] / 1000;
          }
        }
        this.hp -= CONSTR;
        this.sizeUp(t);
        if (tPos.width > 100 && this.hp > 90) {
          let listG = pos.isCollisionGrass(tPos);
          if (listG.length > 0) {
            for (let g1 in listG) {
              let gen = this.meiosis();
              const TH = CONSTTHL;
              if (this.sex == 0 && this.hp > TH) {
                //if(listG[g1].contents.fEgg.length){
                let sh = (this.hp - TH) / 5;
                sh = sh > TH * 100 ? TH * 100 : sh;
                let add =
                  sh > TH * 100 ? (TH * 100(sh - TH * 100)) / 100 + 1000 : sh;
                listG[g1].contents.fEgg.push([gen, add / 10 + 10]);
                t.hp -= TH - 10 + sh;
                x += x > 0 ? accel : -accel;
                //}
              } else if (this.sex == 1 && this.hp > 90) {
                //if(listG[g1].contents.mEgg.length < 30){
                let adb = (this.hp - 90) / 5;
                for (let number = 0; number < adb; number++) {
                  listG[g1].contents.mEgg.push([gen, 0]);
                  gen = this.meiosis();
                }
                t.hp -= adb * 3;
                //}
              }
            }
          }
        }
        if (count % SEASON > SEASON - 1300) {
          y += accel * 0.8;
        }
        x = x > this.accel ? this.accel : x < -this.accel ? -this.accel : x;
        y = y > this.accel ? this.accel : y < -this.accel ? -this.accel : y;
        return [x, y];
      },
      null,
      this.speed
    );
  }
}

function onClick(e) {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (x < 50 && y < 50) {
    addMode = (addMode + 1) % 8;
  } else if (addMode == 0) {
    const h = 30;
    const w = 100;
    const nX = x + w > canvasX ? canvasX - 10 - w : x;
    const nY = y + h > canvasY ? canvasY - 10 - h : y;

    makeManyFish(nX, nY, 1, 1, 1, 0.5, 0, 0);
  } else if (addMode == 1) {
    const h = 20;
    const w = 20;
    const nX = x + w > canvasX ? canvasX - 10 - w : x;
    const nY = y + h > canvasY ? canvasY - 10 - h : y;
    makeFeed(nX, nY);
  } else if (addMode == 2) {
    const h = 100;
    const w = 30;
    const nX = x + w > canvasX ? canvasX - 10 - w : x;
    const nY = y + h > canvasY ? canvasY - 10 - h : y;
    makeGrass(nX, nY);
  } else if (addMode == 3) {
    const fish = getClickColision("Fish", x, y, "click");
    console.log(fish);
    for (let s in fish) {
      fish[s].killAlive();
    }
  } else if (addMode == 4) {
    const fish = getClickColision("Feed", x, y, "click");
    console.log(fish);
    for (let s in fish) {
      fish[s].killAlive();
    }
  } else if (addMode == 5) {
    const fish = getClickColision("Grass", x, y, "click");
    console.log(fish);
    for (let s in fish) {
      fish[s].killAlive();
    }
  } else if (addMode == 6) {
    console.log(getClickColision("Fish", x, y, "threat"));
  } else if (addMode == 7) {
    let tmp = getClickColision("Fish", x, y, "click");
    if (tmp.length > 0) {
      subWindow.x = x;
      subWindow.y = y;
      subWindow.show = true;
      subWindow.texts = [
        tmp[0].name,
        tmp[0].contents.vf,
        tmp[0].contents.vb,
        tmp[0].contents.speed,
        tmp[0].contents.acceleration,
      ];
    } else {
      subWindow.show = false;
    }
  }
}
function getClickColision(name, x, y, attribute) {
  const tmpCollision = new VirtualSprite(
    x,
    y,
    5,
    5,
    0,
    attribute,
    attribute,
    new ActionPlan(() => {
      return [0, 0];
    }, null),
    null,
    true,
    false,
    1
  );
  const ans = pos.getTypeCollision(
    name,
    tmpCollision.getPosition().getPosition()
  );
  tmpCollision.killAlive();
  return ans;
}
function getName() {
  const patterns =
    "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん".split(
      ""
    );
  return (
    patterns[Math.floor(Math.random() * patterns.length)] +
    patterns[Math.floor(Math.random() * patterns.length)]
  );
}
function makeChildFish(a, b, x, y, hp) {
  const motion = a.motion > b.motion ? a.motion : b.motion;
  const red = a.red && b.red;
  let anim;
  if (red) {
    anim = new Animation([[aka1, aka2]], [[motion, motion]]);
  } else {
    anim = new Animation([[chara1, chara2]], [[motion, motion]]);
  }
  const fishc = new FishContents(a, b, hp, 0);
  /*
if(fishc.sex == 0){
  seF++;
}else if(fishc.sex == 1){
  seM++;
}
if(seF >= (2*seM)){
  a.sex = 0;
  b.sex = 1;
  console.log(b.sex);
  seF--;
  seM++;
}else if(seM >= (2*seF)){
  a.sex = 0;
  b.sex = 0;
  seF++;
  seM--;
}
*/
  const THISACTION = null;
  const ac = new ActionPlan(THISACTION, null, fishc.speed);
  x = x + 50 > canvasX ? canvasX - 60 : x;
  y = y + 15 > canvasY ? canvasY - 20 : y;
  const vs = new Sprite(
    x,
    y,
    50,
    15,
    0.2,
    "Fish",
    getName(),
    ac,
    anim,
    true,
    null,
    false,
    false,
    fishc,
    1
  );
  ac.parent = vs;
  pos.addList(vs);
  return vs;
}
function makeFish(x, y, ads, advf, advb, adac, mark, isred) {
  const motion = Math.floor(Math.random() * 6) + 8;

  let red = Math.floor(Math.random() * IROCHIGAI * IROCHIGAI) == 0 || isred;
  let anim;
  if (red) {
    anim = new Animation([[aka1, aka2]], [[motion, motion]]);
    mark = 1;
  } else {
    anim = new Animation([[chara1, chara2]], [[motion, motion]]);
    mark = 0;
  }
  const speed = ads + Math.random() * 0.2;
  const acceleration = adac + Math.random() * 0.05;
  const frontView = advf + Math.random() * 0.2;
  const backView = advb + Math.random() * 0.2;
  const sex = Math.random() > 0.5 ? 1 : 0;
  const fishc = new FishContents(
    new FishGenome(
      frontView,
      backView,
      speed,
      acceleration,
      0,
      motion,
      mark,
      red
    ),
    new FishGenome(
      frontView,
      backView,
      speed,
      acceleration,
      sex,
      motion,
      mark,
      red
    ),
    100,
    0
  );
  const THISACTION = null;
  const ac = new ActionPlan(THISACTION, null, speed);
  const vs = new Sprite(
    x,
    +y,
    50,
    15,
    0.2,
    "Fish",
    getName(),
    ac,
    anim,
    true,
    null,
    false,
    false,
    fishc,
    1
  );
  ac.parent = vs;
  pos.addList(vs);
  return vs;
}

function makeFeed(x, y) {
  let anim;
  if (esaCount == 0) {
    esaCount++;
    anim = new Animation([[esaIm1]], [[1]]);
  } else if (esaCount == 1) {
    esaCount = 0;
    anim = new Animation([[esaIm2]], [[1]]);
  }
  const ac = new ActionPlan(
    () => {
      return [Math.random() * 0.1 - 0.05, 0.1];
    },
    null,
    0.5
  );
  const vs = new Sprite(
    x,
    y,
    20,
    20,
    0.1,
    "Feed",
    "",
    ac,
    anim,
    false,
    null,
    false,
    true,
    null,
    1
  );
  ac.parent = vs;
  pos.addList(vs);
  return vs;
}
function makeGrass(x, y) {
  const anim = new Animation([[kusaIm]], [[1]]);
  const ac = new ActionPlan(null, null, 1);
  const gc = new GrassContents();
  const vs = new Sprite(
    x,
    y,
    30,
    100,
    0.1,
    "Grass",
    "",
    ac,
    anim,
    false,
    null,
    false,
    true,
    gc,
    1
  );
  ac.action = () => {
    vs.contents.addFish();
    return [Math.random() * 0.1 - 0.05, 0.1];
  };
  gc.parent = vs;
  ac.parent = vs;
  pos.addList(vs);
  return vs;
}
function makeManyFish(px, py, num, s, f, b, a, m) {
  for (let x = 0; x < num; x++) {
    makeFish(px, py, s, f, b, a, m, false);
  }
}
function drawImage(x, t) {
  x.move();
  if (t) {
    return;
  }
  const m = x.getImage();
  ctx.save();
  if (m[2] > 0) {
    ctx.scale(-1, 1);

    ctx.drawImage(m[0], -m[1].x, m[1].y, -m[1].width, m[1].height);
  } else {
    ctx.drawImage(m[0], m[1].x, m[1].y, m[1].width, m[1].height);
  }
  ctx.restore();
}
function dispText(text) {
  return;
  var blob = new Blob([text], { type: "text/plain" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "suisou.txt";
  link.click();
}
let pool = [];
let rnd = new makeRandEv();
let esaCount = 0;
const canvasX = 1500;
const canvasY = 720;
const SEASON = 3000;
const IROCHIGAI = 64;
let year = 0;
let addMode = 0;
let NUMLIMIT = CONSTNUM;
let can = document.getElementById("canvas");

can.addEventListener("click", onClick, false);
let ctx = can.getContext("2d");
let seF = 0;
let seM = 0;
let count = 0;
let outputlogs = "";
const aka1 = new Image();
aka1.src =
  "data:image/png;base64,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";

const aka2 = new Image();
aka2.src =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA3QAAAD3CAYAAABVXBZQAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAADmwSURBVHhe7d09iCRJmubxhaZ3cqZhqR5WyN67gWZZIUdL7ZIdJVfrveG45HaEVhYKWik4bilYJYWGaa3FguWgxBZLLA4OSrsWUyyxxBTrlKPFEg6u7n2iw7ItLB/38IjwD3P3v8GPzLSIjA//MLfX7esvPn78CAAAAACYIZsJAAAAAKifzQQAAAAA1M9mAgAAAADqZzMBAAAAAPWzmQAAAACA+tlMAAAAAED9bCYAAAAAoH42EwAAAABQP5sJAAAAAKifzQQAAAAA1M9mAgAAAADqZzMBAAAAAPWzmQAAAACA+tlMAAAAAED9bCYAAAAAoH42EwAAAABQP5sJAAAAAKifzQQAAAAA1M9mAgAAAADqZzMBAAAAAPWzmQAAAACA+tlMAAAAAED9bCYAAAAAoH42EwAAAABQP5sJAAAAAKifzQQAAAAA1M9mAgAAAADqZzMBAAAAAPWzmQAwd5GehvugP/qi13vm3g8AAGAKNhMA5ijSEEFcGwI8AAAwKZsJAHMR6Un4bhtc5cHWmPTeL8O1+4wAAABDsZkAULtIX20DqTyw2vH1119//PDhw8f/8+//7mR6nadPn9r3KbwPz91nBgAA6JvNBIDabQOnPJDa6DOIa9MhwPvOfW4AAIA+2UwAqFWki3C3DZo2vvzyy48//PCDDbzG8Pbt24/Pnz/ffI78c20xzg4AAAzGZgJATZ48efJ5BEV2nJwCKRdkTUGtdl999dXO52uh7/IinLvvDAAA0IXNBIBaRHoWAV0eCG2cnZ19/P77721gNaUDxtrlCO4AAMBRbCYATClS6/IDV1dXH9+9e2cDqpocGdzltA2YPRMAADSymQAwpkh7Z6ycepxc316/fv3x8vLSftcW2kaMxwMAAA9sJgAMJdLB68aNNXPlVP75n//Zfu+OtB3prgkAwErZTADoW6S9rXC5pQdxiVody9kx02N7Zs90aMEDAGBlbCYA9CHSQUHcs2fPdoKdpfvzn//8aBsokHXPPXA8nrb5rdsnAABgWWwmABzr7Ozsn7YBRRlkPFjaeLguXEtc6ZhWybaxePF+/8HtIwAAsBw2EwCOEelcywnkQUVpLa1wXQK4RGvXndq91LXgbd//ReyTL9z+AgAA82czAeAQkVqXGVhyEPfmzZvOgZvT91hBjbsr32MbZBPYAQCwQDYTANpEag3gRF0BXcAxZ7UFb00UQLv3J7ADAGB5bCaAZYuUJiuRp9u8vUFaV+pC6AKNWp0aqDWZeqbOpvF128COSVMAAFgAmwlguSL971Sx79PUwcuh+g7iau5W2jJxigJ4WuwAAJgxmwlgWSL11vqWzC2Ay2nCkidPntjv1cVcxwTuabEjsAMAYIZsJoB5i2DlP0UF/eAAbs5BWhf7WuXWMAOn9m/TenYpsAvn7rgCAAD1sZkA5kvBXJfWpzUEL6Xz83O2Q6ZtDbutTZfMQIAHAEClbCaA+Yr0PuSV8o2lt77to9Y5tofXIbBLFOA9c8cdAACYhs0EME+qbG8r3htrbn0qla1z7jlrd0Bg9507/gAA6xHpicvH+GwmgHmJlJYhSBXuTQuUq7SvVb5tCHS7oUsmAKxDpNttmR5/bv6+DCrfU93iy6AJ1n7I8uS74u+N9LoYh80EMC+RHnWznHN3wp9++unjn//850HWhuvCfaa10/Gk9QXd9soQ4AHABCKl2ayfhJ0gq3yuRNq0rj158uRv4/e79Nwh5e+PftlMAPMRaaebpYzZAjV18DUWfT8td+C2wVq0zZC5hyoWmwXsAQD9iqQArix3u/julCV8+lJ+HxzOZgKoX6TBulkqcFl6gNYHbaOXL1/abbgGB4y5SzYteKx3BwC7Il3mf0eg9XnkPYxXjpRa3n4Kebn6IPWiKG9Als8rXV1dfXz37t1O+T4E994dcVNwD5sJoB6RHgVuTZq6Wc4xQBuzReyIwOQRfd7vv//evv5adN2O2/XuXgdVTq4DA+sBrEKkTeCWArbwNqTy8Wab9zprOet0/U8zNx8y3GLM62wb932MD+W2xC9sJoDpRUr94fMCrZG6WSqpUj128FbLRWEoCtTc93bevn1rX2OtDtl2BR37LJEAoHoKztLvkdJkIm+3f+umlSYceRXSNf3FKV0d1aKmG2NLvIn4/v37dNPvkbSN8ZjNBDCNSJ1b45J8vFxbQXgo1mlrd+x4MgW/2rbqqjlGF5epaf2/VHH59NNPT24JDQR6AKqQWtm2ZZxa1g66fudc2VjenM1vni7x+qEx+bo+5t8588btA/zMZgKYRqTGi8G+iU72daskQBuOWuXcNj+G9uFSxuXpmCzvQitf20uPPX/+/OP19fXO4weywV1sw/+yfUwYdwGgd5Fuj2lly9dEzQM0ubm52Uwypp42qbdH/viS6bpntqdm8H4Zrt0+wC9sJoBpRFK3jIfC7JNPPtncsXKFn7QFcboguP/BMBRwu/3Ql7kFeqqUlN+h6+yrx7Z+hk2AV5wTjLsAcJIINP4mypI3qUzZ/ty4uLh4uBavJfjqUx7girZj+Be3H9DMZgKYTqSz1OVAldq84Ou6RIBmusr/D/XQXdcXL15s7sQec3dXtP/VuqUutu49pqLulU3HZtdgrk3XQO/zzz/f+bs8xwCgiyij8y6VO5Y6hq2LvKx3eZKCXGkLdNPzRXWX8JnbF2hnMwFM61//9V9/Fxorx03oVjlvJ7RM7dBxM0bA1xbAJbpAj31Mms/xP915BgClSJrE5F141KUyjVEfa5r/Q6QAyj2Wc8FY+Vj6O7+JrL/Te+TbpAttt/SaOV2jiueeuX2C/WwmgOFFSjNhNY6b64IgbvlqCfS6BHC5KY9Nfc/8s0SF4n+58xAAJMqIL6Ks0HIqO2VHkoK42lrlusxsfWwg1pemHhrlUIVyn6A7mwngdJHSIqAnBWwlFcpt3RewfF3Xe+tKx5SCr7aZNxXMde0i2kf3ylMpkEyL7Mr2zjqzYwJ4EOXC76NcuAu32zLikRqvuWlsfZ8zWx+jDMhSnj6bfm+7qWfGWW+WecBxbCaAw0TqPXgjcMOx+gz4dByqtet3v/udfVxqCOAcVSRMZec7dw4DWJdIz5uCIQUiuoFVW2tc3tLmxtPrc+d/t3HBmJPqIunvU3tetLQo3rj9hG5sJoBmkXoJ3jSzkwrUH3/80RZ6QN/6DvRub28n61LZVcPC5gR1wMpE8PZN+Ps4/3eu3ZqlUj+nLs/SDdyuk5/l5jARmloTy67wQYutn4nbZ+jOZgL4WRT+/xQFzdGBW7qz5Qo3oBanzLypytDd3Z193VqokpZ3v5Q4t7915zyA5bm8vPyDWuMkLwc0Nlnlw5RlmAK4FOh0CeJSC9nc6hf6jsX2p0WuRzYTwGZx4n9XFv5tCN6wRIe26uk8qLHluQzqtuc2Y+qAhYvy6zdlGabzv4brddexyVPMFtyn+/v7MphjvFzPbCawRpHU7K/pirW496u2O2UEb1g7Hf+HtuY5Opd0x7ltQpa+qEJkbtKoBZ7ADlioSN9vz/UN9SqoYcmBtglN8jrGqWPWaqAZQovvSOtcz2wmsAaRnobUnfLD9qelVgpXSAFrpgpJ2ZXxVBpbOmSA1zCmThhXByyMzuvsHN8EUFMFcwrQ0o1i/Z1PSqJyT4/PvSXOMWXundtXOI3NBJYo0lHrvqmAdYUUgMc0Hk9jJdpauPvi3r8LVZga1vWjtQ6YkShnfqufkZ6Hn0J5Tm9MGSiZ6fl3LLmOkU+Com6v4b+X+xD9sJnAEkTKW+A6UbcA3TVT60DtEz0AS3DKhCziXrMrVfAaWhhprQMqd3Z29vfbG0eNi4HLVMGcArkymEufJf29hO6UbdTymH1/ulkOyGYCcxPpqKUEll6YAnNzaIDnXuMQOv9prQPqFenL8DT7e9Pbxo0/S2PPpl4WyLXKTdlKOAV1yc+/f9p/GIbNBGoW6ajgjXXfgPlTy7kCsKbJBBQEHnOeq6LV0FonBHfAyCJpgrL8Ov9D8feOtASBO7/HpB4+5WdbWzCnbZCPEQzMajkwmwlMKdLmblxoLby7oAUOWCat3aRKQ1oUuCvdwde4Dt09Ll9TZUVDa11J5dJDiwGAfkS6PTs7+338vAvlefeIzn/d3EkzQk7NzVy5tmBOiq6WQnfLgdlMYEyRegngUlcLV7gAWK5jJmJRpUuzr7nX6xjYfXDlGYDDRboImyCuDIj0d956Xva2mXoJAt1cUhdL/dRN5PQ5NQnIGoO5sqtleOP2OfplM4EhRSq7URyM4A2Ac2hwp4qYe52kLbgryzYAuyI9C5p9UsMk3odH51EuBXOaoKyGteKaKHjLZ3AsKZBz/7dkWt7JjHumq+VIbCYwhEhatPvd9iRvlO7G6e45M00C6JMqHbpznpc5+4K6XP5/gW6XQINIO2vA7ZOCuKaW8xqorFBX7zJwSTeQ1nyz2XSzFLpajsRmAn2Kgu9v4qR+VZzkDwjgAIxJrW55Fy5RFy43rq5UdAej2yVgRLLBnM4fzWCbJg7RGDi1dL1588aeb1MpgzK1/De11KdulWvvNVRsFw2joavliGwm0IdIm6mFyztZ+rvmO3AAls8FdapsagyMKptN3b1UduX/U5Z7wFpFutz+3AnmdJ65lqv7+/udv2ugz5i3tuXfo7Tm1rgSSxRMz2YCx4pg7fM4mRuXFFBlqctdcAAYmoI6tRa4skrUhUjBXfl/+XPKMhBYk0jlMkKa3Ozh/EitV1KeR7Vxa8c1Sd/Lvc4aFeMJGTc3AZsJdBVJrXA3QQX667I1LlG3CtZ/A1AjN64uUatdWXblj5dlIrBkkVLrmyY62TkX8jFUNQU8aRZKtaiVf7d9dpY96oZgrg42E2iStcC9zU5gq5xaGABqpnEyL1682LTaFWPlNuWZHtPz8vyyjASWRNf89DOO9xf5sZ/kXQ+nvuanYE2/pxlvm240NyGIO0weDAcmQZmIzQRKkex4OId+5QDm7vb21pZvf/zjH3f+LstKYAki5df879y1v6ZrfQrk0ufMW9/a6MaNWuTS35r4xL0+vDS5TVIeRxiPzQSSSFpDpnHNOHVT0t1sFaTqtqQ7Yu6kB4C56bKmXVlmAnMUST1vNDPh3jViFQDV0qVSdQ+3jEApBZ/l3+l1mGX7OEXrXBxK/vjC8Gwm1ivSWdB6cVr8+3XYOVmlprtyADA0VVzd5CmffPKJft66shSYg0idgjjJr/21BHNNn1M/GfYxrLJ1LrxyxxjGYTOxPmdnZ/8xTsbGRb8pGAGsnXohfPHFF66M/M6Vq8CUIj3Jf9dxGhS8bbpTbn/Pj+MH+TW/hpu46lKZfiqQS0FbLv+c3HTuj7altq3WCtTPtJ3L1rlwlh9/GJfNxLpcXl7+oZwAIKc70wwSBoCfNcyKSVCHUUXKh0S0Bmht0myONc7qqADOBA4P9JlrmlFzDrRN08yULjBuy08U7Bd5BHMTs5lYD52EZcXk6upqc7KqOZ0+5QDwmCqQ+WQKWwR1GIWOtey46yRvWam9x005yYn7Hum5BHPt0n4+dtZPycu6VD/MHy+PT4zPZmLZ4mS2i3+rle7du3ePCgMAwGMNQd2Li4uLX7uyFzhWpE03ye3vO8Gca8FKQU8Z/NRI55GCDk1Moh5BbZOc1P5davP+/ftN3W5fi1uSgv30d3785IFzeczlxyqmYTOxTJFalx5QYZpOVgDAfi6oi4BOP69cOQx0Eel5w83XnRuxqbth7S1ujroub8+VVimo0Hd1rwNPrZzqkrpvm+aBWrLvWCpej8lQKmAzsRyR8oHQ+Qm4QxcDd9ICANqpQuRmwQzMgImDRNI1ezPD9L6ucU2V8TlQwNA2Nk7m0LpYC22n1ArX1F21z662+esGxs9VwGZiniJpqYFOg6IpKAGgXypTTSWccXVoFOlp1hL3IewcP+W1em6tcCXXnVKL+OfPYex+Ow2N0VwHDeXNjrwlzr3WsfL3KI9pTMNmYl7Ozs5+HyfVXX6COX3enQEAPKYxK9fX12X5+0O4cOU31ikq5L+JY+Kljo+yUq4xT6qEP336dLYtcE7TunEEcN29ePFic3y47ZhabPX70Dft8/ctj21Mw2aifpG+DFoQ9IemkzuhNQ4AxqNKlSpXpjzWjTe1yDBpyoqdn5//jVpYimNjQ2PKljY5mQK5MphTvUQ/1VXZ/Q925UsNlMau4+mmVf7+5fGNadhM1CmSgrjvg+1WqcCOiU0AYHot4+pSi8z3aqVxZT2WK9K1Gzu2tBuv9/f3m+/jJuVILUncaN5PwZMW9C5bcXVDYKo6XxFYvnXHOcZnM1GXSF+HN9uTx9LJzZIDAFAXdSdT1znXk0LldlTU/taV+1iWSBoj9zzte9ExoTFlGgqxlK6VGtKRWt+cOU/kMgUFT2XZkbbhVHW+4obEjTveMT6biWlEUgvcdVChr8L/x/A+5CfPhk5wndS6O0P/cwCom7pMqfJeTtO+vfNOpWjBIul6vrPfVSle2rVbC1e71seEYO4waQ25tP20bWto1cz3aXmsYzo2E+OItFkXLrzVidGFCsRXr17ZkwwAUL+GySE0ccq1u1ZgniI9CuSWGtRopsr8e2piIPc8eKlMaGrdvLy8tP83hfxzlcc8pmMzMaxIz0Kn5QVEd2VUWKpPuju5AADz0rIOl3plaPZDZsWcqUgK5HaCOQVySwzm3GQdalViCEh3TbN/5rQIu/vfKeSfqzz2MR2bieFEenTHLtGdGd3VUuGoE1wXfHVhcCcUAGDeGpY4yDEr5sxEamyVW0owp6EeTYtXC5OzdeeCuXJIjSaWcf87lfyzlsc/pmMzMYxIOwW97s6yLhwArJtu3OlGXlN3q22l+UVU9L5w1xbUIVJjMOf2+9ykBa31vVwgl1oh3f/iMa0p57Zf7cdL/pnLcwDTsZnoTyRNcnIbXuvgT5ZUyAMA+tE2K+Y27/uLiwta7CoTaXHBnFrhtPSGJvNpm7lSj6XJOqjX7KftqvM8P8fTsTKH7Zfv+/I8wHRsJo4Xae9EJwRzAIA2TbNiyjbvyl2DMJ6okP/X2A87gdycKuZNNPGau6EgaYkkulUeR+d0vj21nec23jD//OU5genYTBzmyZMnn8eBrUJ970QnuttFMAcA6EoTImiWO3NNoRvmRLTdy6BnCTdry6ny0+9qNabucrpyIqQ5Lq6ef/7yvMB0bCb2i6Q1456GH1xf8iRNcqK7MqwXBwA4lip/5fVmW+FmVsyRRVJPnIf9MPdgLs2ircAtfSd1pVTr0RyDjtrk4w8TbWv33Nrl36E8LzAdm4lfHNL6Jkx0AgAYilpQFDy4609gVswRlK1zaj2dazCXz1ZZBhw1TZU/Z5r8JD9eRH/P9ZjJv0d5bmA6NhO/BHLl3dAm+aBgAACGpJuGTUsebK9bWqj8xl3fcJpIO5OczTXw0Vi5pjqObhq4/0F36plVLkugQE7jD9Vzy/3PHOTfpzw3MB2buUaRzkKakfLVvkBOJ6UKvLROiDvoAQAYUtusmFs/Bcba9STSV9vtuqHWObdfaqelMtwxkwIO9z84TDleLk0o4547J/l3Ks8PTMdmrkkkFc7v0sHp0PoGAKhZ26yYsq28q2VJQwh08/KJuyaiWaTvw2Z76qavur+6fVEztRjd3t7uHBdLCDJqUq4vJ0uaUCb/XuU5gunYzDWJ9D4/OHMEcgCAudm3UHlGY8NZ126PSM/CzvIEqrS7bV8rBfw6JvLvILTG9cu1fH799df2uXOVf7fyXMF0bOYaxAn3+zgYNYD84cBUc7gmNGFGSgDAErQsefCAde3aRdqZFG0u48tUl8knPcm/w5y+x1yoFS4/11Sn1DZeUuuc5MdQea5gOjZzySJtFv4u76DMeYAqAABt1HKgHie61jVNphIYa1eIdJ5tn9lU0NNkHG2Tniwt0JiSzq98ApTUlXWJ2zg/jsrzBdOxmUsUSV0mHi09oJOOLgcAgLVRgFdW+Lc3O18FXTNXv7ZdpJuw2TbaVnMK5kppGAnBXH/UCpq6NueToCy5Xpm+o5TnC6ZjM+cu0qYVLrSuHbeUGYcAADjGnnXtROPMn7tr7RpEeliioNaePArgXBCn/UrwNoxye+fBnLa5+5+lyL93eb5gOjZzbp4csPg3C38DALCrbV27rZdr646p77ttsdzQum1u202laaIT0UQcCuQI5vrlgucUNK+lbpl/9/KcwXRs5lxEehI6L/6dCjh3gAIAsHYaC6QZHG9ubpq6Y6r3y7m7Ji/N9rs+fP9aevTsm+iEes4w1L2S7U1AVyubWavz8/P/HAcQrXAAAAxMFVUFdu46G3Qtfuau1UsQ6en2e25MvYB4CuI0a2nTTWyCueGoa3LeWrvm7Z1vg/K8wXRsZo0iXeZ9lEusGTdfb9682XT1Yf8BQH26LH0QFODNvvUuKu3fxHfYCeZUcdc2cNtmDHkQVwZzTHQyjrJr65q3d74dyvMH07GZNYlkZ6dMCOTmLwXquvvlHgcATK9jYFfS9fvWXd9rE+m6tlYY1W+aWuSo+4yjbJ3TObDm4Dk/BstzCNOxmbWIpIlOdg4eUQHrDjLMU75v3eNDUuugbgpwYwAAulFl9unTpztldweX7jpfg0hn4W77OTc0C/aUlXbXI0lDSbhODU/jSHV8a8xcGUxP2VJbi3x7lOcSpmMzaxBpJ5hjXNxy5fvZPT4kBXLpvXUHTgW4ex4AoNkBrXfVjb2LpHX3Np9P1wHVN9Qq477nkBSs5dekhO6Uw9K+1vHrtn2OxoSf5dukPJcwHZs5pUhaQ+6HdLAIhdmy5fvaPT4kLf6Zv7/86U9/ss8FAHSnlo6yfM3oOn/t6gFjirRz81hB1d3dnf0+Q9BNxLblB4T6zzDSRDMK5Mqutjl68OzKt015PmE6NnMKkexYOYK55cv3t3t8aC6oo6UOAE6nnjVl+dpA13+1lKkucOHqCX158vPatZrAZSeYG3Ph8LxFqGmMnGi5Jff/OI2GWzRt99QjTL9TB30s31bluYXp2MyxRWocK8eJtHz5nTEFV+45Q9Nxlh97Je7QAcBpVM62LINQeh96mTUzknr+6LUa164ds77hpsB3n4O1c4fRtv3zMXIM8fHy7VWea5iOzRxTJMbKrVzZ1WSKsQuSf4YmCuxovQOA46krpsr91ELV0cFj7/T87f+Vr/Xw3n0HcmkijdSVr3zfkgIIArdhpX2i7V0G83kAh27y7Veec5iOzRxDnFSpy8PDgUGL3Dppn2tGsXQcTBUw5cdiFwR3ANAPBXkvXrzYtOC5FrTMd65OUYr0ffY/D1Rup94Wp/a6SP+fj8Vy79lEdZ7yNXE6XZe77BO2/3HybVied5iOzRzSNpB71OWBYG7ddGFMx4IWGXfPGVp+POb5boxdSReNqbqLAsDSqOWkZdbMl8F2xTw7O/t9PLazBEHfPX/Scjd67X1BXP7e9EDqnwK39DMP4NxNgXyfMYTiePk2Lc8/TMdmDiXSM3eSEcxBhXHep32KAjc/Jt3jOkb3rb2ku8zufwEAx1HZq3qCK3O3Nt0xw005NqrP+kUeyLVRF0qChmFp26Z9oUBuT6vuQ7dW9snp8u1a1vMxHZs5hEiPJj5ZSoGXFyxt30sXA7U+UaB4aVapRBfmMbs05u/tHs/tC+50DGiMyFTjAQFgSVTmHjChyub60XevCbWwufeS8rrfVxCJXfnsoPs01cVwmnwbl3V9TMdm9i3STjC3lJNM36GtYNFjeUCSLga60OSvg581BUljdWXM39M93mTPWksPyuMBAHCYPV0xH/Qx2UV+jdfNufI9dBOSCU2GlybRaZudUvK6JftlOPk2L+v7mI7N7FOknWBuCd0r9wVypRSQ5Hnla+IX5Zg1FeBjHDP5e7rH25Sti10Q4AHAaZpuBOaV+6S8bqdAYV93vRIzIw4njYlTN0q37RP2wXTy/VDW+TEdm3mqSDfh0VTBcw/mVPjvG0PlKCDRhSXPc6+PX+g4yS+yFxcXH+/u7uxz+9Ln/ul6FzlRRYMumgBwvLK3RN4bprwGd5VaetLfqsfk74n+6Aanrvu6Fub7IE0mwz6oQ75vyvo/pmMzTxVJC4Lu7PQ5B3OqnO9rkTt0ymL3PtilKazL7Vbece1T/j7u8VM03UVu4+4wAwCalb0lvvnmm72tPZKXt/qbLnvD0vVd23tfvSmvOzI7aB3y/VPW/zEdm3mKSNf5zpY5F4yayMR1x2jrx72PLjjuvfCYCvx8++tOnXteH/J95B7v06EBni56dM8EgP2ars/ljWWWEZiGWlK71KHm3BCwZPk+KmMATMdmniLSD2lH397e2oNhTspZrVT4K0DN8w5B4XS4ciC07ra6550q30/u8b51uTtZ+od/+Ae6ZQJAi3IcdsL1d3raB23DEVS/ondK3fL9VcYAmI7NPFaknQlQhh7zNIb8+yiYUyqDPEkFkFL5WM69B/Yr+9QPEdTlr6+/jwm4xqDglosdADRzZad7HvqRJphJC3xr3Hu+7RWolb2ddC179+6dfT3UK9+HqvKiDjbzGJG0qOfDTl7KoNW8ZUgFllL+PRMVYCm5xxP3HthPd/V0TOXbUvvDPfdQXReLrU1f3x8AlqYsLxnq0L8UvOXXTzdExdH1fKwlidCvfD+qyos62MxjRHqYCGVJ/Z7z7pVa1FQp/X2MvNUnteq598VjOqa0MHvaln1tvymDuUPGl2pynvyup45H9zwAWLu8nHWP4zjqeaUuk5rUpEvwdnV1tQmm09/Ue+Yv37+qEqMONvMY+Q5eSjAnagXJv5vuRuV/5wHGMdQC6N4XXrk/+th+TeMt5JCAawzl93fPAYC1o5zsR1oXTmO32ybyypcWcEGbJvVawjAcENDVymYeKtLDzJY6kd0BMGdthVhZwT6Ge080y+/2SV93/PLXdI/XouwG7J4DAGs2l/K8Vqk7pVrh0s98mybl9ZcZQ5cvr4OEWxcXYHw281CRXqadu4SZLUtqoSnHbyVq3UkBhu5Qde0/nnPviXblJCkqYE6d/TF/Pfd4LcpuwO45ALBm+8rzV69e2fy10U1BXU/3BW6iLv8pYGO25fVSnTg/LsqYANOwmYeIivQXebS+1CZ1HcCupU7fXXen1J2gfKykVHbZVOXcvR/auf2hfXHKIOv8tdzjtShbhRlYDgC78jLSPa6WJcmfJ0vpZZRa2PLf0/dNQZz7/jk9rvpN+lm+B9Yrr/crFsD0bOYhIj20zmmgrNvxS6JAohw3pwO7nKK3vMulwE2tl3nekiaPmYprqXPP6yJ/Hfd4TfJgNt1UcM8DgDXaV56X147c3MrT/PPmLW76LvuCNocADvsU5893Lj7AuGxmV9qJ2Q7dzMLndvzSlC0kkgrNVBDm47xUsJYLaRLM9UfHXb5t3XO66OM1xqJjJ79DdkogCwBLs688VxmaP2cf9xpTy5fcOSZwkzSZibpSEsihq7JxI36/dnECxmMzu4i0E8wpQHE7fanKiTkk79LQhmCuf/n2dY930fQausAde7F09Frqopu/xzHK2TndcwBgjbqUjW0TnnVVvmYKssr8vum61DbeTfLrln5PwVoexJWvC3SVN24onjs7O/vCxQsYh83cJ9KjRcTXGKBoUHW+HfZRKwrjnYaRb+dj7zCWr9FnELfPsUFe/hrucQBYGwVVrmxUOauuYvsm9Mj/t096bbcYd/7e+fg293zl6e/0v6UyWDv2eohlS3UcdzyK+x8nb9zY9hpi1suJ2Mx9Ii1yEfFjdL3Dp8U13717Z18Dpzu1+2FZAaiNClt3Yc6fUz4GAGukoMaVjXme7At2VLfpoxVvKPT2mRcND8kDcykDKhdgNQVd+juv++T5Zd6Q9L3KYUXhhYsfMByb2SbSTlfLtRcm+v6aOj7fJrnaFqZeqlO7H5YVgFJf+1GvcWwFwQWq+ePlYwCwNuWY6j/+8Y+b7mAK3sqKp8rUri1Y+Wt2oZaLlPKxbqLf9b4p5f+Xt7C556c86hZ10T4u8xSIpd/VKuyCrynpGNLPdHzln718bhv9/7/9279tbjDk+RcXF7/WIYtx2MwmkXa6WupgyA8AYEr5sekeb5P/bzLW3c+uQZ4u8uX/5o+XjwHAmrhK876bdYcEdeoO+eLFi81N3H3j1w7hkgKEPKWg0H2uQ3T9rm3K18hbkFJeGcSWf0t6rl4vfyzlz0H+2cvvJ65lrQ/la6oXmOoI+RJaedCv41x1Gt38zpcXO6SOk79fk9/85jcPv29nf7+Kw/dRPIH+2cwmkehqiWqlY1Pc423y/03mcHznn9c9DgBrkY/n2XrZtVXEvV4X7rX6ckgg4AImKYMlaXrd9J3K/znkNYaUb/c2aol1+YfQd06/l10em7Z1V2Ursl4rvV/5d1OelH8nY64HrXpS/l3k008/3QnsAuPqRmAzm2Q7h2AO1cmPT/d4m/x/j32NsekCM6fPCwBDKcvDcKN6SwR034YPxWOWqzQfy70+hpFv99RK2xRwNY1HyyejSXlNr3EKNYbkn3cJXA+jX/3qV2XeZRlToF8204m0093S7VRgSscen7oA5P8rrntjDZouRnR/BrA2TeVhUH9FW5fJRToLP2z/Z4des+9Zqd37NEnfqbwWNV2b0v+VjyuvHG9X/p2k1yj/55DXGFL++cam/ZG3okmt9YRamDWbCeoGZDOdSA/dLXUiu50HTCkdn+Ieb6K7cun/NGDePacG6qbhxm3Q/RnAmqhibYK4h/IwfObqMW0i3eavk6hS6j5Dn9z7Sh/rla6B23biul4qPw/OknK5B5kiaF2aYtLA1+7cQz9sZinSV9kO4QBHlfJj1D3eJB8030ff+6G4wf1ccACsRYexS6/CmavHHCJ7vc37DR1YqQzvOvux+388tsSujXNUttKV5xr6YzNLkR5a58TtNGBqhx6jbbNu1aYcH9LXOA8AmIuGGSvvw1NXdzlWpMvtaz9wn2coXQI8Xbu6LJIOTC0/luO4/Ud3zuF0NjMXaWfsHH2GUZtjAjP9T9l9scauxBojkncJrfVzAsBQGrpY9tIa1yTSy+377NDnGKsrpHv/Ju7/gRropkO6GbM9jwc7b9fMZuYiMXYOVXN3bd3zcmXloKaui/vGh9DFEsAaqLtWQ0vVK1df6VukxklTEve5h+Q+Qxv3GsDYXr16lR+XL935htPYzCTSTuscFUnUKD9GpUsrsmYvO+T5Q+q6pg3BHIA1UAtYS5k4aMtcG71vaA3wEve9huQ+Q5O+Z+8EuijG0725uLj4tTvPcBybmUSidQ5VK5cccM+pQVur2z76P8bMAVgDs55c8iZU11Ur+3yNVIZPNWOl+zwyxuydQCk/BiOg088rd17hcDYzyTc8LQOoUU1LDnRtaeuipi6gADCkpvXktt3pNZbt2tVRahGpU8ud++5jKmccLLn/AfqkHlHm2Lt15xUOYzOTfIO7HQNMLR8/d+ySA30GYqdgwiEAa6OWq6b1NY9ZT64W5fdp47bLUBoq1K3c6wDHUo+j8pwvzx8czmYm+cZ2OwWYWh/H6FjBHK1uANDcIpeZbJxc3/Q9Qqdxd9oeY3TNdO99KPe6QFcaLnN1dZUfU5fu/EF3NjPJNrTdIcDU+jhG8wlS+kBLGwA8pi5/6ibvWuQUzIR/cXWRpSu3RWmsQK+J+0yHcq8LFLPYfufOD3RjM5NsI9sdAUxpLhOiAMCaqTt8S2ucLKZF7lj6/qH6cXiJ+2yHcq+LdVGvpevr6/y4oKXuSDYzyTaw3RHAlGqaEAUAsKutRS7ch6eu7oGfZdvqgQJjbVPd0HTbfGruMx/KvS6Wq5is57U7F7CfzUyyDcy06ahOflfn2AlRAACnO2BplupnraxJpL0td9rubp/UxH3uQ7nXxTIU+5qul0ewmUmk/5c28Keffmp3AjCVtF7Rzc2NfRwAMLyWteNKL11dA90V2/PBlGPsjuW+xzHca2NeirF0QlB3IJuZRPq/aeN+8skndicAAIB10WRSHVrk3gda5HoU6Sa8DeW23gTWbl/Njftuh3Kvi3ppLJ2WKin2I0HdAWxmEuk227B2JwAAgHV49+5dOd34g7mvHTdXkdQt89H+ELcPl8Z97z6498KwTGD34uLi4tfuuMcum5mL9CFtWA1cdDsAAAAs0/39/WaMnLpFnZ2dpYpWafUzVU4p0t5xdlpS58cff7T7eGncNuhL0zqK7nPgcArqNJQmbdcI6PTzyh33+IXNzEVSIb3ZqIxVAgBg+fYt/q3ALnzr6g2YRqRZLX0whbQNdFznk/3l26dP+XvjMNo/xfa8dcc9fmYzc5Eus41pNzoAAJi/PUsNJHfhwtUZUJdsn+3ljoc1c9uoL+798Jgph1inroHNLOUb021wAAAwH3k3yg6Tm2joxZugcfV0fZqhSLo5/yJo/b9y/z7QsVDzOnc1SNspb+FL+adKN1TyczJ/j7XRcViM2WWdugY2sxTpYRydZrZyGx0AANTpwAAuYfHvFcn2+yM6Zr7++uvN8giaGMcdY+jObeO+uPebu2JZA2a/NGxmKZLu6mw2pPrNu40NAADGt2+824FYamDFIjUui5BzxyFOd35+/mjyGrf9D5W/xxyZ2S8J6go2sxRpZ0pct7EBAEC/XBesntCNEp1EKo+dRu4YxjDc9j+Ue91aEdS1s5lOJLpdAgBwop5b1LoigMPRImkM3vPwOvwUyuPrER3fa1oqoRZuXxzKvW4NFNQVn5WgbstmOpHodgkAwJFSILdnBsljMd4No8mOu07c+YDxuH1yKPe6Uyha6YSgLthMJxLdLgEAOIAmIjmxJY4xbZiN7THbiTtfMC63Xw7lXndIpuulrD6os5lN8o3nNjIAAPiZWuPy62aBFjWsRnbcH0w3RDSO1J1jGI/bN4dq6m7u3m8fxtTtsplNIjGODgCAjCoWGiek66Kmdt/TIkcgB4TsnOiEtfHq5PZVX9z75VT2Xl9fPzw/yt5/dMfaGtjMJpEextFtN9xmTRK3kQEAWBJ3d1ljyvProqO7yOEzd10FsKs8f/Zx5yqm5/ZVH8r3UaCfxiWrbA6/dsfV0tnMJpHi2vX44qUNWK6YDwDAnGnJgNevX2+CuJubm1MmM/lv7poKYL9IndbGy7nzGdPTvnExQ7n/9ilfQ7/nj8XP1fWCsJltIqD7Nm20kjYiXTEBAHNwf3+/qQg8ffo0VQI2jgncrq6uNlO0q9fK3d3dx7/8y7+0zyvQ/RLoKDtvjubKAdTL7cOknHG/ePyDO4aWzGZ2EUmzXv6w3XA7dFcz38gAAIylKVDrQ3lnuIlubrr/b0BgB/QoO7c6cecw5keT5xT7djUTpdjMQ0TSIqX5xtvQRY/xdQCAvh04CcnRLi8vN10t1eVSXS8PvVmpz6mg0r12g/uzs7Nv3LUWwOmK862VO6dRNzPzZex2fywsjc08RqTLfAMmutAqYmZ2IgDAIY6dhORYf/3Xfz3ajcimFrzt96O1DhhAJNVVn4fX4aewc/514c5n1MMEdatopbOZx4qkxU/zjfgILXcAAFFQM0TrmoIiXdD1+hrP5t5b/vCHPzz63y7dKfvUENitbvwHMKXi/GtFQ0X91hjU2cxTRWocX5fTSTH2xRMAMK13795tJhFx14WuPv3004ef3377rX2fLsqASsHgFNel8nOU11UA48rPxy7ceY3prC2os5l9irR3ulnudgDAsmi8mcr1Hlrg7IQhkT5sH98EdacEYbUEdcVnYCwdUKH8PC1Rn62LgrpiHy02qLOZQ4nUqeUux8kBAPOh4KhrEKfAKXzrrhf7RNqZkEuv5T5PVy6oG3t4gN4zf//4yVg6YCbSuZtTueLOdYxnLROl2MwxRLKzY3ahygLj8ACgHkd0o7wLF+760FWknevIqZWnMqgTXW/Gaq0z789YOmBGIj3qlcZSXtNbQ/dLmzm2SHu7ZXZBax4ADEMXxAOXCngfNFHWtSv3+xLpRdi8Zx+tai6oG7O1rnz/8vsCqF+kxpnfaZCYhgnqbt2+myubWZNIJwd7OoF0kXQ7GADwWL4498XFhS1bHQU/4ahulMeIFG+3u5TBqeW9Lvxu/bixWuvy9yy/L4B5iNQ487s77zE8le3Z9WJRPSBsZs0iHTwOL6HZGwAeO6L1rcnJ3SiPoQAy/xy6YLvveaim1rqhe4EUAeqi7iIDa5KdxztUxtKjbBra7tm+0KRbz9y+mxubOVeROs2o+ezZs03lxe1oAFgaLdD96tWrTatTGawVwcM+Cth01/lZuHLl8FQixVf55btoQXK3LQ7lWuv0PkP2+igqHIyjAxYmzvH/kZ3jD1x5gP6ZHhizL2dt5pJEsv2YS2N1pQGAMahHgoKOE9Z707IAb4ImHqkqeGsS6WE8nfRZrhdB1iDvkSiILN6H2S6BBYnU2gChcoUWvGEV3S9l1hOl2MylidTYj7mkk4gBqwDm6O7ubtMD4fz83JZve1Tb+tZVpLNyempdsPsKuF6/fv3x8vJy5/WTvq8dRUWDVjpggSK1BnYqB1z5gH6UN+rK/TMnNnPJIqnFTndx1W92Z0c6BHgAanbAAt7vgsq+r1zZuBQR0H0W33FnnHWfQZ3rgulof5zynmb8HmPpgIUrzvkNWuqGo/J8KcsZ2My1iXT0mng5gj8AfdMF58gJS9Rl8nVQi9uXruxbskiPyvVTg6ySmzSldMp1obh7TCsdsBKRbMudyhMCvH7pGnt9ff2wjeP3QZfaGYrNXKtIR8+gWdJJp8qXLuRacNcdRADgaBITTepxyHIBW2nttxtXxq1NpEdBnVrr+r7x1qXV7phgUq+bv0b5/QAsWyQFdjvlgNAVs1/q6ZK27Ta4O3f7o2Y2Ez+L1FuAl+MOC4AmCjaePHliy44GoyzgPVeRbA+MU1rO9mlruTs0sMv/t/xuANYlEi13Ayq3a1BPl1l0d7eZOFykXoM/nZyqFLgDDsAyqVXOlQdh9hOWTC1Sp671fQZ6+1ruugR3+fPL7wRgnSLZGdxpuTtN08RX5favkc3E6SLpZHseNIblp7BzcHTFYujAMuTntQI3VebzvJIeD//iyhccJ9LRN95OCfS6jLUTF+Dlj5ffB8B6RbIT/NEYcDoT2FU/WYrNxLAitU5Tu48u+jStA3U6YNbJRpp1S7M1uvIDp4vU63jproFe18CuSfk9AEAi3eQBiG4aujII3amHRTED5suzs7Mv3Pavgc3EtCJ1WgzdUeVC61BpVjx3gAI4zf39/aYVRV3pTgnaWrwKZ65swLC03UPv46b7Un5eAEgioPtNlBNvynJD3LUM+ymou7m5ediO6tIaP6scU2czMb1InRdD7xtBIdYozSw5UJC2Q+8R6E45E5GqCPTKzwUApUiNZZUCEnp4Hc6NrSu3+9RsJuoW6aQum3OgCi+FDtqMGYAd4vz83N4QefPmTdtn1TiIp+58R70ijRrole8PAF2UZUmSX6PQznTBrGpcnc3EfEVSd007UBbtVNlm7cDx9THmbEy6w6lCXeOh7u7u7HdyDvx+On+fuXMcyxKpa1D40v0/AOwTqXG5A3pkdVdzUGczsW6RCAp7pkJzyBZHtf5oMcxDFy4emoKeuQRqos861DY8ckKMWax/AwCoX6S9Pbx0HXTXMPys1qDOZgJTi7T4bqV9SHfXfvvb327+rmUNGrVwXl1dPfq8fRsyABtLh0DvPvbrN+48AQDgWMW15gFDXtopqCu22eRBnc0E1ijSw9qBn332WX6iYkBNY876Uo5d0+99LRw9BF0otjNpPdj+TRdMAEBvIu3tkVX7NXMqRSudXLttPBabCaxdpPfpJO2jFcjNkLQGCkTUAuW2yVgUMLrPVvM6PS2tdtUvbgoAmLdIe3tIEej93aYV88mTJ/l2uXfbcww2E1i7SB+yE3SjhsJLn6H8XH/1V3/1KK8G6nJZw+QyZWtXrvYLUkNgR1AHABhcpL2TNrlr15rohn+xTb6/uLj4tdueQ7KZwNpFus1Ozh1TtjipX7v7TIkClLH6vs+lK2MKitSt0wxmfvjstY7Fa/jMTJYCABhNcQ1qpWuqu54tVVk3i4BOP6/cdhyKzQTws0iPAju1+ExV+Vfl/unTpzufx9FnHDqwy4O5nPJrHlDdtg1rDexMUPfBHa8AAAwt0t6WuzUuh2Ba60a7+WozAeyKFDHSL1339HsNrVH7Ajx9zqFaFFvGeT2iQKm21rumbVfLvi3p8+bHYGAxcgDApLJr0l7u2rY0xZg6GWWYhM0E8FhUpr8tTtLqJtZomnxl6M+5L7BMapyIpCkwrbG1znS5paUOAFCdSCevZ+yug3NgetXEJvHbqS82E4AX6VEXzBqDFBfYjfU5983oWWNrnbjArrbWuobAmfF0AIDqFdeug6n+4K6NNTJB3aAtdTYTQLNIZ+Wdlxpbc9wdoimCT/c5pvos+zQETNXt36KljlY6AMBsZdezvVR30LXaXRtro895fX2df/5L9/37YDMBtIsA5bMySFFrjjuhp1RTUDeHQClpaq1zz52Ctmf+2crjEwCAucuvczkti3R/f2+vj7V5+/Zt/tlfu+/ZB5sJYD8FdXFy7szyVGurUxnUTRVIuc+iQKnGoM4FodputXTB1HbLPhvdLgEAixbpu3Td0+QjGuLhro+1KeoSL8O5+36nsJkAuoukgb8PJ+tQs0qeoimQmiI4cYFSrUGdmIlIqmhZpNslAGBtsuveDnedrIXqPeYz37vvdyybCaC7SDtj6mrqmpdzgZRMFYCW3RqnCjD3adpuUweh5QWiPC4BAFiiSOfhx3T9a6MbsLWsidcwaVwvPWxsJoDDbLtfPpygtbY2iQuk3PPG4Maq1dhtVWpsWcw/S3lMAgCwFvn1cB93PR2T6hOqP2Sf6T7+/sZ9r65sJoDDRfqQTs6pK/r7lIXJlGPDXFA3VathF10D4vfv39v8PuWfozweAQBYu/w62Ub1IHedHYqrS8TPp+47dGEzARwu0s4adU0V/Vq4sWFTtY4pwCy7rc6plVOfVReDPE/evHmzmbK47+/i3q88HgEAWLtIl6HTIueqF41xMzYxn+Ho8fA2E8BxIu0Edap01xqYuC6EU37ustWwlqDOBU99atvWCgg7vvcrdzwCAIBdxfWzla7B7vrcl/IGcflZu7KZAI4XaWfWS5kiQOqqbB2b8nN37c7YJ61lo++o4LZj8FSbV+HMHYsAAKCbSG+319W9XH3iGLpxm79u+Zm6spkAjhfpLOysT5fUGti1tdbJmJ+7DOrcc451QIvXMR4FVpF2Wmx7RiAHAMBAdI0Ntj7XxNU9Sj/99NPDEJfz8/Od/y8/Q1c2E8DpIh1cmVewMfXU/WVAlYw5JjDveukeb5IKyQGCtkGCp0hdj5GX7v8BAMCwiuvxUVz9xNRVjr7W20wA/Yl0VGA3dUteGdhpHRf3vFMMGIAdQrOTvgnaT1duHwIAACSRyrrEqU4aC28zAfQv0smB3ZizL/Vl4mCtCS1eAACgV0Vdo00+6+bJvYBsJoDx6WQOrWPv3GNd6TXU6uaCrmNU0rrmqJA8ei0XAACAPrn6Sf77qWwmgOlEsi15+biyU7x9+7a2wIwADAAA4Eg2E8D0Ih3cRbNCBGsAAAADspkA6hEpD+yOGvsV6TJ7jT4RsAEAAEzIZgJYnkgvt0GYQ2AGAAAwQzYTAAAAAFA/mwkAAAAAqJ/NBAAAAADUz2YCAAAAAOpnMwEAAAAA9bOZAAAAAIDaffyL/w94yTYqzdeosQAAAABJRU5ErkJggg==";
const chara1 = new Image();
chara1.src =
  "data:image/png;base64,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hWoB3bX/vs2fouchIiLmMCxExH76RtyYTPW5FVN/fi780Mvcwy6TY7Q5X3C5Gq/dd66JmeHzEBERTzUsRMR+ugacPRyPqT63YurPz0WaICUnyTHanC+IiIiIpxoWImI/k0b7aAzZs9SGqfY7N0MOu0zed3O+ICIiIp5qWIiI/TR2iVHGzPo4ZM9SG6rPlnNnqH1J3nd3ziAiIiKeYliIiP007nzDfazgauiEHseY8rNzM8S+aGH55H035wsiIiLiqYaFiNhP48zcW4dKi3+Pgf/MsfGfPce16Dx+X3Lw6dOnvSGx2/fdnTOIiIiIpxgWIuJpGm+rxvvNzY0VDU/1eXJsfMAyxZDPnPh9ycGLFy9277eVjIeIiIiYzbAQEU/TuHQN+FF66fznjc1S1qIT1b4oEDuV169f7x0XU9H93rmCiIiIeIphISKervGuasiP0UtXfZacAv/5cx92mYNgqOW9FR+cJ4iIiIinGBYi4ukae7106vFRI38o/GdNwZKGXXZFAayymvrvwHt5eSm/t6cenCeIiIiIpxgWImIejb0EKVINfw3Fy43/jClY0rBLz7FgraUMtURERMRBDAsRMY+Gsl7uhl56cy8A7t97KkrYhq48Pj5ugrbnz5/nCNwiGWqJiIiIgxkWImJejRvzw7aBv1HDEnMOwfTvPRUlbEMT9/f3QwVtUplNNdZ077tHREREHNKwEBGHUQ3+dK7Zy5cvswR2/n2novr8qbbh8+fPX/7yl78MEbQRrCEiImKRhoWIOJwWeP2PJFjYqCDkhx9+2Myv+/jxoz21GznT7ffF708bBgzAuviTeW/emle2WQffGSIiImKphoWIOKzGwRDMJhXw5OrJGxK/zYUEa3WyuDciIiIuwrAQEcfR6BTYnaICq5yJWAoO2B7N57aJ4TFHREREXJJhISKOr6F1616ayor52fRBSjY/fPhgH/eNAgIzAjBERETEnoaFiFiWxmg9eZklWENEREQc0LAQEZelod4/H2jlkoANERERcULDQkRcnsbrbRAWSWCGiIiIOEPDQkRERERERCzfsBARERERERHLNyxERERERETE8g0LERERERERsXzDQkRERERERCzfsBARERERERFL98vP/j9Ti9z9RoDMGAAAAABJRU5ErkJggg==";
const chara2 = new Image();
chara2.src =
  "data:image/png;base64,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";
const kusaIm = new Image();
kusaIm.src =
  "data:image/png;base64,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";
const esaIm1 = new Image();
esaIm1.src =
  "data:image/png;base64,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";
const esaIm2 = new Image();
esaIm2.src =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALYAAAC2CAYAAAB08HcEAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAp+SURBVHhe7d0/UBNNGAbw9atM44QudKFwxErptDJWYhcqsNNK6KQSK6ACKrEKVgkVWEFHrNBKrYIVWplOOuxil++eZTcuRwIXcv929/nN3ORyQgTmyea93b29G92AIHLMf+qRyCkMNjmJwSYneRvsZrMpHj9+LBqNhjpCLvH25HF8fFycnJyImzdvik6no46SK7wN9o0bN9SeEOwYcg9rbHKSt8FGCaIdHR2pPXKFt8GuVqtqT4jV1VW1R67wtsZGKz01NaWeCXF6eiqKxaJ6RrbztsW+f/++ePDggXomxNevX9UeucDrk0cz2Kyz3eJ1sO/du6f2hPj27ZvaIxd4HWyUI9qnT584CukQ76etFgoF8ffvX7nPUUh3eN1iw6tXr9Se6AWc7Od9sNfW1tSen/b398XExIScYjBow7/bVqbxCpqAWY78+vVLlMtlue86TAJDaKN8UtlWpnnfYoPZ7YeTSNf8+fNHrKysXGiZMcMxavn1/PlztWcHBjvw6NEjtSfE58+f1Z590Be/uLh4IcBjY2Ny2kC73VZfedHe3p6c5Thoq9Vq6istEfzQ3js8PEQ5JregDFFH7dBqtbrBCbD8ufXvMOw2PT2tXs0drLED+DhGq2ZDnY1WF+USPlnweFkrbMLvs7y8bF1JcW0y3tStVCq9Fqxer6uj6QneTPL/DYJ37da3VCp15+fn5SeQ7xhsJWjNegFBuJLW6XS6Ozs7IwUZG8PcH0sRBR/ruLgX8LGNciRuP378kBcRf/z4UT5eB7rdgk8XecKLR7NHh/5hsJW462y8DqbCYvv+/bt8vKoe1oENTuYY2BEx2Aa02LofG91bwUe83I/CPKlDiNE6X2VyclKG+MmTJ/KRYoRg05m3b9/2atdqtaqODnZ6eipr86g1crFY7M7NzcmTxN+/f6tXoSSwxTaglb17967cRy2Ly8XMi341jORtbm6Kd+/eyf1BUE5gaizmfYev2KFkMdghGLXTtfDh4aGse7XLAs2TupxBsOkfdL/hz4INI3qgSw6UEvrf9IYyJIt+b7ocgx2yt7fXC+3t27cZaEuxFAlBiYFuv0HQBejV0LSlOLvPgNp6Y2NDzogLQ6CDFlr2bzPU+ccWO4D+5/fv34vd3V115J9bt27Jk0WG2S7eBhsjgwgyWujLBlNKpZJspft1+1F+eVWKoNTAtXsvXryQV4/gMRxqdNOh5ECgAZdP4bpAsgxabJdFHR1EN9+XL1/Ud52f7VepVNRRsoWzwb6s71lvmPKJr+k3vI1j5tdivjTZw8lgr62t9Q10UCfLy6Dw72brPAi+Vn8vvofs4VSwj4+Pu0GNfC7M2K47mILv0a+B1yV7OBNszMxDi2wGenJycqTRQZQz5mviOdnB+mAjbJhiagYa29LSkrz8alTmJ0CU8oXyweruPkzox10JzO44TN4PAiiXLouj79lckZVraNvDmmBjDgcGVND3rBeEefjw4bnLrTA62Gq1Yp0yeufOHbUnxM+fP9Ue5Z5quXMJi8GgN6LfCaG5oQ4epZa+zMHBQe//QS8J2SFXwa7VapEvs9IbThDRG5IUsz8b/d5kh1zMFUGZgRLjqqHrrC5+NVdjzcGfiyLIPNg4AXz27Nm5WlnDyZ8ZZEwdzYI5jZXBtgSCnQbUqlHKDMzZiKObLk5mXzbqfsq/xIIdNch6S/IEcFRYMkH/nFGWZaDsJVaKYFoopnxGgdoZ6zPjMY/Cd/ENTih701opnxLrxw4vT6BhdSW8l8zt+Pg4t6EGDNKYJ6ucn51/iQUbF7xCOMjWrYyvzM7Oqj0h7w6wtbWlnlEe8ZrHiPAJFL5ny6gLV1JyvLo0bBTFYvHCBb16AUvKHwZ7CCijdIkFNt+IyXUM9pDMtfzYYucXgz0kzBzU02ExWor7J1L+MNhDQqjNBeHRQ7K+vq6eUV6wV+Qa0DMyMzPTu48Mwm7T7Zh9wBb7GhBkjJTqkgRBZ0mSLwz2NfUrSXBlD8uSfGApMoJwSaLh8jTzWklKH1vsEeiSJDxwg9abssUWOybhGYD8s2aLwY4Rr7TJD5Yi5CQGO0a6+w/Y/ZctBjtG4e4/rhyVHdbYMUL339OnT3uTo6rVquw1ofQx2DFj70g+MNgJYO9I9lhjJ8A8iWSdnQ0GOwGorTWOQmaDpUgCuA5J9thiJ4DrkGSPwU6IuQ7Jhw8f1B6lhaVIQrAOydjYmHrG3pG0MdgJYrdfdliKkJMY7ASxPzs7DHaC2J+dHdbYCeK8keww2AnjCWQ2WIqQkxhschKDTU5isBPGLr9sMNgJY5dfNtgrkjBOYc0GW+yEYQqrWY5w4cp0MNgpMJdlwJXsLEmSx1IkJbjYACuzavyzJ4vBThFHIdPDUoScxGCTkxjsFJm9I+wZSRaDnaLwopWUHJ48pghdfYVCQT0Tol6vX7jNB8WDwU4Zgo2AA0oT3h8yGSxFUra8vKz2zlpwSgZb7AywPzt5bLFTxlt4pIPBThFCbfaGzM3NqT2KG0uRFGC5MwR6c3NTHRFy0UrzfuwULwY7QZiLvb29LRqNhgy3xlCnAMH2Qb1e75bLZbyJM92CUHc7nY76qSgpzgY7L0HWG34W/EyUDudKEXzso55tt9vqSHZwCRiuecRa2ZVKRR2lNDgR7GazKRYWFq4MM3ohMIzN2tZ9TgR7fHxcnJycqGf/MMj+sr4fG4EOhxqBxhyMnZ0dhtpTVgcbXWiLi4vq2dkV4fgAYqDJ2mCjrsZSBru7u+rI+QlG5Dcra2yUHgi1OTsOgx4HBwfqGfnOyhZ7Y2OjF2p0qeEEkaEmk3Utdri1xtC0uT4eEVjXYputNU4WGWrqx7oW2+yzZmtNg1gVbAQawdYse09SiqwqRVCGaChDiAaxqsVmGUJRWRVsXgRLUVlTiuiWmigKa4LN+pqGYU0pwvqahmFNsFlf0zCsKEVYX9OwrAg262salhWlCOtrGpYVwWZ9TcOyakidKCoGm5zEYJOTGGxyEoNNTmKwyUkMNjmJwSYnMdjkJAabnMRgk5MYbHISg01OYrDJSQw2OYnBJicx2OQkBpucxGCTkxhschKDTU5isMlJDDY5icEmJzHY5CTrgt1oNNQe0WBWLHFWKBR693bEzf87nY7cJxrEihbbvPm/ef90okG48Ds5iSeP5CRrgo3aWltZWVF7RP1ZE+z5+Xm1J8Tq6qpYWFjgLTxoIGtqbJw0zszMiGazqY6cteI4sVxaWlJHiM5YVYqEb9OBsL9580aeWGKbmJhgPzdJVp086nBj63eTpXa7LUuUra0tdYR8ZU0pEobWGiEe1EKXy2XZur9+/VqUSiV1lHxhbbDD1tfXZVnSD0L+8uVL1uIecSbYcFUr3mq1eJ9ITzg1QIMavF6vy5HJfnU4elVYf/vBqRa7n6OjIzE1NaWenWH97T7ngw1X9ZQw6O7xIthwVf19HXhDTE9Pi9nZWVGpVNRRygNvgm3a39+Xw/IoU/KEb5QYIdi+C040u8GJJt7gVm/BG6MbnDyr38pvXrbYcUGLv729LT8BMOqZB+gZ4hVGnpYieRXHGwWzIGu1mnrmLwabnOTUAA2RxmCTg4T4H+5TcOQgP8QVAAAAAElFTkSuQmCC";
const pos = new PosList();
const WALLS1 = new VirtualSprite(
  -10,
  -10,
  10000,
  10,
  0.1,
  "WALL",
  "",
  new ActionPlan(() => {
    return [0, 0];
  }, null),
  null,
  true,
  false,
  1
);
pos.addList(WALLS1);
const WALLS2 = new VirtualSprite(
  canvasX,
  -10,
  10,
  10000,
  0.1,
  "WALL",
  "",
  new ActionPlan(() => {
    return [0, 0];
  }, null),
  null,
  true,
  false,
  1
);
pos.addList(WALLS2);
const WALLS3 = new VirtualSprite(
  -10,
  canvasY,
  10000,
  10,
  0.1,
  "BOTTOM",
  "",
  new ActionPlan(() => {
    return [0, 0];
  }, null),
  null,
  true,
  false,
  1
);
pos.addList(WALLS3);
const WALLS4 = new VirtualSprite(
  -10,
  -10,
  10,
  10000,
  0.1,
  "WALL",
  "",
  new ActionPlan(() => {
    return [0, 0];
  }, null),
  null,
  true,
  false,
  1
);
const subWindow = new Window(0, 0, 200, 100);
pos.addList(WALLS4);
makeManyFish(100, 100, CONSTSN, 1, 1, 0.5, 0, 0);

makeFish(100, 100, 1.9, 1.2, 0.7, 0.5, 0.5, true);
//makeManyFish(100,100,10,1.34,0.98,0.48,0.12,1);
//makeManyFish(100,100,1,5,50,25,1,1);
//ctx.drawImage(chara, 10,10,100,30);
makeGrass(10, canvasY - 100);
makeGrass((canvasX - 30) / 6, canvasY - 100);
makeGrass((canvasX - 30) / 3, canvasY - 100);
makeGrass((canvasX - 30) / 2, canvasY - 100);
makeGrass(((canvasX - 30) * 2) / 3, canvasY - 100);
makeGrass(((canvasX - 30) * 5) / 6, canvasY - 100);
makeGrass(canvasX - 40, canvasY - 100);
var timer = setInterval(function () {
  ctx.fillStyle = "rgb(120, 120, 255)"; //"#55f";
  ctx.clearRect(0, 0, canvasX, canvasY);
  ctx.fillRect(0, 0, canvasX, canvasY);
  let noOfFish = 0;
  for (let x of pos.spriteList) {
    if (x.attribute == "Fish") {
      continue;
    }
    if (noOfFish > CONSTDRAWLIMIT) {
      break;
    }
    noOfFish++;
    drawImage(x);
  }
  let speedSum = 0;
  let vfSum = 0;
  let vbSum = 0;
  let acSum = 0;
  let vfMax = 0;
  let vbMax = 0;
  let acMax = 0;
  let speedMax = 0;
  let fishNum = 0;
  let fNum = 0;
  let mNum = 0;
  let markSum = 0;
  let hpSum = 0;
  noOfFish = 0;
  for (let x of pos.spriteList) {
    if (x.attribute != "Fish") {
      continue;
    }
    noOfFish++;
    speedSum += x.contents.speed;
    vfSum += x.contents.vf;
    vbSum += x.contents.vb;
    acSum += x.contents.acceleration;
    markSum += x.contents.genA.mark;
    markSum += x.contents.genB.mark;
    hpSum += x.contents.hp;
    vfMax = vfMax < x.contents.vf ? x.contents.vf : vfMax;
    vbMax = vbMax < x.contents.vb ? x.contents.vb : vbMax;
    speedMax = speedMax < x.contents.speed ? x.contents.speed : speedMax;
    acMax = acMax < x.contents.acceleration ? x.contents.acceleration : acMax;
    if (x.contents.sex == 0) {
      fNum++;
    } else {
      mNum++;
    }
    fishNum++;
    let t = false;
    if (CONSTLIM != 0 && noOfFish > CONSTLIM) {
      t = true;
    }
    drawImage(x, t);
  }
  subWindow.draw(ctx);

  ctx.fillStyle = "#000";
  if (addMode == 0) {
    ctx.fillText("sakana", 10, 10);
  } else if (addMode == 1) {
    ctx.fillText("esa", 10, 10);
  } else if (addMode == 2) {
    ctx.fillText("kusa", 10, 10);
  } else if (addMode == 3) {
    ctx.fillText("sakana kesu", 10, 10);
  } else if (addMode == 4) {
    ctx.fillText("esa kesu", 10, 10);
  } else if (addMode == 5) {
    ctx.fillText("kuas kesu", 10, 10);
  } else if (addMode == 6) {
    ctx.fillText("click", 10, 10);
  } else if (addMode == 7) {
    ctx.fillText("show", 10, 10);
  }
  pos.check();
  //ctx.drawImage(chara, 10,10,100,30);
  count++;

  const speedShowArea = document.getElementById("speedShowArea");
  const logA1 =
    "年:" +
    year +
    ",季節:" +
    count +
    ",平均速度" +
    speedSum / fishNum +
    ",平均前方視野" +
    vfSum / fishNum +
    ",平均後方視野" +
    vbSum / fishNum +
    ",平均加速度" +
    acSum / fishNum +
    ",初期からの色違い遺伝子" +
    markSum / fishNum / 2 +
    ",";
  const logA2 =
    "水槽外の個体数" +
    pos.poolList.length +
    ",水槽内の個体数" +
    fishNum +
    ",メス" +
    fNum +
    ",オス" +
    mNum +
    "\r\n" +
    "最高速度" +
    speedMax +
    ",最高前方視野" +
    vfMax +
    ",最高後方視野" +
    vbMax +
    ",最高加速度" +
    acMax +
    ",平均HP" +
    hpSum / fishNum;
  speedShowArea.textContent = logA1 + "\r\n" + logA2;

  const addFC = Math.floor(100 / fishNum);
  if (
    count % (addFC < CONSTESA ? CONSTESA : addFC < 3000 ? addFC : 3000) ==
    0
  ) {
    for (
      let countX = 1000;
      countX < fishNum || countX < 3000;
      countX += countX
    ) {
      makeFeed(Math.random() * (canvasX - 10), Math.random() * (canvasY - 10));
    }
    makeFeed(Math.random() * (canvasX - 10), Math.random() * (canvasY - 10));
    makeFeed(Math.random() * (canvasX - 10), Math.random() * (canvasY - 10));
  }
  if (count % SEASON == 702) {
    outputlogs += logA1 + logA2 + "\r\n";
    seF = 0;
    seM = 0;
    if (year % 10 == 9) {
      dispText(outputlogs);
    }
  }
  if (count > SEASON + 2) {
    count = 0;
    pos.poolcheck();
    year++;
  }
}, CONSTD);
function onClickClose() {
  dispText(outputlogs);
}
