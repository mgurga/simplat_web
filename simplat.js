var c = document.getElementById('simCanvas');
c.height = 900;
c.width = 1600;

var ctx = c.getContext('2d');

var basePath = '';
var baseModule = 'simplat';
var moduleName = '';
var blankTexture = '';
var modOverwrite = '';
var staryNightHex = '#00033a';
var canvasFont = '30px monospace';

////////// IMPORTANT RAW JSON FOR LEVELS ////////////////

var smb11 = 'https://api.jsonbin.io/b/5b74f3d62b23fb1f2b7467fe';
var rbdebug = 'https://api.jsonbin.io/b/5b74f465e013915146d53073';

var drawpspeed = 0;
var loadedFiles = 0;
var totalFiles = 2;
var imagesLoaded = 0;
var tileWidth = 0;
var tileHeight = 0;
var scroll = 0;
var scrollBlock = 0;
var pspeed = 10;
var texturePixSize = -1;
var levelBlockLength = 0;
var failedGets = 0;
var scrollSpeed = 10;

var firstRun = false;
var prefLoaded = false;
var levelsLoaded = false;
var levelMetaExists = false;
var canGroundPound = false;
var debug = false;
var canMove = true;
var alreadyWon = false;
var loadLocal = false;
var flickerTimer = true;

var keys = [];
var tiles = [];
var curLevel = [];
var levelBackup = [];
var starx = [];
var stary = [];
var starState = [];

var curLevelMeta = {};
var prefs = {};
var levels = {};
var textures = {};
var allLevelDataJSON = {};

//game
var frame = 0;
var fps = 45;
var pixSize = 2;
var unknownColor = 0;

//level attributes
var textureAtts = {};

//level collision
var lCx = [],
     lCy = [],
     lCwidth = [],
     lCheight = [],
     lCid = [],
     lCsp = [],
     levelLength = 1000,
     lCtotal = 0;

//player declarations
var playerX = 30.0,
     playerY = 10000.0,
     playerBlockX = 0,
     playerBlockY = 0,
     playerWidth = 50,
     playerHeight = 80,
     playerDefHeight = 10,
     playerDefWidth = 10,
     playerJumpHeight = 25,
     playerCrouching = false,
     playerRightPressed = false;

//player physics
var pxV = 0.0,
     pfaster = false,
     fastFrameStart = 0,
     pyV = 0.0,
     pfriction = 0.6,
     pgravity = 1,
     pspeed = 2,
     defaultpspeed = 10,
     pjumping = false,
     canMoveRight = true,
     canMoveLeft = true;

var enemies = [],
     enemiestotal = 0;

var pointx = 100,
     pointy = 100,
     blockHitX = [],
     blockHitY = [],
     blockHitW = [],
     blockHitH = [],
     blockHitId = [],
     blockHitFrame = [],
     blockHitTotal = 0;

console.log('hello world, variables set');

function preload() {
     if (loadLocal) {

          loadJSON(smb11, function(data) {
               var dataJson = JSON.parse(data);
               levels = data.levels;
               textures = data.textures;

               finishedLoading();
          });

     } else {
          var urlURL = window.location.href.split('#')[1];

          var loadURL = smb11;

          if (urlURL != undefined) {
               loadURL = urlURL;
          }

          if (modOverwrite != '') {
               loadURL = modOverwrite;
          }

          var totalModuleLoad = {};
          totalModuleLoad = getUrlJSON(loadURL, function(levelCall, textureCall) {
               console.log('level loaded');
               //console.log(levelCall);


               console.log('callback texture: ');
               console.log(textureCall);

               levels = levelCall;
               textures = textureCall;

               finishedLoading();
          });
     }
}

function finishedLoading() {
     firstRun = true;

     //console.log(levels);

     setup();
}

function reloadWURL(newURL) {
     modOverwrite = newURL;
     preload();
}

