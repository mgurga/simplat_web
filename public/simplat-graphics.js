preload();

function drawTexture(x, y, textureID) {
  var texDataRaw = textures.textureData[textureID];
  var texData = texDataRaw.split(".");
  //console.log(texData);

  if (texDataRaw == blankTexture && textureID == 0) {
    if (levelMetaExists && curLevelMeta["staryNight"] == true) {
      ctx.fillStyle = staryNightHex;
      ctx.fillRect(x, y, texturePixSize + 1, texturePixSize);
    } else {
      ctx.fillStyle = textures.background;
      ctx.fillRect(x, y, texturePixSize + 1, texturePixSize);
    }
  } else {
    if (levelMetaExists && curLevelMeta["staryNight"] == true) {
      ctx.fillStyle = staryNightHex;
      ctx.fillRect(x, y, texturePixSize + 1, texturePixSize);
    } else {
      ctx.fillStyle = textures.background;
      ctx.fillRect(x, y, texturePixSize + 1, texturePixSize);
    }

    for (var i = 0; i < textures.textureSize; i++) {
      for (var j = 0; j < textures.textureSize; j++) {
        if (
          textures.colorIndex[texData[j + textures.textureSize * i]] == "alpha"
        ) {} else {
          ctx.fillStyle =
            textures.colorIndex[texData[j + textures.textureSize * i]];
          ctx.fillRect(i * pixSize + x, j * pixSize + y, pixSize + 1, pixSize);
        }

        if (debug) {
          ctx.strokeRect(i * pixSize + x, j * pixSize + y, pixSize + 1, pixSize);
        }
      }
    }
  }
}

function handleKeys() {
  if (playerCrouching) {
    pspeed = defaultpspeed / 2;
    gravity = 2;
  } else {
    pspeed = defaultpspeed;
  }

  var pointpspeed = 1;

  if (keys[40]) {
    //down arrow
    //pointy -= pointpspeed;
    playerHeight = 40;
    playerCrouching = true;
  } else {
    playerHeight = 80;
    playerCrouching = false;
  }

  if (keys[39] && canMoveRight || keys[68] && canMoveRight) {
    //right arrow
    pxV = defaultpspeed;
    //pointx += pointpspeed;
    playerRightPressed = true;
  } else {
    playerRightPressed = false;
  }

  if (keys[38] || keys[87]) {
    //up arrow
    if (!jumping) {
      pyV = -1 * playerJumpHeight;
      //pointy += pointpspeed;
      jumping = true;
    }
  }

  if (keys[37] && canMoveLeft || keys[65] && canMoveLeft) {
    //left arrow
    pxV = -1 * defaultpspeed;
    //pointx -= pointpspeed;
  }

  if(keys[220]) {
    if(debug) {
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

          ctx.fillRect(
            i * playerPixSize + _px,
            j * playerPixSize + _py,
            playerPixSize,
            playerPixSize
          );
          //ctx.strokeRect(i * playerPixSize + _px, j * playerPixSize + _py, playerPixSize, playerPixSize);
        }
      }
    }
  }
}

function drawLevel() {
  drawBackground();

  var drawingCutoff = 35;

  for (var i = 0; i < curLevel.length; i++) {
    var renderStrip = curLevel[i].split(".");

    for (var j = 0; j < scrollBlock + drawingCutoff; j++) {
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
}

function drawBackground() {
  ctx.fillStyle = "#262626";
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
  for (var i = 0; i < lCtotal; i++) {
    ctx.strokeRect(lCx[i] - scroll, lCy[i], lCwidth[i], lCheight[i]);
    ctx.font = canvasFont;
    ctx.fillText("x: " + lCx[i] + " \ny: " + lCy[i] + "  \nid: " + lCid[i], lCx[i] - scroll, lCy[i] + 20);

    drawReticle(lCx[i] - scroll, lCy[i]);
  }
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
  for (var i = 0; i < blockHitTotal; i++) {
    var curAnimFrame = frame - blockHitFrame[i];
    var curHeight = 0;

    if (curAnimFrame < 3) {
      curHeight = curAnimFrame;

      drawTexture(playerX - texturePixSize / 2, blockHitY[i] - curHeight * 2, blockHitId[i]);
    } else if (curAnimFrame > 2 && curAnimFrame < 6) {
      curHeight = 7 - curAnimFrame;

      drawTexture(playerX - texturePixSize / 2, blockHitY[i] - curHeight * 2, blockHitId[i]);
    } else {
      deleteAnimation(i);
    }
  }
}