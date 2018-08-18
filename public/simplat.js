var c = document.getElementById("simCanvas");
var ctx = c.getContext("2d");

var basePath = "";
var baseModule = "simplat";
var moduleName = "";
var blankTexture = "";
var modOverwrite = "";
var staryNightHex = "#00033a";
var canvasFont = "30px monospace";

////////// IMPORTANT RAW JSON FOR LEVELS ////////////////

var smb11 = "https://api.jsonbin.io/b/5b74f3d62b23fb1f2b7467fe";
var rbdebug = "https://api.jsonbin.io/b/5b74f465e013915146d53073";

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
  fastFrameStart = 0;
  pyV = 0.0,
  pfriction = 0.6,
  pgravity = 1,
  pspeed = 2,
  defaultpspeed = 10,
  pjumping = false,
  canMoveRight = true,
  canMoveLeft = true;

var pointx = 100,
  pointy = 100,
  blockHitX = [],
  blockHitY = [],
  blockHitW = [],
  blockHitH = [],
  blockHitId = [],
  blockHitFrame = [],
  blockHitTotal = 0;

console.log("hello world, variables set");

function preload() {

  if (loadLocal) {
    preLoadStart();

    function preLoadStart() {
      if (firstRun === false) {
        var drawTimeout = setTimeout(preLoadLoop, 200);
      }

      function preLoadLoop() {
        //first load prefs
        console.log("getting levels");

        loadJSON(
          "data/" + baseModule + "/levels.json",
          function (data) {
            if (!prefLoaded) {
              levels = data;
              prefLoaded = true;
              loadedFiles++;
              //console.log(loadedFiles);
            }
          },
          function (xhr) {
            failedGets++;
          }
        );

        console.log("getting textures");
        //load levels json from the module name specified in the prefs file

        loadJSON(
          "data/" + baseModule + "/textures.json",
          function (data) {
            if (!levelsLoaded) {
              textures = data;
              levelsLoaded = true;
              //console.log(loadedFiles);
            }
          },
          function (xhr) {
            failedGets++;
          }
        );

        if (failedGets > 10) {
          firstRun = true;

          if (!levelsLoaded && !prefLoaded) {
            alert("Failed loading level and texture data");
          } else if (!levelsLoaded) {
            alert("Failed loading level data");
          } else if (!prefLoaded) {
            alert("Failed loading pref data");
          }
        }

        if (levelsLoaded && prefLoaded) {
          finishedLoading();
        } else if (loadedFiles < totalFiles) {
          preLoadStart();
        }
      }
    }
  } else {

    var urlURL = window.location.href.split('#')[1];

    var loadURL = smb11;

    if(urlURL != undefined) {
      loadURL = urlURL
    }

    if(modOverwrite != "") {
      loadURL = modOverwrite;
    }

    var totalModuleLoad = {};
    totalModuleLoad = getUrlJSON(loadURL, function(levelCall, textureCall) {

      console.log("callback level: ");
      console.log(levelCall);

      console.log("callback texture: ");
      console.log(textureCall);

      levels = levelCall;
      textures = textureCall;

      finishedLoading();

    });

  }
}

function finishedLoading() {
  firstRun = true;

  console.log(levels);

  setup();
}

function reloadWURL(newURL) {
  modOverwrite = newURL;
  preload();
}

function getUrlJSON(yourUrl, success) {
  var request = new XMLHttpRequest();
  request.open('GET', yourUrl, true);

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var data = JSON.parse(request.responseText);
      console.log("gotem");
      console.log(data);

      success(data['levels'], data['textures']);
    } else {
      // We reached our target server, but it returned an error
      console.log("target reached but failed loading");
    }
  };

  request.onerror = function () {
    console.log("error loading");
  };

  request.send();
  
}

document.addEventListener("keydown", function (event) {
  keys[event.keyCode] = true;
  //console.log(event.key + "   code: " + event.keyCode);
});
document.addEventListener("keyup", function (event) {
  keys[event.keyCode] = false;
});

console.log("added key listener");

