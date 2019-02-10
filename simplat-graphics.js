var renderDistance = 35;

function drawTexture(x, y, textureID, customTextureData, customTextureSize) {
    var texDataRaw = textures.textureData[textureID];
    var texSize = textures.textureSize;
    if (customTextureData != undefined) {
        texDataRaw = customTextureData;
        texSize = customTextureSize;
    }

    if (texDataRaw == undefined) {
        console.error("Texture: " + textureID + " does not exist");

        ctx.fillStyle = unknownColor;
        ctx.fillRect(x, y, texturePixSize, texturePixSize);

    } else {
        var texData = texDataRaw.split(".");

        if (texDataRaw == blankTexture && textureID == 0) {
            // commenting this out makes transparency

            if (levelMetaExists && curLevelMeta["staryNight"] == true) {
                ctx.fillStyle = staryNightHex;
                ctx.fillRect(x, y, texturePixSize + 1, texturePixSize);
            } else {
                ctx.fillStyle = textures.background;
                ctx.fillRect(x, y, texturePixSize + 1, texturePixSize);
            }
        } else {
            if (customTextureSize == undefined) {
                if (levelMetaExists && curLevelMeta["staryNight"] == true) {
                    ctx.fillStyle = staryNightHex;
                    ctx.fillRect(x, y, texturePixSize + 1, texturePixSize);
                } else {
                    ctx.fillStyle = textures.background;
                    ctx.fillRect(x, y, texturePixSize + 1, texturePixSize);
                }
            }

            for (var i = 0; i < texSize; i++) {
                for (var j = 0; j < texSize; j++) {
                    if (
                        textures.colorIndex[texData[j + texSize * i]] == "alpha"
                    ) {} else {
                        ctx.fillStyle =
                            textures.colorIndex[texData[j + texSize * i]];
                        ctx.fillRect(i * pixSize + x - 1, j * pixSize + y - 1, pixSize + 1, pixSize + 1);
                    }

                }
            }

            if (debug) {
                ctx.strokeRect(x, y, texturePixSize, texturePixSize);
            }
        }
    }
}

function handleSlideshowKeys() {
    if (keys[38] && slideshowFrame % 5 == 0) {
        //up arrow
        slideshowPlaybackSpeed = slideshowPlaybackSpeed * slideshowPlaybackMultiplier;
    }
    if (keys[40] && slideshowFrame % 5 == 0) {
        //down arrow
        slideshowPlaybackSpeed = slideshowPlaybackSpeed / slideshowPlaybackMultiplier;
    }
    if (keys[39]) {
        //right arrow
        curImg += slideshowPlaybackSpeed / 2;
        if (curImg > slideshow.length) {
            curImg = slideshow.length;
        }
    }
    if (keys[37]) {
        //left arrow
        curImg -= slideshowPlaybackSpeed * 2;
        if (curImg < 0) {
            curImg = 0;
        }
    }

    if (keys[79]) {
        //o key
        runGame = true;
    }

    if (keys[220]) {
        if (debug) {
            debug = false;
        } else {
            debug = true;
        }
        keys[220] = false;
    }
}

function handleKeys() {
    if (player.crouching) {
        pspeed = defaultpspeed / 2;
        gravity = 2;
    } else {
        pspeed = defaultpspeed;
    }

    if (keys[80]) {
        //p key
        curImg = 0;
        runGame = false;
    }

    if (keys[82]) {
        //R to restart
        location.reload(true);
    }

    var pointpspeed = 1;
    if (canMove) {
        if (debug) {
            if (keys[40]) {
                //down arrow
                //pointy -= pointpspeed;
                player.height = player.defHeight / 2;
                player.crouching = true;
            } else {
                player.height = player.defHeight;
                player.crouching = false;
            }
        }

        if (keys[39] && canMoveRight || keys[68] && canMoveRight) {
            //right arrow
            pxV = defaultpspeed;
            //pointx += pointpspeed;
            player.rightPressed = true;
        } else {
            player.rightPressed = false;
        }

        if (keys[38] || keys[87]) {
            //up arrow
            if (!jumping) {
                pyV = -1 * player.jumpHeight;
                //pointy += pointpspeed;
                jumping = true;
            }
        }

        if (keys[37] && canMoveLeft || keys[65] && canMoveLeft) {
            //left arrow
            pxV = -1 * defaultpspeed;
            //pointx -= pointpspeed;
        }
    }

    if (keys[220]) {
        if (debug) {
            debug = false;
        } else {
            debug = true;
        }
        keys[220] = false;
    }

    if (debug) {
        if (keys[69]) {
            scroll += scrollSpeed;
        }

        if (keys[81]) {
            scroll -= scrollSpeed;
        }
    }
}