function getUrlJSON(yourUrl, success) {
     var request = new XMLHttpRequest();
     request.open('GET', yourUrl, true);

     request.onload = function() {
          if (request.status >= 200 && request.status < 400) {
               // Success!
               var data = JSON.parse(request.responseText);
               console.log('gotem');
               console.log(data);

               success(data['levels'], data['textures']);
          } else {
               // We reached our target server, but it returned an error
               console.log('target reached but failed loading');
          }
     };

     request.onerror = function() {
          console.log('error loading');
     };

     request.send();
}

document.addEventListener('keydown', function(event) {
     keys[event.keyCode] = true;
     //console.log(event.key + "   code: " + event.keyCode);
});
document.addEventListener('keyup', function(event) {
     keys[event.keyCode] = false;
});

console.log('added key listener');

// start setup

function scaleCanvasToScreen() {
     var scacleFactor = 900 / window.innerHeight;

     if (window.innerHeight < 900) {
          scacleFactor = window.innerHeight / 900;
     }

     ctx.scale(1600, scacleFactor);
     c.width = c.width * scacleFactor;
     c.height = c.height * scacleFactor;
}

function scaleCanvasToCustom(factor) {

     var oldHeight = c.height;

     ctx.scale(1600, oldHeight * factor);
     c.width = window.innerWidth;
     c.height = c.height * factor - 5;


     return "height: " + c.height + " width: " + c.width + " factor: " + factor;

}

function setup() {

     console.log(scaleCanvasToCustom(window.innerHeight / 900));

     //console.log(levels);
     //console.log(textures);

     pixSize =
          c.height / levels['level1'].split('%').length / textures.textureSize;

     //pixSize = 2;

     playerDefHeight = 7 * pixSize;
     playerDefWidth = 5 * pixSize;

     playerJumpHeight = 26;
     defaultpspeed = pixSize * 1.31;
     pspeed = defaultpspeed * 2;
     console.log(pixSize);
     texturePixSize = pixSize * textures.textureSize;
     textureAtts = textures.attributes;

     loadLevel('level1');

     //console.log(textures);

     for (var i = 0; i < textures.textureSize * textures.textureSize; i++) {
          blankTexture += '0.';
     }
     blankTexture = blankTexture.substring(0, blankTexture.length - 1);

     levelBlockLength = curLevel[0].split('.') * texturePixSize;

     drawStart();
     frame = 1000;
}

function loadLevel(levelName) {
     curLevel = levels[levelName].split('%');

     if (levels[levelName + '-metadata'] != undefined) {
          curLevelMeta = levels[levelName + '-metadata'];
          levelMetaExists = true;
          console.log('level metadata: ');
          console.log(curLevelMeta);

          makeStars();
     }

     //  if(levels[levelName + '-metadata'] === undefined) {
     //    console.warn("NO LEVEL ATTRIBUTES   ALL BLOCKS WILL BE SOLID   CREATE SOME ATTRIBUTE WITH THE ATTRIBUTE EDITOR");
     //  }

     makeCollision();

     playerX = 200.0;
     playerY = 0;
}

function makeCollision() {

     var colCount = 0;
     var levelStrip = [];

     for (var i = 0; i < curLevel.length; i++) {
          levelStrip = curLevel[i];
          levelStrip = levelStrip.split('.');

          for (var j = 0; j < levelStrip.length; j++) {
               //isSolid(levelStrip[j])
               if (isSolid(levelStrip[j])) {
                    var blockDelta = texturePixSize;

                    lCx[colCount] = j * blockDelta;
                    lCy[colCount] = i * blockDelta;
                    lCwidth[colCount] = blockDelta;
                    lCheight[colCount] = blockDelta;
                    lCid[colCount] = levelStrip[j];
                    colCount++;

               }

               if (canHurt(levelStrip[j])) {
                    enemies[enemiestotal] = new Enemy(j * blockDelta, i * blockDelta, blockDelta, blockDelta, levelStrip[j]);
                    enemiestotal++;

                    createBlock(j, i, 0, false);
               }
          }
     }

     console.log('collision boxes: ' + colCount);
     lCtotal = colCount;
}

