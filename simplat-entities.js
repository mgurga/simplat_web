class Enemy {

    // ENEMY XY IS IN THE UPPER LEFT CORNER
    // COLLISION XY IS IN THE UPPER LEFT

    constructor(x, y, w, h, tex) {
        this.originx = x;
        this.originy = y;
        this.x = x;
        this.y = y;
        this.xV = 0;
        this.yV = 0;
        this.width = w;
        this.height = h;
        this.textureId = tex;
        this.friction = 1;
        this.switchMove = true;
        this.died = false;
        this.active = false;
        this.movement = "<>";
        this.currentMovement = 0;
    }

    tick() {
        var activeRadius = 10 * texturePixSize;
        //console.log(Math.abs((player.x + scroll) - (this.x)) < activeRadius);
        if (!this.died && Math.abs((player.x + scroll) - (this.x)) < activeRadius) {
            this.active = true;
        }
        if (this.active) {
            if (pyV > 1 &&
                this.x - (player.width / 2) <= player.x + scroll &&
                this.x + this.width + (player.width / 2) >= player.x + scroll &&
                this.y + (this.width / 3) + pyV >= player.y &&
                this.y <= player.y
            ) {
                player.y = this.y;
                pyV = -7;
                this.die();
            }

            //console.log("X:" + Math.abs((player.x + scroll) - (this.x)) < this.width / 2);
            //console.log("Y:" + Math.abs((player.y - player.height) - (this.y)) < this.height);
            if ((Math.abs((player.y - player.height) - (this.y + this.width / 2)) < this.height) && (Math.abs((player.x + scroll) - (this.x + this.width / 2)) < this.width)) {
                youDied();
                console.log("ded");
            }

            this.fall = true;
            for (var i = 0; i < lCtotal; i++) {
                var despawnRadius = 200;
                var activeBlockDistance = this.texturePixSize;
                // if below is to find the current active block, the block that the enemy is touching both up and down and right and left
                if (lCx[i] < this.x + (this.width / 2) && this.x - (this.width / 2) < lCx[i] + lCwidth[i] &&
                    lCy[i] - lCheight[i] < this.y && lCy[i] > this.y) {
                    if (debug) {
                        ctx.strokeStyle = "#FF0000";
                        ctx.lineWidth = 3;
                        ctx.strokeRect(lCx[i] - scroll + 10, lCy[i] + 10, lCwidth[i] - 20, lCheight[i] - 20);
                    }
                    this.fall = false;

                }

                if (this.movement.charAt(this.currentMovement) == "<") {
                    if (lCx[i] + lCwidth[i] > this.x &&
                        lCx[i] < this.x &&
                        lCy[i] - 1 < this.y &&
                        lCy[i] + lCheight[i] + 1 > this.y) {

                        this.currentMovement++;

                        if (debug) {
                            //console.log("stopped moving left");
                        }
                    }
                }

                if (this.movement.charAt(this.currentMovement) == ">") {
                    if (this.x + this.width > lCx[i] &&
                        this.x + this.width < lCx[i] + lCwidth[i] &&
                        lCy[i] - 1 < this.y &&
                        lCy[i] + lCheight[i] + 1 > this.y) {

                        this.currentMovement++;

                        if (debug) {
                            //console.log("stopped moving right");
                        }
                    }
                }

            }

            if (this.fall) {
                this.yV += 0.9;
            } else {
                //console.log(this.yV);
                if (this.yV > 0 && this.yV <= 1) {
                    this.yV = 0;
                }

                this.y -= this.yV;
                this.yV = 0;
            }

            if (this.currentMovement > this.movement.length - 1) {
                this.currentMovement = 0;
            }

            if (this.movement.charAt(this.currentMovement) == ">") {
                this.xV = 2;
            } else if (this.movement.charAt(this.currentMovement) == "<") {
                this.xV = -2;
            } else if (this.movement.charAt(this.currentMovement) == "^") {
                this.yV = -10;
                this.currentMovement++;
            }

            //this.xV += 1;
            this.y += this.yV;

            this.x = this.x + this.xV;
            this.xV = this.xV * this.friction;

            if (this.y > curLevel.length * textures.textureSize * pixSize) {
                this.died = true;
            }
        } else {
            this.xV = 0;
            this.yV = 0;
        }
    }

    die() {
        if (debug) {
            console.log("enemy die");
        }
        this.active = false;
        this.died = true;
    }

    render() {
        if (!this.died) {
            drawTexture(this.x - scroll, Math.floor(this.y), this.textureId);
        }
        if (debug) {
            ctx.strokeStyle = "#FF0000";
            ctx.lineWidth = 5;
            ctx.strokeRect(this.x - scroll, this.y, this.width, this.height);
            drawReticle(this.x - scroll, this.y);
            drawReticle(this.x + this.width - scroll, this.y);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000000";

            ctx.fillText("currentMovement: " + this.movement.charAt(this.currentMovement), this.x - scroll + this.width, this.y - 20);
            ctx.fillText("X: " + Math.round(this.x), this.x - scroll + this.width, this.y);
            ctx.fillText("Y: " + Math.round(this.y), this.x - scroll + this.width, this.y + 20);
            ctx.fillText("X DISTANCE: " + Math.abs((player.x + scroll) - (this.x)), this.x - scroll + this.width, this.y + 40);
            ctx.fillText("YV: " + this.yV, this.x - scroll + this.width, this.y + 60);
        }
    }
}

