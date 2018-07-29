var c = document.getElementById("simCanvas");
var ctx = c.getContext("2d");

var basePath = "";
var baseModule = "simplat";
var moduleName = "";
var blankTexture = "";
var staryNightHex = "#00033a";

var drawpspeed = 10;
var loadedFiles = 0;
var totalFiles = 2;
var imagesLoaded = 0;
var pixSize = 10;
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

//level collision
var lCx = [],
  lCy = [],
  lCwidth = [],
  lCheight = [],
  levelLength = 1000,
  lCtotal = 0;

//player declarations
var playerX = 30.0,
  playerY = 10000.0,
  playerWidth = 50,
  playerHeight = 80,
  playerJumpHeight = 20,
  playerCrouching = false;

//player physics
var pxV = 0.0,
  pyV = 0.0,
  pfriction = 0.6,
  pgravity = 1,
  pspeed = 2,
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
        function(data) {
          if (!prefLoaded) {
            levels = data;
            prefLoaded = true;
            loadedFiles++;
            //console.log(loadedFiles);
          }
        },
        function(xhr) {
          failedGets++;
        }
      );

      console.log("getting textures");
      //load levels json from the module name specified in the prefs file

      loadJSON(
        "data/" + baseModule + "/textures.json",
        function(data) {
          if (!levelsLoaded) {
            textures = data;
            levelsLoaded = true;
            //console.log(loadedFiles);
          }
        },
        function(xhr) {
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
        firstRun = true;
        setup();
        drawStart();
      } else if (loadedFiles < totalFiles) {
        preLoadStart();
      }
    }
  }
}

document.addEventListener("keydown", function(event) {
  keys[event.keyCode] = true;
  console.log(event.key + "   code: " + event.keyCode);
});
document.addEventListener("keyup", function(event) {
  keys[event.keyCode] = false;
});

console.log("added key listener");

// start setup

function setup() {
  console.log(levels);
  console.log(textures);

  loadLevel("level1");

  //pixSize = c.height/curLevel.length/textures.textureSize;
  pixSize = 10;
  pspeed = 10;
  console.log(pixSize);
  texturePixSize = pixSize * textures.textureSize;

  for (var i = 0; i < textures.textureSize * textures.textureSize; i++) {
    blankTexture += "0.";
  }
  blankTexture = blankTexture.substring(0, blankTexture.length - 1);

  levelBlockLength = curLevel[0].split(".") * texturePixSize;
}

function loadLevel(levelName) {
  curLevel = levels[levelName].split("%");

  if (levels[levelName + "-metadata"] != undefined) {
    curLevelMeta = levels[levelName + "-metadata"];
    levelMetaExists = true;
    console.log("level metadata: ");
    console.log(curLevelMeta);
  }

  createCollision();
  makeStars();

  playerX = 200.0;
  playerY = 0;
}

function createCollision() {
  var colCount = 0;
  var levelStrip = [];

  for (var i = 0; i < curLevel.length; i++) {
    levelStrip = curLevel[i];

    for (var j = 0; j < levelLength; j++) {
      if (levelStrip[j] == "1") {
        lCx[colCount] = (j * textures.textureSize * pixSize) / 2;
        lCy[colCount] = i * textures.textureSize * pixSize;
        lCwidth[colCount] = textures.textureSize * pixSize;
        lCheight[colCount] = textures.textureSize * pixSize;

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

  scrollBlock = ((scroll * -1) / texturePixSize) * -1;

  handleKeys();

  calculateCollision();

  drawLevel();
  drawPlayer(playerX, playerY - 80, 0);

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
    "X: " + Math.round(playerX) + " Y: " + playerY,
    playerX - 25,
    playerY - 90
  );

  ctx.fillText("player x: " + playerX, 0, 10);
  ctx.fillText("player y: " + playerY, 0, 20);
  ctx.fillText("player xV: " + pxV, 0, 30);
  ctx.fillText("player yV: " + pyV, 0, 40);

  ctx.fillText("X:" + pointx + " Y:" + pointy, pointx, pointy);
  ctx.strokeRect(pointx, pointy, textures.textureSize * pixSize, 1);

  if (playerY > 5000) {
    pyV = 0;
    playerY = 0;
  }
  frame++;
  animationTick();
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

function calculateCollision() {
  playerY = playerY + pyV;

  //wall collision detection
  //use canMoveRight and canMoveLeft to restrict movement
  var distanceToWall = 10;

  for (var i = 0; i < lCy.length; i++) {
    if (pxV > 0) {
      canMoveLeft = true;
      if (
        lCx[i] + lCwidth[i] > playerX + distanceToWall &&
        lCx[i] < playerX + playerWidth / 2 + distanceToWall &&
        playerY - 1 > lCy[i] &&
        playerY + playerHeight > lCy[i] + lCheight[i] &&
        playerY - playerHeight < lCy[i] + lCheight[i]
      ) {
        //playerX = playerX + -1*pxV; + scroll
        pxV = 0;
        jumping = true;
        canMoveRight = false;
      }
    } else if (pxV < 0) {
      canMoveRight = true;
      if (
        lCx[i] < playerX &&
        lCx[i] + lCwidth[i] > playerX - playerWidth / 2 - distanceToWall &&
        playerY - 1 > lCy[i] &&
        playerY + playerHeight > lCy[i] + lCheight[i] &&
        playerY - playerHeight < lCy[i] + lCheight[i]
      ) {
        //playerX = playerX + -1*pxV;
        pxV = 0;
        jumping = true;
        canMoveLeft = false;
      }
    } else {
      canMoveRight = true;
      canMoveLeft = true;
    }
  }

  for (var i = 0; i < lCy.length; i++) {
    if (pyV < -2) {
      if (
        lCy[i] + lCheight[i] < playerY + 1 &&
        lCy[i] + lCheight[i] > playerY - playerHeight &&
        lCx[i] < playerX + playerWidth / 2 &&
        lCx[i] + lCwidth[i] > playerX - playerWidth / 2
      ) {
        blockHitUnder(
          lCx[i],
          lCy[i],
          i,
          "this is unused right now",
          "collision",
          true
        );
        deleteCollision(i);

        playerY = playerY - pyV;
        pyV = 0;
      }
    }
  }

  function deleteCollision(id) {
    console.log(
      "[COLLISION] deleted id: " + id + " out of a total of: " + lCtotal
    );
    console.log(lCx);
    for (var i = 0; i < lCtotal - id; i++) {
      lCx[id + i] = lCx[id + 1 + i];
      lCy[id + i] = lCy[id + 1 + i];
      lCwidth[id + i] = lCwidth[id + 1 + i];
      lCheight[id + i] = lCheight[id + 1 + i];
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
    } else {
    }
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
        lCx[i] < playerX + playerWidth / 2 &&
        lCx[i] + lCwidth[i] > playerX - playerWidth / 2
      ) {
        if (pyV > 20 && playerCrouching) {
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
  xhr.onreadystatechange = function() {
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
    var drawTimeout = setTimeout(drawLoop, drawpspeed);
  
    function drawLoop() {
      draw();
      drawStart();
    }
  }