function drawPlayer(_px, _py, _pid) {
    if (_pid === 0) {
        var playerTexDataRaw =
            "0.0.0.0.1.0.0.1.1.1.1.0.1.0.1.0.1.0.1.1.1.1.0.0.1.1.1.0.1.0.1.0.0.0.0.0.1.0.0.1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0"; //0.0.0.0 data kind of stuff here
        var playerTexData = playerTexDataRaw.split(".");
        var playerTexSize = 8;
        var playerPixSize = pixSize;
        var playerColorIndex = {
            "0": "alpha",
            "1": "#000000"
        };
        _px -= 25;
        //console.log(texData);

        //ctx.strokeRect(_px, _py, playerPixSize * playerPixSize, playerPixSize * playerPixSize);

        for (var i = 0; i < playerTexSize; i++) {
            for (var j = 0; j < playerTexSize; j++) {
                if (playerColorIndex[playerTexData[j + playerTexSize * i]] == "alpha") {
                    //ctx.fillStyle = textures.background;
                } else {
                    ctx.fillStyle =
                        playerColorIndex[playerTexData[j + playerTexSize * i]];

                    if (player.crouching) {
                        ctx.fillRect(
                            i * playerPixSize + _px,
                            j * playerPixSize / 2 + _py + playerPixSize / 2,
                            playerPixSize,
                            playerPixSize / 2
                        );
                    } else {
                        ctx.fillRect(
                            i * playerPixSize + _px,
                            j * playerPixSize + _py,
                            playerPixSize,
                            playerPixSize
                        );
                    }
                    //ctx.strokeRect(i * playerPixSize + _px, j * playerPixSize + _py, playerPixSize, playerPixSize);
                }
            }
        }
    }
}

function drawLevel() {
    drawBackground();

    for (var i = 0; i < curLevel.length; i++) {
        var renderStrip = curLevel[i].split(".");

        for (var j = 0; j < scrollBlock + renderDistance; j++) {
            //console.log(renderStrip[j]);
            if (j > scrollBlock - 5)
                drawTexture(
                    j * pixSize * textures.textureSize + scroll * -1,
                    i * pixSize * textures.textureSize,
                    renderStrip[j]
                );
        }
    }

    if (levelMetaExists && curLevelMeta["staryNight"] == true) {
        drawStars();
    }

    if (debug) {
        drawCollision();
    }
}

function drawStars() {
    ctx.fillStyle = "#ffffff";

    for (var i = 0; i < starx.length; i++) {
        ctx.fillRect(starx[i] - scroll, stary[i], 10, 10);
    }
    player.defWidth = 6 * pixSize;
}

function drawBackground() {
    ctx.fillStyle = textures.background;
    ctx.fillRect(0, 0, c.width, c.height);

    //   for (var i = 0; i < c.width / pixSize; i++) {
    //     for (var j = 0; j < c.height / pixSize; j++) {
    //       if (j % 2 == 0) {
    //         ctx.fillStyle = "#d6d6d6";
    //       } else {
    //         ctx.fillStyle = "#515151";
    //       }

    //       ctx.fillRect(i * pixSize, j * pixSize, pixSize, pixSize);
    //     }
    //   }
}

function drawCollision() {
    ctx.fillStyle = '#000000';
    ctx.font = "20px monospace";
    for (var i = 0; i < lCtotal; i++) {
        var atts = "";
        if (textureAtts.canHurt.indexOf(lCid[i]) != -1) {
            atts += "canHurt, ";
        }
        if (textureAtts.canBreak.indexOf(lCid[i]) != -1) {
            atts += "canBreak, ";
        }
        if (textureAtts.canCollide.indexOf(lCid[i]) != -1) {
            atts += "canCollide, ";
        }
        if (textureAtts.isGoal.indexOf(lCid[i]) != -1) {
            atts += "isGoal, ";
        }

        ctx.strokeRect(lCx[i] - scroll, lCy[i], lCwidth[i], lCheight[i]);
        //ctx.fillText("x: " + lCx[i] + " y: " + lCy[i] + "  id: " + lCid[i], lCx[i] - scroll, lCy[i] + 20);
        ctx.fillText("x: " + Math.round(lCx[i]), lCx[i] + lCwidth[i] - scroll, lCy[i] + 15);
        ctx.fillText("y: " + Math.round(lCy[i]), lCx[i] + lCwidth[i] - scroll, lCy[i] + 30);
        ctx.fillText("id: " + lCid[i], lCx[i] + lCwidth[i] - scroll, lCy[i] + 45);
        ctx.fillText("atts: " + atts, lCx[i] + lCwidth[i] - scroll, lCy[i] + 60);


        drawReticle(lCx[i] - scroll, lCy[i]);
    }
    ctx.font = canvasFont;
}

function drawReticle(_rx, _ry) {
    var edgeLen = 10;
    ctx.beginPath();
    ctx.moveTo(_rx, _ry - edgeLen);
    ctx.lineTo(_rx, _ry + edgeLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(_rx - edgeLen, _ry);
    ctx.lineTo(_rx + edgeLen, _ry);
    ctx.stroke();
}

function animationTick() {
    // for (var i = 0; i < blockHitTotal; i++) {
    //     var curAnimFrame = frame - blockHitFrame[i];
    //     var curHeight = 0;
    //
    //     if (curAnimFrame < 3) {
    //         curHeight = curAnimFrame;
    //
    //         drawTexture(player.x - texturePixSize / 2, blockHitY[i] - curHeight * 2, blockHitId[i]);
    //     } else if (curAnimFrame > 2 && curAnimFrame < 6) {
    //         curHeight = 7 - curAnimFrame;
    //
    //         drawTexture(player.x - texturePixSize / 2, blockHitY[i] - curHeight * 2, blockHitId[i]);
    //     } else {
    //         deleteAnimation(i);
    //     }
    // }
}