// start setup

function setup() {

  c.width = window.innerWidth - 7;
  c.height = window.innerHeight - 5;
  console.log(levels);
  console.log(textures);

  pixSize = c.height / levels["level1"].split("%").length / textures.textureSize;
  
  playerJumpHeight = pixSize*3.2;
  defaultpspeed = pixSize*1.31;
  pspeed = defaultpspeed*2;
  console.log(pixSize);
  texturePixSize = pixSize * textures.textureSize;
  textureAtts = textures.attributes;

  playerDefHeight = 7 * pixSize;
  playerDefWidth = 5 * pixSize;

  loadLevel("level1");
  
  console.log(textures);

  for (var i = 0; i < textures.textureSize * textures.textureSize; i++) {
    blankTexture += "0.";
  }
  blankTexture = blankTexture.substring(0, blankTexture.length - 1);

  levelBlockLength = curLevel[0].split(".") * texturePixSize;

  

  drawStart();
  frame = 1000;
}

function loadLevel(levelName) {
  curLevel = levels[levelName].split("%");

  if (levels[levelName + "-metadata"] != undefined) {
    curLevelMeta = levels[levelName + "-metadata"];
    levelMetaExists = true;
    console.log("level metadata: ");
    console.log(curLevelMeta);

    makeStars();
  }

  // if(levels.attributes === undefined) {
  //   console.warn("NO LEVEL ATTRIBUTES   ALL BLOCKS WILL BE SOLID   CREATE SOME ATTRIBUTE WITH THE ATTRIBUTE EDITOR");
  // }

  createCollision();

  playerX = 200.0;
  playerY = 0;
}

function createCollision() {
  var colCount = 0;
  var levelStrip = [];

  for (var i = 0; i < curLevel.length; i++) {
    levelStrip = curLevel[i];
    levelStrip = levelStrip.split(".");

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
    }
  }

  console.log("collision boxes: " + colCount);
  lCtotal = colCount;
}

