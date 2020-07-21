var c = document.getElementById('simCanvas');
var ctx = c.getContext('2d');

var deviceWidth = window.innerWidth;
var deviceHeight = window.innerHeight;
var nativeWidth = 1600;
var nativeHeight = 900;
var scaleFillNative = Math.max(deviceWidth / nativeWidth, deviceHeight / nativeHeight);
console.log(scaleFillNative);
c.style.width = (deviceWidth - 5) + "px";
c.style.height = (deviceHeight - 5) + "px";
c.width = deviceWidth - 5;
c.height = deviceHeight - 5;
ctx.setTransform(scaleFillNative, 0, 0, deviceHeight / nativeHeight, 0, 0);

var basePath = '';
var baseModule = 'simplat';
var moduleName = '';
var blankTexture = '';
var modOverwrite = '';
var staryNightHex = '#00033a';
var canvasFont = '30px monospace';

////////// IMPORTANT RAW JSON FOR LEVELS ////////////////

var smb11 = 'https://raw.githubusercontent.com/rokie95/simplat_web/master/smb11.json';
//var rbdebug = 'https://api.jsonbin.io/b/5b74f465e013915146d53073';

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
var curLevelName = "";
var prefs = {};
var levels = {};
var textures = {};
var allLevelDataJSON = {};

//game
var frame = 0;
var slideshowFrame = 0;
var slideshowSaveType = "coordinates"; //options are "wholescreen" and "coordinates"
var slideshowPlaybackSpeed = 1;
var slideshowPlaybackMultiplier = 2;
var slideshow = [];
var fps = 45;
var pixSize = 2;
var unknownColor = 0;
var runGame = true;
var imageBuffer = [];
var curImg = 0;
var lastRunGame = true;
var customCommands = "";

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
var player = {
    "x": 30.0,
    "y": 10000.0,
    "blockX": 0,
    "blockY": 0,
    "width": 50,
    "height": 80,
    "defHeight": 10,
    "defWidth": 10,
    "jumpHeight": 100,
    "crouching": false,
    "rightPressed": false
};

//player physics
var pxV = 0.0,
    pfaster = false,
    fastFrameStart = 0,
    pyV = 0.0,
    pfriction = 0.6,
    pgravity = 1.3,
    pspeed = 2,
    defaultpspeed = 10,
    pjumping = false,
    canMoveRight = true,
    canMoveLeft = true;

var enemies = [],
    enemiestotal = 0,
    startingEnemies = [];

var pointx = 100,
    pointy = 100,
    blockHitParticles = [];

console.log('hello world, variables set');

function preload() {
    var toLoad = smb11;

    if (smb11.substr(0, 3) == "http") {
        loadLocal = true;
    } else {
        loadLocal = false;
    }

    if (loadLocal) {

        loadJSON(toLoad, function (data) {
            console.log(data);
            var dataJson = JSON.parse(data);
            levels = data.levels;
            textures = data.textures;

            finishedLoading();
        });

    } else {
        var urlURL = window.location.href.split('#')[1];

        var loadURL = toLoad;

        if (urlURL != undefined) {
            loadURL = urlURL;
        }

        if (modOverwrite != '') {
            loadURL = modOverwrite;
        }

        var totalModuleLoad = {};
        totalModuleLoad = getUrlJSON(loadURL, function (levelCall, textureCall) {
            console.log('level loaded');
            //console.log(levelCall);

            console.log('textures loaded: ');
            //console.log(textureCall);

            levels = levelCall;
            textures = textureCall;

            finishedLoading();
        });
    }
}

function finishedLoading() {
    //level and textures loaded
    firstRun = true;
    setup();
}

function reloadWURL(newURL) {
    modOverwrite = newURL;
    preload();
}

