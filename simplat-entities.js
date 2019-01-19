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