function draw() {
  c.width = window.innerWidth - 7;
  c.height = window.innerHeight - 5;

  playerWidth = playerDefWidth;

  scrollBlock = ((scroll * -1) / texturePixSize) * -1;

  if(frame % 15 == 0) {
    if(flickerTimer) {
      flickerTimer = false;
    } else {
      flickerTimer = true;
    }
  }

  handleKeys();

  calculateCollision();

  drawLevel();
  drawPlayer(playerX, playerY - playerHeight, 0);

  if(alreadyWon) {
    

    if(flickerTimer) {
      ctx.fillStyle = "#FFFFFF";
    } else {
      ctx.fillStyle = "#000000";
    }

    ctx.font = canvasFont;

    ctx.fillText("you win",c.width/2-50, c.height/2);
    ctx.fillText("refresh page to play again",c.width/2-50, c.height/2 + 30);
  }

  if (debug) {
    drawReticle(playerX, playerY);
    drawReticle(playerX, playerY - playerHeight);
    drawReticle(playerX - playerWidth / 2, playerY);
    drawReticle(playerX + playerWidth / 2, playerY);

    ctx.strokeRect(
      playerX - playerWidth / 2,
      playerY - playerHeight,
      playerWidth,
      playerHeight
    );
    ctx.fillText(
      "X: " + Math.round(playerX) + " Y: " + Math.round(playerY) + " height: " + playerHeight + " pxV: " + pxV + " pyV: " + pyV,
      playerX - 30,
      playerY - 90
    );

    // ctx.fillText("player x: " + playerX, 0, 10);
    // ctx.fillText("player y: " + playerY, 0, 20);
    // ctx.fillText("player xV: " + pxV, 0, 30);
    // ctx.fillText("player yV: " + pyV, 0, 40);

    // ctx.fillText("X:" + pointx + " Y:" + pointy, pointx, pointy);
    // ctx.strokeRect(pointx, pointy, textures.textureSize * pixSize, 1);
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

    if (speedDiff > 1.1) {
      speedDiff = 1.1;
    }

    pxV += pspeed + speedDiff;
    console.log("diff: " + speedDiff);
    console.log("pspeed: " + pspeed);
    console.log("frame: " + frame);
    console.log("frameStart: " + fastFrameStart);
  }

  if (pfaster && fastFrameStart + 60 > frame) {
    pxV += pspeed;
  }

  if (playerX > scrollLine) {
    scroll += pxV;
    playerX = scrollLine;

    var speedtaper = 2;
    // for(var i = 0; i < 10; i++) {
    //   scroll+=speedtaper;
    //   speedtaper = speedtaper / 2;
    // }
  }

  if(playerX < 65) {
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

function isSolid(texID) {

  var collideList = textureAtts.canCollide;
  var rawHurtList = textureAtts.canHurt;
  var rawGoal = textureAtts.isGoal;
  //console.log(collideList);
  var solidList = collideList.split(",");
  var hurtList = rawHurtList.split(",");
  var goalList = rawGoal.split(",");

  for (var i = 0; i < solidList.length; i++) {
    if (solidList[i] == texID) {
      return true;
    }
  }

  for (var i = 0; i < hurtList.length; i++) {
    if (hurtList[i] == texID) {
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
    console.log("touched id: " + colID);
  }

  var rawHurtAtt = textureAtts.canHurt;
  var hurtAtt = rawHurtAtt.split(',');

  for (var i = 0; i < hurtAtt.length + 1; i++) {
    //console.log(hurtAtt + " " + lCid[colID]);
    if (hurtAtt[i] == lCid[colID]) {
      console.log("you are dead");
      youDied();
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
  console.log("you win");
  canMove = false;
  alreadyWon = true;

}

function youDied() {
  if (!debug) {
    scroll = 0;
    playerX = 100;
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
        playerX + scroll + despawnRadius > lCx[i] &&
        playerX + scroll - despawnRadius < lCx[i] &&
        lCx[i] + lCwidth[i] > playerX + distanceToWall + scroll &&
        lCx[i] < playerX + playerWidth / 2 + distanceToWall + scroll &&
        playerY-1 > lCy[i] &&
        playerY + playerHeight > lCy[i] + lCheight[i] &&
        playerY - playerHeight < lCy[i] + lCheight[i] && pyV < 2
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
        lCx[i] + lCwidth[i] > playerX - playerWidth / 2 - distanceToWall + scroll &&
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
            "this is unused right now",
            "collision",
            true
          );
          deleteCollision(i);
        }
        playerY = playerY + pyV;
        pyV = 0;
      }
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
      "[COLLISION] deleted id: " + id + " out of a total of: " + lCtotal
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
    if (_namespace == "collision") {
      _blockWidth = lCwidth[_op1];
      _blockHeight = lCheight[_op1];
      _blockx = lCx[_op1] / _blockHeight;
      _blocky = lCy[_op1] / _blockWidth;
    }

    if (_destroy == true) {
      //console.log(curLevel);
      console.log("broke blockx: " + _blockx + " and blocky: " + _blocky);
      var _lengthBackup = curLevel[_blocky];
      var _curStripEdit = curLevel[_blocky].split(".");

      createHitAnimation(lCx[_op1], lCy[_op1], _curStripEdit[_blockx], frame);
      _curStripEdit[_blockx] = "0";
      var _recompiled = "";
      for (var i = 0; i < _lengthBackup.length; i++) {
        _recompiled += _curStripEdit[i] + ".";
      }
      _recompiled = _recompiled.substring(0, _lengthBackup.length);
      curLevel[_blocky] = _recompiled;
    } else { }
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
            "this is unused right now",
            "collision",
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
    starx[i] = randNum(0, levelLength * 10 / starSkyFactor);
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
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success) success(JSON.parse(xhr.responseText));
      } else {
        if (error) error(xhr);
      }
    }
  };
  xhr.open("GET", path, true);
  xhr.send();
}

function drawStart() {
  setTimeout(function () {
    requestAnimationFrame(drawStart);

    draw();

  }, 1000 / fps);
}