document.addEventListener('keydown', function (event) {
    keys[event.keyCode] = true;
    //console.log(event.key + "   code: " + event.keyCode);
});
document.addEventListener('keyup', function (event) {
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

    //console.log(levels);
    //console.log(textures);
    keys[220] = false;
    pixSize = 8.5;

    // try {
    //     pixSize = c.height / levels['level1'].split('%').length / textures.textureSize;
    // } catch (err) {
    //     pixSize = 2;
    //     console.warn("UNABLE TO DETECT LEVEL HEIGHT");
    //     console.warn("something has gone horribly wrong");
    // }

    player.defHeight = 7 * pixSize;
    player.defWidth = 5 * pixSize;

    player.jumpHeight = 26;
    defaultpspeed = pixSize * 1.31;
    pspeed = defaultpspeed * 2;
    console.log("pixSize auto set to: " + pixSize);
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
    try {
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

        player.x = 200.0;
        player.y = 0;

        curLevelName = levelName;
    } catch (err) {
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("level cannot be loaded or collision could not be created");
        console.error("if you ever report this issue make sure to add the json file used");
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        throw new Error(err);
    }
}

function makeCollision() {

    var colCount = 0;
    var levelStrip = [];

    for (var i = 0; i < curLevel.length; i++) {
        levelStrip = curLevel[i];
        levelStrip = levelStrip.split('.');

        for (var j = 0; j < levelStrip.length; j++) {
            //isSolid(levelStrip[j])

            var blockDelta = texturePixSize;

            if (isSolid(levelStrip[j])) {

                lCx[colCount] = j * blockDelta;
                lCy[colCount] = i * blockDelta;
                lCwidth[colCount] = blockDelta;
                lCheight[colCount] = blockDelta;
                lCid[colCount] = levelStrip[j];
                colCount++;

            }

            if (canHurt(levelStrip[j])) {
                enemies[enemiestotal] = new Enemy(j * blockDelta, i * blockDelta, blockDelta - 2, blockDelta - 2, levelStrip[j]);
                enemiestotal++;

                createBlock(j, i, 0, false);
            }
        }
    }

    startingEnemies = enemies;

    console.log('total collision boxes: ' + colCount);
    lCtotal = colCount;
}

function draw() {

    //c.width = window.innerWidth - 7;
    //c.height = window.innerHeight - 5;

    player.blockX = Math.round((player.x - scroll) / texturePixSize);
    player.blockY = Math.round((player.y) / texturePixSize);

    if (pxV < 0.000001) {
        pxV = 0;
    }

    unknownColor++;
    if (unknownColor > 255) {
        unknownColor = 0;
    }

    player.width = player.defWidth;

    scrollBlock = ((scroll * -1) / texturePixSize) * -1;

    if (frame % 15 == 0) {
        if (flickerTimer) {
            flickerTimer = false;
        } else {
            flickerTimer = true;
        }
    }

    handleKeys();

    for (var i = 0; i < 10; i++) {
        calculateCollision();
        calculatePlayerVelocity(10);
    }
    pxV = pxV * (pfriction);

    if (checkFloorCollision()) {
        player.y = player.y - pyV;
        pyV = 0;
        jumping = false;
    } else {
        pyV += pgravity;
        jumping = true;
    }

    drawLevel();
    drawPlayer(player.x, player.y - player.height - pixSize, 0);

    //drawTexture(0, 0, 876, "2.3.1.1.2.3.3.3.2.3.1.1.2.3.1.1", 4);

    for (var s = 0; s < enemiestotal; s++) {
        enemies[s].tick();
        enemies[s].render();
    }

    for (var a = 0; a < blockHitParticles.length; a++) {
        blockHitParticles[a].tick();
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
        drawReticle(player.x, player.y);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        drawReticle(player.x, player.y - player.height);
        drawReticle(player.x - player.width / 2, player.y);
        drawReticle(player.x + player.width / 2, player.y);

        for (var q = 0; q < lCx.length; q++) {
            ctx.strokeStyle = "#0000FF";
            ctx.lineWidth = 5;
            ctx.strokeRect(lCx[q] - scroll, lCy[q], lCwidth[q], lCheight[q]);

        }
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;

        ctx.font = "20px monospace";

        ctx.strokeRect(
            player.x - player.width / 2,
            player.y - player.height,
            player.width,
            player.height
        );

        ctx.fillText("player x: " + Math.round(player.x), 0, 20);
        ctx.fillText("player y: " + Math.round(player.y), 0, 40);
        ctx.fillText("player xV: " + pxV, 0, 60);
        ctx.fillText("player yV: " + Math.round(pyV), 0, 80);
        ctx.fillText("player block x: " + player.blockX, 0, 100);
        ctx.fillText("player block y: " + player.blockY, 0, 120);
        ctx.fillText("scroll: " + scroll, 0, 140);
        ctx.fillText("pfaster: " + pfaster, 0, 160);
        ctx.fillText("jumping: " + jumping, 0, 180);

        // ctx.fillText("X:" + pointx + " Y:" + pointy, pointx, pointy);
        // ctx.strokeRect(pointx, pointy, textures.textureSize * pixSize, 1);

        ctx.font = canvasFont;
    }

    var scrollLine = (c.width / scaleFillNative) * 6 / 10;

    if (pxV >= 6 && !pfaster) {
        pfaster = true;
        fastFrameStart = frame;
    }

    if (pxV < 6 || !player.rightPressed) {
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
        if (player.x + player.width < lCx[i] && player.x + player.width > lCx[i] + pixSize * textures.textureSize) {
            blocksInFront++;
        }
    }

    //console.log(blocksInFront);

    if (player.x > scrollLine && blocksInFront === 0) {
        if (player.rightPressed) {
            scroll += pxV + 5;
            player.x = scrollLine;
        } else if (Math.round(pxV) == 0) {
            pxV = 0;
        }
    }

    if (player.x < 65) {
        player.x = 65;
    }

    if (player.y > curLevel.length * textures.textureSize * pixSize) {
        if (!debug) {
            pyV = 0;
        }
        player.y = 0;

        if (player.x < 0) {
            player.x = 300;
        }
    }
    frame++;
    animationTick();


}

function createBlock(x, y, type, remakeCollision) {
    if (x == "self") {
        x = player.blockX;
    }
    if (y == "self") {
        y = player.blockY;
    }

    var rawLevelStrip = curLevel[y].split(".");
    rawLevelStrip[x] = type;
    curLevel[y] = rawLevelStrip.join(".");

    //console.log("changed block at " + x + "," + y + " to " + type + " with remakeCollision: " + remakeCollision);
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

    var levelList = Object.keys(levels);

    if (levels[levelList.indexOf(curLevelName) + 1] == undefined) {
        console.log("end of levelpack");
    } else {
        loadLevel(levelList[levelList.indexOf(curLevelName) + 1]);
    }

}

function youDied() {
    if (!debug) {
        scroll = 0;
        player.x = 100;
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

function calculatePlayerVelocity(loops) {

    player.y = player.y + (pyV / loops);

    player.x = player.x + (pxV / loops);

}

function checkFloorCollision() {
    for (var i = 0; i < lCy.length; i++) {
        if (
            lCy[i] <= player.y &&
            lCy[i] + lCheight[i] > player.y &&
            lCx[i] < player.x + player.width / 2 + scroll &&
            lCx[i] + lCwidth[i] > player.x - player.width / 2 + scroll
        ) {
            return true;
        }
    }
    return false;
}

function calculateCollision() {
    //wall collision detection
    //use canMoveRight and canMoveLeft to restrict movement
    var distanceToWall = 7;
    var despawnRadius = 200;

    for (var i = 0; i < lCy.length; i++) {
        if (pxV > 0) {
            //moving right
            canMoveLeft = true;
            if (
                player.x + scroll + 5 + despawnRadius > lCx[i] &&
                player.x + scroll - 5 - despawnRadius < lCx[i] &&
                lCx[i] + lCwidth[i] > player.x + distanceToWall + scroll &&
                lCx[i] < player.x + player.width / 2 + distanceToWall + scroll &&
                player.y > lCy[i] &&
                player.y + player.height > lCy[i] + lCheight[i] + 1 &&
                player.y - player.height < lCy[i] + lCheight[i]
            ) {
                //player.x = player.x + -1*pxV; + scroll
                touchedCollision(i);

                pxV = 0;

                jumping = true;
                canMoveRight = false;
            }
        } else if (pxV < 0) {
            //moveing left
            canMoveRight = true;
            if (
                player.x + scroll + despawnRadius > lCx[i] &&
                player.x + scroll - despawnRadius < lCx[i] &&
                lCx[i] < player.x + scroll &&
                lCx[i] + lCwidth[i] >
                player.x - player.width / 2 - distanceToWall + scroll &&
                player.y - 1 > lCy[i] &&
                player.y + player.height > lCy[i] + lCheight[i] &&
                player.y - player.height < lCy[i] + lCheight[i]
            ) {
                //player.x = player.x + -1*pxV;
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
                player.x + scroll + despawnRadius > lCx[i] &&
                player.x + scroll - despawnRadius < lCx[i] &&
                lCy[i] + lCheight[i] < player.y + 1 &&
                lCy[i] + lCheight[i] > player.y - player.height &&
                lCx[i] < player.x + player.width / 2 + scroll &&
                lCx[i] + lCwidth[i] > player.x - player.width / 2 + scroll
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
                player.y = player.y - pyV;
                pyV = 0;
            }
        }

        if (
            player.x + scroll + despawnRadius > lCx[i] &&
            player.x + scroll - despawnRadius < lCx[i] &&
            lCx[i] < player.x + player.width / 2 + scroll &&
            lCx[i] + lCwidth[i] > player.x - player.width / 2 + scroll &&
            lCy[i] - lCheight[i] / 2 < player.y &&
            lCy[i] > player.y &&
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
        } else { }
    }

    function createHitAnimation(_x, _y, _id, _startFrame) {
        // blockHitX[blockHitTotal] = _x;
        // blockHitY[blockHitTotal] = _y;
        // blockHitId[blockHitTotal] = _id;
        // blockHitFrame[blockHitTotal] = _startFrame;
        // blockHitTotal++;

        console.log(getIdFromBlockPos(_x, _y));
        splitBlock(getIdFromBlockPos(_x, _y), _x, _y);

    }

}

function getIdFromBlockPos(x, y) {
    //console.log(arguments);
    x = Math.ceil(x / texturePixSize);
    y = Math.ceil(y / texturePixSize);
    var rawLevelStrip = curLevel[y].split(".");
    return rawLevelStrip[x];
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

function loadJSON(filename, datacallback) {
    var client = new XMLHttpRequest();
    client.open('GET', '/' + filename);
    client.onreadystatechange = function () {
        datacallback(client.responseText);
    }
    client.send();
}

function drawStart() {
    setTimeout(function () {
        if (runGame) {
            if (slideshowSaveType == "wholescreen") {
                imageBuffer[imageBuffer.length] = ctx.getImageData(0, 0, c.width, c.height);
            }

            if (slideshowSaveType == "coordinates") {
                slideshow[slideshow.length] = {
                    "playerx": player.x,
                    "playery": player.y,
                    "scroll": scroll,
                    "enemyList": []
                }

                for (var i = 0; i < enemies.length; i++) {
                    slideshow[slideshow.length - 1].enemyList[i] = Object.assign(Object.create(Object.getPrototypeOf(enemies[i])), enemies[i]);
                }
            }

            draw();

        } else {
            if (slideshowSaveType == "coordinates") {
                handleSlideshowKeys();

                if (curImg > slideshow.length - 1 || curImg < 0) {
                    curImg = 0;
                    enemies = startingEnemies;
                }

                console.log(curImg);
                scroll = slideshow[Math.round(curImg)].scroll;
                scrollBlock = ((scroll * -1) / texturePixSize) * -1;
                player.x = slideshow[Math.round(curImg)].playerx;
                player.y = slideshow[Math.round(curImg)].playery;
                scroll = slideshow[Math.round(curImg)].scroll;
                drawLevel();
                drawPlayer(player.x, player.y - player.height, 0);

                ctx.fillStyle = "#000000";
                ctx.font = "20px Monospace";
                ctx.fillText("slideshow speed: " + slideshowPlaybackSpeed, 0, 20);
                ctx.fillText("slideshow slide: " + Math.round(curImg) + "/" + slideshow.length, 0, 40);

                var enemySlideshow = slideshow[Math.round(curImg)].enemyList;
                for (var i = 0; i < enemySlideshow.length; i++) {
                    enemySlideshow[i].render();
                }

                //console.log(slideshow[curImg].enemyList[0]);

                curImg += slideshowPlaybackSpeed;

            }

            if (slideshowSaveType == "wholescreen") {
                ctx.putImageData(imageBuffer[curImg], 0, 0);

                curImg++;
                if (curImg == imageBuffer.length) {
                    curImg = 0;
                    enemies = startingEnemies;
                }
            }

            console.log(curImg);

            slideshowFrame++;
        }

        if (runGame == false && lastRunGame == true) {
            //the user just switched rungame to false
            curImg = 0;
            lastRunGame = false;
            //enemies = startingEnemies;
            console.warn("started slideshow");
            //loadLevel("level1");
        }

        if (runGame == true && lastRunGame == false) {
            //the user just switched rungame to true
            lastRunGame = true;
        }

        requestAnimationFrame(drawStart);

    }, 1000 / fps);
}

function getUrlJSON(yourUrl, success) {
    var request = new XMLHttpRequest();
    request.open('GET', yourUrl, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);
            console.log('got textures and levels');
            //console.log(data);

            success(data['levels'], data['textures']);
        } else {
            // We reached our target server, but it returned an error
            console.log('target reached but failed loading');
        }
    };

    request.onerror = function () {
        console.log('error loading');
    };

    request.send();
}

function randNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