function draw() {

     //c.width = window.innerWidth - 7;
     //c.height = window.innerHeight - 5;

     playerBlockX = Math.round((playerX - scroll) / texturePixSize);
     playerBlockY = Math.round((playerY) / texturePixSize);

     unknownColor++;
     if (unknownColor > 255) {
          unknownColor = 0;
     }

     playerWidth = playerDefWidth;

     scrollBlock = ((scroll * -1) / texturePixSize) * -1;

     if (frame % 15 == 0) {
          if (flickerTimer) {
               flickerTimer = false;
          } else {
               flickerTimer = true;
          }
     }

     handleKeys();

     calculateCollision();

     drawLevel();
     drawPlayer(playerX, playerY - playerHeight, 0);

     for (var s = 0; s < enemiestotal; s++) {
          enemies[s].tick();
          enemies[s].render();
     }

     if (alreadyWon) {
          if (flickerTimer) {
               ctx.fillStyle = '#FFFFFF';
          } else {
               ctx.fillStyle = '#000000';
          }

          ctx.font = canvasFont;

          ctx.fillText('you win', c.width / 2 - 50, c.height / 2);
          ctx.fillText(
               'refresh page to play again',
               c.width / 2 - 50,
               c.height / 2 + 30
          );
     }

     if (debug) {
          ctx.strokeStyle = "#00FF00";
          ctx.lineWidth = 5;
          drawReticle(playerX, playerY);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1;
          drawReticle(playerX, playerY - playerHeight);
          drawReticle(playerX - playerWidth / 2, playerY);
          drawReticle(playerX + playerWidth / 2, playerY);

          for (var q = 0; q < lCx.length; q++) {
               ctx.strokeStyle = "#0000FF";
               ctx.lineWidth = 5;
               ctx.strokeRect(lCx[q] - scroll, lCy[q], lCwidth[q], lCheight[q]);

          }
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1;

          ctx.font = "20px monospace";

          ctx.strokeRect(
               playerX - playerWidth / 2,
               playerY - playerHeight,
               playerWidth,
               playerHeight
          );

          ctx.fillText("player x: " + Math.round(playerX), 0, 20);
          ctx.fillText("player y: " + Math.round(playerY), 0, 40);
          ctx.fillText("player xV: " + pxV, 0, 60);
          ctx.fillText("player yV: " + Math.round(pyV), 0, 80);
          ctx.fillText("player block x: " + playerBlockX, 0, 100);
          ctx.fillText("player block y: " + playerBlockY, 0, 120);
          ctx.fillText("scroll: " + scroll, 0, 140);
          ctx.fillText("pfaster: " + pfaster, 0, 160);

          // ctx.fillText("X:" + pointx + " Y:" + pointy, pointx, pointy);
          // ctx.strokeRect(pointx, pointy, textures.textureSize * pixSize, 1);

          ctx.font = canvasFont;
     }

     var scrollLine = (c.width / 10) * 6;

     if (pxV >= 6 && !pfaster) {
          pfaster = true;
          fastFrameStart = frame;
     }

     if (pxV < 6 || !playerRightPressed) {
          pfaster = false;
     }

     if (pfaster && fastFrameStart + 60 < frame) {
          var speedDiff = frame / fastFrameStart;

          if (speedDiff > 2) {
               speedDiff = 2;
          }

          pxV += speedDiff;

          if (debug) {
               ctx.font = "20px monospace";
               ctx.fillText("sSpeed: " + speedDiff, c.width - 300, 20);
          }
          //console.log('diff: ' + speedDiff);
          //console.log('pspeed: ' + pspeed);
          //console.log('frame: ' + frame);
          //console.log('frameStart: ' + fastFrameStart);
     }

     if (pfaster && fastFrameStart + 60 > frame) {
          ///pxV += pspeed;
     }

     var blocksInFront = 0;
     for (var i = 0; i < lCx.length; i++) {
          if (playerX + playerWidth < lCx[i] && playerX + playerWidth > lCx[i] + pixSize * textures.textureSize) {
               blocksInFront++;
          }
     }

     //console.log(blocksInFront);

     if (playerX > scrollLine && blocksInFront === 0) {
          if (playerRightPressed) {
               scroll += pxV + 5;
               playerX = scrollLine;
          } else if (Math.round(pxV) == 0) {
               pxV = 0;
          }
     }

     if (playerX < 65) {
          playerX = 65;
     }

     if (playerY > curLevel.length * textures.textureSize * pixSize) {
          pyV = 0;
          playerY = 0;

          if (playerX < 0) {
               playerX = 300;
          }
     }
     frame++;
     animationTick();
}

