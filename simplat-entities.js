class Enemy {

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
     }

     tick() {
          var activeRadius = 10 * texturePixSize;
          //console.log(Math.abs((playerX + scroll) - (this.x)) < activeRadius);
          if (!this.died && Math.abs((playerX + scroll) - (this.x)) < activeRadius) {
               this.active = true;
          }
          if (this.active) {
               //console.log("X:" + Math.abs((playerX + scroll) - (this.x)) < this.width / 2);
               //console.log("Y:" + Math.abs((playerY - playerHeight) - (this.y)) < this.height);
               if ((Math.abs((playerY - playerHeight) - (this.y)) < this.height) && (Math.abs((playerX + scroll) - (this.x)) < this.width / 2)) {
                    youDied();
                    console.log("ded");
               }

               this.fall = true;
               for (var i = 0; i < lCtotal; i++) {
                    var despawnRadius = 200;
                    if (
                         lCy[i] < this.y + this.height &&
                         lCy[i] + lCheight[i] > this.y &&
                         lCx[i] < this.x + this.width / 2 + scroll &&
                         lCx[i] + lCwidth[i] > this.x - this.width / 2 + scroll
                    ) {
                         this.fall = false;
                    }
               }

               if (this.fall) {
                    this.yV += 1;
               } else {
                    //console.log(this.yV);
                    if (this.yV > 0 && this.yV <= 1) {
                         this.yV = 0;
                    }

                    this.y -= this.yV;
                    this.yV = 0;
               }

               this.xV = -2;

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

     render() {
          drawTexture(this.x - scroll, Math.floor(this.y), this.textureId);
          if (debug) {
               ctx.strokeStyle = "#FF0000";
               ctx.lineWidth = 5;
               ctx.strokeRect(this.x - scroll, this.y, this.width, this.height);
               drawReticle(this.x - scroll, this.y);
               ctx.lineWidth = 1;
               ctx.strokeStyle = "#000000";

               ctx.fillText("X: " + Math.round(this.x), this.x - scroll, this.y);
               ctx.fillText("Y: " + Math.round(this.y), this.x - scroll, this.y + 20);
               ctx.fillText("X DISTANCE: " + Math.abs((playerX + scroll) - (this.x)), this.x - scroll, this.y + 40);
               ctx.fillText("Y DISTANCE: " + Math.abs((playerY - playerHeight) - (this.y)), this.x - scroll, this.y + 60);
          }
     }
}