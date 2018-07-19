var c = document.getElementById('simCanvas');
var ctx = c.getContext('2d');
ctx.font = '30px Verdana';

var basePath = '';
var baseModule = 'simplat'
var moduleName = '';

var drawpspeed = 10;
var loadedFiles = 0;
var totalFiles = 2;
var imagesLoaded = 0;
var pixSize = 10;
var tileWidth = 0;
var tileHeight = 0;
var scroll = 0;
var pspeed = 10;

var firstRun = false;
var prefLoaded = false;
var levelsLoaded = false;

var keys = [];
var tiles = [];
var curLevel = [];

var prefs = {};
var levels = {};
var textures = {};
var allLevelDataJSON = {};

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
    playerJumpHeight = 20;

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
    pointy = 100;

c.width = window.innerWidth - 7;
c.height = window.innerHeight - 5;

console.log('hello world, variables set');


function preload() {

    preLoadStart();

    function preLoadStart() {
        if (firstRun === false) {
            var drawTimeout = setTimeout(preLoadLoop, 200);
        }

        function preLoadLoop() {
            //first load prefs
            console.log('getting levels');

            loadJSON('data/' + baseModule + '/levels.json',
                function (data) {
                    if (!prefLoaded) {
                        levels = data;
                        prefLoaded = true;
                        loadedFiles++;
                        //console.log(loadedFiles);
                    }
                },
                function (xhr) { }
            );

            console.log('getting textures');
            //load levels json from the module name specified in the prefs file

            loadJSON('data/' + baseModule + '/textures.json',
                function (data) {
                    if (!levelsLoaded) {
                        textures = data;
                        levelsLoaded = true;
                        //console.log(loadedFiles);
                    }
                },
                function (xhr) { }
            );

            if (levelsLoaded && prefLoaded) {
                firstRun = true;
                setup();
            } else if (loadedFiles < totalFiles) {
                preLoadStart();
            }


        }
    }
}

document.addEventListener('keydown', function (event) {
    keys[event.keyCode] = true;
    console.log(event.key + '   code: ' + event.keyCode);
});
document.addEventListener('keyup', function (event) {
    keys[event.keyCode] = false;
});

console.log('added key listener');

// start setup

function setup() {

    console.log(levels);
    console.log(textures);

    loadLevel('level1');

    //pixSize = c.height/curLevel.length/textures.textureSize;
    pixSize = 10;
    pspeed = 10;
    console.log(pixSize);
}

function loadLevel(levelName) {
    curLevel = levels[levelName].split('%');
    createCollision();

    playerX = 960.0;
    playerY = 0;
}

function createCollision() {
    var colCount = 0;

    var levelStrip = [];

    for (var i = 0; i < curLevel.length; i++) {
        levelStrip = curLevel[i];

        for (var j = 0; j < levelLength; j++) {
            if (levelStrip[j] == '1') {
                lCx[colCount] = j * textures.textureSize * pixSize / 2;
                lCy[colCount] = i * textures.textureSize * pixSize;
                lCwidth[colCount] = textures.textureSize * pixSize;
                lCheight[colCount] = textures.textureSize * pixSize;

                colCount++;
            }
        }
    }

    console.log('collision boxes: ' + colCount);
    lCtotal = colCount;
}