function createBlock(x, y, type, remakeCollision) {
     if (x == "self") {
          x = playerBlockX;
     }
     if (y == "self") {
          y = playerBlockY;
     }

     var rawLevelStrip = curLevel[y].split(".");
     rawLevelStrip[x] = type;
     curLevel[y] = rawLevelStrip.join(".");

     console.log("changed block at " + x + "," + y + " to " + type + " with remakeCollision: " + remakeCollision);
     if (remakeCollision) {
          makeCollision();
     }
}

function isSolid(texID) {
     var collideList = textureAtts.canCollide;
     var rawHurtList = textureAtts.canHurt;
     var rawGoal = textureAtts.isGoal;
     //console.log(collideList);
     var solidList = collideList.split(',');
     var hurtList = rawHurtList.split(',');
     var goalList = rawGoal.split(',');

     for (var i = 0; i < solidList.length; i++) {
          if (solidList[i] == texID) {
               return true;
          }
     }

     for (var i = 0; i < goalList.length; i++) {
          if (goalList[i] == texID) {
               return true;
          }
     }

     return false;
}

function canHurt(texId) {

     var rawHurtList = textureAtts.canHurt;
     var hurtList = rawHurtList.split(',');

     for (var i = 0; i < hurtList.length; i++) {
          if (hurtList[i] == texId) {
               return true;
          }
     }

     return false;
}

function deleteAnimation(id) {
     //console.log("deleted id: " + id + " out of a total of: " + blockHitTotal);
     for (var i = 0; i < blockHitTotal - id; i++) {
          blockHitFrame[id + i] = blockHitFrame[id + 1 + i];
          blockHitId[id + i] = blockHitId[id + 1 + i];
          blockHitX[id + i] = blockHitX[id + 1 + i];
          blockHitY[id + i] = blockHitY[id + 1 + i];
     }
     blockHitTotal--;
}

function touchedCollision(colID) {
     if (debug) {
          //console.log('touched id: ' + colID);
     }

     if (pyV > 10) {

     } else {
          var rawHurtAtt = textureAtts.canHurt;
          var hurtAtt = rawHurtAtt.split(',');

          for (var i = 0; i < hurtAtt.length + 1; i++) {
               //console.log(hurtAtt + " " + lCid[colID]);
               if (hurtAtt[i] == lCid[colID]) {
                    console.log('you are dead');
                    youDied();
               }
          }
     }

     var rawGoalAtt = textureAtts.isGoal;
     var goalAtt = rawGoalAtt.split(',');

     for (var i = 0; i < goalAtt.length + 1; i++) {
          //console.log(hurtAtt + " " + lCid[colID]);
          if (goalAtt[i] == lCid[colID]) {
               youWin();
          }
     }
}

function youWin() {
     console.log('you win');
     canMove = false;
     alreadyWon = true;
}

function youDied() {
     if (!debug) {
          scroll = 0;
          playerX = 100;
          fastFrameStart = frame;
     } else {
          if (flickerTimer) {
               ctx.fillStyle = '#FFFFFF';
          } else {
               ctx.fillStyle = '#000000';
          }
          ctx.fillText("[DEBUG]   DIED   [DEBUG]", c.width / 2, c.height / 2);
     }
}