function splitBlock(texid, x, y) {
    console.log("split id: " + texid);
    console.log("split x: " + x);
    console.log("split y: " + y);

    var particlesTextures = ["", "", "", ""];
    var originalPix = textures.textureSize;
    var texDataRaw = textures.textureData[texid].split(".");

    //particleTexture[0] = upper left
    for (var j = 0; j < originalPix / 2; j++) {
        for (var i = 0; i < originalPix / 2; i++) {
            particlesTextures[0] += texDataRaw[i + j * originalPix] + ".";
        }
    }
    particlesTextures[0] = particlesTextures[0].substring(0, particlesTextures[0].length - 1);

    //particleTexture[1] = lower left
    for (var j = 0; j < originalPix / 2; j++) {
        for (var i = originalPix / 2; i < originalPix; i++) {
            particlesTextures[1] += texDataRaw[i + j * originalPix] + ".";
        }
    }
    particlesTextures[1] = particlesTextures[1].substring(0, particlesTextures[1].length - 1);

    //particleTexture[2] = upper right
    for (var j = originalPix / 2; j < originalPix; j++) {
        for (var i = 0; i < originalPix / 2; i++) {
            particlesTextures[2] += texDataRaw[i + j * originalPix] + ".";
        }
    }
    particlesTextures[2] = particlesTextures[2].substring(0, particlesTextures[2].length - 1);

    //particleTexture[3] = lower right
    for (var j = originalPix / 2; j < originalPix; j++) {
        for (var i = originalPix / 2; i < originalPix; i++) {
            particlesTextures[3] += texDataRaw[i + j * originalPix] + ".";
        }
    }
    particlesTextures[3] = particlesTextures[3].substring(0, particlesTextures[3].length - 1);

    var halfPix = pixSize * (originalPix / 2);
    blockHitParticles[blockHitParticles.length] = new blockBreakParticles(x, y, particlesTextures[0], originalPix / 2, "left");
    blockHitParticles[blockHitParticles.length] = new blockBreakParticles(x, y + halfPix, particlesTextures[1], originalPix / 2, "left");
    blockHitParticles[blockHitParticles.length] = new blockBreakParticles(x + halfPix, y, particlesTextures[2], originalPix / 2, "right");
    blockHitParticles[blockHitParticles.length] = new blockBreakParticles(x + halfPix, y + halfPix, particlesTextures[3], originalPix / 2, "right");

}

class blockBreakParticles {
    constructor(x, y, texData, texSize, rightOrLeft) {
        this.x = x;
        this.y = y;
        this.xV = 0;
        this.yV = 0;
        if (rightOrLeft == "right") {
            this.xV = 10 + randNum(-10, 10);
            this.yV = -12 + randNum(-5, 5);
        } else {
            this.xV = -10 + randNum(-10, 10);
            this.yV = -12 + randNum(-5, 5);
        }
        this.texData = texData;
        this.texSize = texSize;
        this.rrl = rightOrLeft;
    }
    tick() {
        if (this.y < curLevel.length * texturePixSize) {
            drawTexture(this.x - scroll, this.y, undefined, this.texData, this.texSize);

            this.y += this.yV;
            this.yV += 1.5;

            this.x += this.xV;
            this.xV *= 0.9;
        }
    }
}