function draw() {

    handleKeys();

    calculateCollision();

    drawLevel();
    drawPlayer(playerX, playerY - 80, 0);

    drawCollision();
    drawReticle(playerX, playerY);
    drawReticle(playerX - playerWidth / 2, playerY);
    drawReticle(playerX + playerWidth / 2, playerY);

    ctx.strokeRect(playerX - 25, playerY - 80, playerWidth, playerHeight);
    ctx.fillText('X: ' + Math.round(playerX) + ' Y: ' + playerY, playerX - 25, playerY - 90);

    ctx.fillText('player x: ' + playerX, 0, 10);
    ctx.fillText('player y: ' + playerY, 0, 20);
    ctx.fillText('player xV: ' + pxV, 0, 30);
    ctx.fillText('player yV: ' + pyV, 0, 40);

    ctx.fillText('X:' + pointx + ' Y:' + pointy, pointx, pointy);
    ctx.strokeRect(pointx, pointy, textures.textureSize * pixSize, 1);

    if(playerY > 5000) {
        pyV = 0;
        playerY = 0;        
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

function drawCollision() {
    for (var i = 0; i < lCtotal; i++) {
        ctx.strokeRect(lCx[i], lCy[i], lCwidth[i], lCheight[i]);
        ctx.fillText('x: ' + lCx[i] + ' y: ' + lCy[i], lCx[i], lCy[i] + 10);

        drawReticle(lCx[i], lCy[i])
    }
}

function handleKeys() {

    var pointpspeed = 1;

    if (keys[40]) {
        //down arrow
        pointy -= pointpspeed;
    }

    if (keys[39] && canMoveRight) {
        //right arrow
        pxV = pspeed;
        pointx += pointpspeed;
    }

    if (keys[38]) {
        //up arrow
        if (!jumping) {
            pyV = -1 * playerJumpHeight;
            pointy += pointpspeed;
            jumping = true;
        }
    }

    if (keys[37] && canMoveLeft) {
        //left arrow
        pxV = -1 * pspeed;
        pointx -= pointpspeed;
    }
}

function calculateCollision() {
    playerY = playerY + pyV;

    //wall collision detection
    //use canMoveRight and canMoveLeft to restrict movement
    var distanceToWall = 10;

    for (var i = 0; i < lCy.length; i++) {
        if (pxV > 0) {
            canMoveLeft = true;
            if (lCx[i] + lCwidth[i] > playerX+distanceToWall && lCx[i] < playerX + playerWidth / 2 + distanceToWall &&
                playerY-1 > lCy[i] && playerY + playerHeight > lCy[i] + lCheight[i]) {

                //playerX = playerX + -1*pxV;
                pxV = 0;
                jumping = true;
                canMoveRight = false;
            }
        } else if(pxV < 0) {
            canMoveRight = true;
            if (lCx[i] < playerX && lCx[i] + lCwidth[i] > playerX - playerWidth / 2 - distanceToWall &&
                playerY-1 > lCy[i] && playerY + playerHeight > lCy[i] + lCheight[i]) {

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

    playerX = playerX + pxV;
    pxV = pxV * pfriction;

    //ground collision detection
    function onFloorCollision() {
        for (var i = 0; i < lCy.length; i++) {

            if (lCy[i] < playerY && lCy[i] + lCheight[i] > playerY &&
                lCx[i] < playerX + playerWidth / 2 &&
                lCx[i] + lCwidth[i] > playerX - playerWidth / 2) {
                return true;
            }
        }

        return false;
    }

    if (onFloorCollision()) {
        playerY = playerY - pyV;
        pyV = 0;
        jumping = false;
    } else {
        pyV += pgravity;
        jumping = true;
    }



}

function drawPlayer(_px, _py, _pid) {
    if (_pid === 0) {
        var playerTexDataRaw = '0.0.0.0.1.0.0.1.1.1.1.0.1.0.1.0.1.0.1.1.1.1.0.0.1.1.1.0.1.0.1.0.0.0.0.0.1.0.0.1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0'; //0.0.0.0 data kind of stuff here
        var playerTexData = playerTexDataRaw.split('.');
        var playerTexSize = 8;
        var playerPixSize = 10;
        var playerColorIndex = {
            '0': 'alpha',
            '1': '#000000'
        };
        _px -= 25;
        //console.log(texData);

        //ctx.strokeRect(_px, _py, playerPixSize * playerPixSize, playerPixSize * playerPixSize);

        for (var i = 0; i < playerTexSize; i++) {
            for (var j = 0; j < playerTexSize; j++) {

                if (playerColorIndex[playerTexData[j + playerTexSize * i]] == 'alpha') {
                    //ctx.fillStyle = textures.background;
                } else {
                    ctx.fillStyle = playerColorIndex[playerTexData[j + playerTexSize * i]];

                    ctx.fillRect(i * playerPixSize + _px, j * playerPixSize + _py, playerPixSize, playerPixSize);
                    //ctx.strokeRect(i * playerPixSize + _px, j * playerPixSize + _py, playerPixSize, playerPixSize);
                }

            }
        }
    }
}

function drawLevel() {
    drawBackground();

    for (var i = 0; i < curLevel.length; i++) {
        var renderStrip = curLevel[i].split('.');

        for (var j = 0; j < renderStrip.length; j++) {
            //console.log(renderStrip[j]);
            drawTexture(j * pixSize * textures.textureSize + scroll * -1,
                i * pixSize * textures.textureSize,
                renderStrip[j]);

        }
    }
}

function drawBackground() {

    for (var i = 0; i < c.width / pixSize; i++) {
        for (var j = 0; j < c.height / pixSize; j++) {

            if (j % 2 == 0) {
                ctx.fillStyle = '#d6d6d6';
            } else {
                ctx.fillStyle = '#515151';
            }

            ctx.fillRect(i * pixSize, j * pixSize, pixSize, pixSize);
        }

    }

}

function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open('GET', path, true);
    xhr.send();
}

drawStart();

function drawStart() {
    var drawTimeout = setTimeout(drawLoop, drawpspeed);

    function drawLoop() {

        draw();
        drawStart();

    }
}

function drawTexture(x, y, textureID) {
    var texDataRaw = textures.textureData[textureID];
    var texData = texDataRaw.split('.');
    //console.log(texData);

    for (var i = 0; i < textures.textureSize; i++) {
        for (var j = 0; j < textures.textureSize; j++) {

            if (textures.colorIndex[texData[j + textures.textureSize * i]] == 'alpha') {
                ctx.fillStyle = textures.background;
            } else {
                ctx.fillStyle = textures.colorIndex[texData[j + textures.textureSize * i]];
            }

            ctx.fillRect(i * pixSize + x, j * pixSize + y, pixSize, pixSize);
            //ctx.strokeRect(i * pixSize + x, j * pixSize + y, pixSize, pixSize);

        }
    }

}