function calculateCollision() {
     //wall collision detection
     //use canMoveRight and canMoveLeft to restrict movement
     var distanceToWall = Math.abs(pxV) + 1;
     var despawnRadius = 200;

     for (var i = 0; i < lCy.length; i++) {
          if (pxV > 0) {
               canMoveLeft = true;
               if (
                    playerX + scroll + 5 + despawnRadius > lCx[i] &&
                    playerX + scroll - 5 - despawnRadius < lCx[i] &&
                    lCx[i] + lCwidth[i] > playerX + distanceToWall + scroll &&
                    lCx[i] < playerX + playerWidth / 2 + distanceToWall + scroll &&
                    playerY > lCy[i] &&
                    playerY + playerHeight > lCy[i] + lCheight[i] + 1 &&
                    playerY - playerHeight < lCy[i] + lCheight[i]
               ) {
                    //playerX = playerX + -1*pxV; + scroll
                    touchedCollision(i);

                    pxV = 0;

                    jumping = true;
                    canMoveRight = false;
               }
          } else if (pxV < 0) {
               canMoveRight = true;
               if (
                    playerX + scroll + despawnRadius > lCx[i] &&
                    playerX + scroll - despawnRadius < lCx[i] &&
                    lCx[i] < playerX + scroll &&
                    lCx[i] + lCwidth[i] >
                    playerX - playerWidth / 2 - distanceToWall + scroll &&
                    playerY - 1 > lCy[i] &&
                    playerY + playerHeight > lCy[i] + lCheight[i] &&
                    playerY - playerHeight < lCy[i] + lCheight[i]
               ) {
                    //playerX = playerX + -1*pxV;
                    touchedCollision(i);

                    pxV = 0;

                    jumping = true;
                    canMoveLeft = false;
               }
          } else {
               canMoveRight = true;
               canMoveLeft = true;
               jumping = true;
          }
     }

     for (var i = 0; i < lCy.length; i++) {
          if (pyV < -2) {
               if (
                    playerX + scroll + despawnRadius > lCx[i] &&
                    playerX + scroll - despawnRadius < lCx[i] &&
                    lCy[i] + lCheight[i] < playerY + 1 &&
                    lCy[i] + lCheight[i] > playerY - playerHeight &&
                    lCx[i] < playerX + playerWidth / 2 + scroll &&
                    lCx[i] + lCwidth[i] > playerX - playerWidth / 2 + scroll
               ) {

                    touchedCollision(i);
                    if (canBreakBlock(i)) {
                         blockHitUnder(
                              lCx[i],
                              lCy[i],
                              i,
                              'this is unused right now',
                              'collision',
                              true
                         );
                         deleteCollision(i);
                    }
                    playerY = playerY + pyV;
                    pyV = 0;
               }
          }

          if (
               playerX + scroll + despawnRadius > lCx[i] &&
               playerX + scroll - despawnRadius < lCx[i] &&
               lCx[i] < playerX + playerWidth / 2 + scroll &&
               lCx[i] + lCwidth[i] > playerX - playerWidth / 2 + scroll &&
               lCy[i] - lCheight[i] / 2 < playerY &&
               lCy[i] > playerY &&
               pyV > 10
          ) {
               touchedCollision(i);
          }

     }

     function canBreakBlock(colID) {
          //true means to break and false is to not

          var rawBreakAtt = textureAtts.canBreak;
          var breakAtt = rawBreakAtt.split(',');

          for (var i = 0; i < breakAtt.length + 1; i++) {
               //console.log(hurtAtt + " " + lCid[colID]);
               if (breakAtt[i] == lCid[colID]) {
                    return true;
               }
          }

          return false;
     }

     function deleteCollision(id) {
          console.log(
               '[COLLISION] deleted id: ' + id + ' out of a total of: ' + lCtotal
          );

          for (var i = 0; i < lCtotal - id; i++) {
               lCx[id + i] = lCx[id + 1 + i];
               lCy[id + i] = lCy[id + 1 + i];
               lCwidth[id + i] = lCwidth[id + 1 + i];
               lCheight[id + i] = lCheight[id + 1 + i];
               lCid[id + i] = lCid[id + 1 + i];
          }
          lCtotal--;
     }

     function blockHitUnder(_x, _y, _op1, _op2, _namespace, _destroy) {
          var _blockx = -1;
          var _blocky = -1;
          var _blockWidth = -1;
          var _blockHeight = -1;

          //fill out the above variables with the parameters given by the function
          if (_namespace == 'collision') {
               _blockWidth = lCwidth[_op1];
               _blockHeight = lCheight[_op1];
               _blockx = Math.floor(lCx[_op1] / _blockHeight);
               _blocky = Math.floor(lCy[_op1] / _blockWidth);
          }

          if (_destroy == true) {
               //console.log(curLevel);
               console.log('broke blockx: ' + _blockx + ' and blocky: ' + _blocky);
               var _lengthBackup = curLevel[_blocky];
               var _curStripEdit = curLevel[_blocky].split('.');

               createHitAnimation(lCx[_op1], lCy[_op1], _curStripEdit[_blockx], frame);
               _curStripEdit[_blockx] = '0';
               var _recompiled = '';
               for (var i = 0; i < _lengthBackup.length; i++) {
                    _recompiled += _curStripEdit[i] + '.';
               }
               _recompiled = _recompiled.substring(0, _lengthBackup.length);
               curLevel[_blocky] = _recompiled;
          } else {}
     }

     function createHitAnimation(_x, _y, _id, _startFrame) {
          blockHitX[blockHitTotal] = _x;
          blockHitY[blockHitTotal] = _y;
          blockHitId[blockHitTotal] = _id;
          blockHitFrame[blockHitTotal] = _startFrame;
          blockHitTotal++;
     }

     //ground collision detection
     function checkFloorCollision() {
          for (var i = 0; i < lCy.length; i++) {
               if (
                    lCy[i] < playerY &&
                    lCy[i] + lCheight[i] > playerY &&
                    lCx[i] < playerX + playerWidth / 2 + scroll &&
                    lCx[i] + lCwidth[i] > playerX - playerWidth / 2 + scroll
               ) {
                    if (canGroundPound && pyV > 20 && playerCrouching) {
                         blockHitUnder(
                              lCx[i],
                              lCy[i],
                              i,
                              'this is unused right now',
                              'collision',
                              true
                         );
                    }

                    return true;
               }
          }

          return false;
     }

     playerY = playerY + pyV;

     playerX = playerX + pxV;
     pxV = pxV * pfriction;

     if (checkFloorCollision()) {
          playerY = playerY - pyV;
          pyV = 0;
          jumping = false;
     } else {
          pyV += pgravity;
          jumping = true;
     }
}

function randNum(min, max) {
     return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeStars() {
     var randStarY = 0;
     var starSkyFactor = 1;

     for (var i = 1; i < randNum(100, 200) + 1; i++) {
          starx[i] = randNum(0, (levelLength * 10) / starSkyFactor);
          stary[i] = randStarY + randNum(-10, 20);

          if (randNum(1, 10) > 9) {
               starState[i] = true;
               randStarY += randNum(50, 100);
          } else {
               starState[i] = false;
          }
     }
}

function loadJSON(path, success, error) {
     var xhr = new XMLHttpRequest();
     xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
               if (xhr.status === 200) {
                    if (success) success(JSON.parse(xhr.responseText));
               } else {
                    if (error) error(xhr);
               }
          }
     };
     xhr.open('GET', path, true);
     xhr.send();
}

function drawStart() {
     setTimeout(function() {
          requestAnimationFrame(drawStart);

          draw();
     }, 1000 / fps);
}