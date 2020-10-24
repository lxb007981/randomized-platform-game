// The point and size class used in this program
class Point {
    constructor(x, y) {
        this.x = (x) ? parseFloat(x) : 0.0;
        this.y = (y) ? parseFloat(y) : 0.0;
    }
}

class Size {
    constructor(w, h) {
        this.w = (w) ? parseFloat(w) : 0.0;
        this.h = (h) ? parseFloat(h) : 0.0;
    }
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
        pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}

class NameBox {
    constructor() {
        this.node = document.getElementById("nameBox");
        this.playerName = null;
    }
}
class Bullet {
    constructor() {
        this.node;
        this.faceRight; //true 
    }
}
class MonsterBullet extends Bullet {
    constructor() {
        super();
        this.exsistence = true;
    }
}

function isOnParticularPlatform(playerX, playerY, platformX, platformY, platformW, motion) {
    return (((playerX + PLAYER_SIZE.w > platformX && playerX < platformX + platformW) ||
        ((playerX + PLAYER_SIZE.w) == platformX && motion == motionType.RIGHT) ||
        (playerX == (platformX + platformW) && motion == motionType.LEFT)) &&
        playerY + PLAYER_SIZE.h == platformY);
}
// The player class used in this program
class Player {
    constructor() {
        this.node = document.getElementById("player");
        this.position = PLAYER_INIT_POS;
        this.motion = motionType.NONE;
        this.verticalSpeed = 0;
        this.faceRight = true;
    }
    isOnPlatform() {
        for (let i = 0; i < platforms.childNodes.length; i++) {
            let node = platforms.childNodes.item(i);
            if (node.nodeName != "rect")
                continue;

            let x = parseFloat(node.getAttribute("x"));
            let y = parseFloat(node.getAttribute("y"));
            let w = parseFloat(node.getAttribute("width"));
            let h = parseFloat(node.getAttribute("height"));

            if (isOnParticularPlatform(this.position.x, this.position.y, x, y, w, this.motion))
                return true;
        }
        if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h)
            return true;

        return false;
    }
    collidePlatform(position) {
        for (let i = 0; i < platforms.childNodes.length; i++) {
            let node = platforms.childNodes.item(i);
            if (node.nodeName != "rect")
                continue;

            let x = parseFloat(node.getAttribute("x"));
            let y = parseFloat(node.getAttribute("y"));
            let w = parseFloat(node.getAttribute("width"));
            let h = parseFloat(node.getAttribute("height"));
            let pos = new Point(x, y);
            let size = new Size(w, h);

            if (intersect(position, PLAYER_SIZE, pos, size)) {
                position.x = this.position.x;
                if (intersect(position, PLAYER_SIZE, pos, size)) {
                    if (this.position.y >= y + h)
                        position.y = y + h;

                    else
                        position.y = y - PLAYER_SIZE.h;
                    this.verticalSpeed = 0;
                }
            }
        }
    }
    collideScreen(position) {
        if (position.x < 0)
            position.x = 0;
        if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w)
            position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
        if (position.y < 0) {
            position.y = 0;
            this.verticalSpeed = 0;
        }
        if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
            position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
            this.verticalSpeed = 0;
        }
    }
}
class Portal {
    constructor(pos, rom, faceRight) {
        this.position = pos;
        this.regionOfMovement = rom;
        this.faceRight = faceRight;
    }
}
class Gate {
    constructor(node, pos) {
        this.node = node;
        this.position = pos;
        this.isOpen = false;
    }
}
class Platform {
    constructor(node, pos, size) {
        this.node = node;
        this.position = pos;
        this.size = size;
        this.width = this.size.w;
    }
}
class DisappearingPlatform {
    constructor(node, pos, size) {
        this.node = node;
        this.position = pos;
        this.size = size;
        this.width = this.size.w;
    }
}
class VerticalPlatform {
    constructor(node, pos, size, yDown, yUp) {
        this.node = node;
        this.position = pos;
        this.size = size;
        this.yDown = yDown;
        this.yUp = yUp;
        this.moveUp = true;
        this.canMove = true;
        this.width = this.size.w;
    }
}
class GoodThing {
    constructor(node, pos) {
        this.node = node;
        this.position = pos;
    }
}
class Monster {
    constructor(node, pos, motion, region) {
        this.node = node;
        this.position = pos;
        this.motion = motion;
        this.regionOfMovement = region;
    }
    isMonsterCollidePlatform(monsterPos) {
        for (let i = 0; i < platforms.childNodes.length; i++) {
            let node = platforms.childNodes.item(i);
            if (node.nodeName != "rect")
                continue;
            let platformX = parseFloat(node.getAttribute("x"));
            let platformY = parseFloat(node.getAttribute("y"));
            let platformW = parseFloat(node.getAttribute("width"));
            let platformH = parseFloat(node.getAttribute("height"));
            let platformPos = new Point(platformX, platformY);
            let platformSize = new Size(platformW, platformH);

            if (intersect(monsterPos, MONSTER_SIZE, platformPos, platformSize)) {
                let newX = null;
                if (monsterPos.x + MONSTER_SIZE.w / 2 > platformPos.x + platformSize.w / 2) {
                    newX = platformPos.x + platformSize.w + 1;
                }
                else {
                    newX = platformPos.x - MONSTER_SIZE.w - 1;
                }
                let transformString = "translate(" + newX + "," + monsterPos.y + ")";
                this.node.setAttribute("transform", transformString);
                this.position = new Point(newX, monsterPos.y);
                if (this.motion == motionType.LEFT) {
                    transformString += "translate(" + MONSTER_SIZE.w + ", 0) scale(-1, 1)";
                }
                return true;
            }
        }
        return false;
    }
    isMonsterCollideMonster(monsterPos) {//is given pos monsterPos collide with other monster in monsterClass?
        for (let i = 0; i < monsterClass.length; i++) {
            if (monsterClass[i] == this) {
                continue;
            }
            let monsterPos2 = monsterClass[i].position;
            if (intersect(monsterPos, MONSTER_SIZE, monsterPos2, MONSTER_SIZE)) {
                return true;
            }
        }
        return false;
    }

}

class MonsterKing extends Monster {
    constructor(node, pos, motion, region) {
        super(node, pos, motion, region);
        this.monsterKingCanShoot = true;
        this.exsistence = true;
    }
    shootBullet() {
        this.monsterKingCanShoot = false;
        setTimeout("monsterKing.monsterKingCanShoot = true", MONSTER_SHOOT_INTERVAL);
        // Create the bullet using the use node
        monsterBullet = new MonsterBullet();
        if (this.motion == motionType.RIGHT) {
            monsterBullet.faceRight = true;
        }
        else {
            monsterBullet.faceRight = false;
        }
        monsterBullet.node = document.createElementNS("http://www.w3.org/2000/svg", "use");
        monsterBullet.node.setAttribute("x", this.position.x + MONSTER_SIZE.w / 2 - BULLET_SIZE.w / 2);
        monsterBullet.node.setAttribute("y", this.position.y + MONSTER_SIZE.h / 2 - BULLET_SIZE.h / 2);
        monsterBullet.node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
        bulletsNodeSet.appendChild(monsterBullet.node);
    }
}

//
// Below are constants used in the game
//
var score = 0;                              // The score of the game
var PLAYER_SIZE = new Size(40, 44);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS = new Point(0, 420);   // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var MONSTER_SPEED = 1;
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10);         // The speed of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
//  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var MONSTER_SHOOT_INTERVAL = 2000.0;
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet
var NUM_ALL_MONSTERS = 7;
var MONSTER_SIZE = new Size(40, 40);        // The speed of a bullet
var NUM_GOOD_THING = 8;
var GOOD_THING_SIZE = new Size(30, 30);
var PORTAL_SIZE = new Size(34, 65);
var VERTICAL_MOVE_SPEED = 2;
var GATE_SIZE = new Size(44, 69);
var MAX_NUM_OF_PLATFORMS = 10;
var MAX_WIDTH_OF_PLATFORMS = 300;

//
// Variables in the game
//
var motionType = { NONE: 0, LEFT: 1, RIGHT: 2 }; // Motion enum

var player = null;                          // The player object
var gameInterval = null;                    // The interval
var timeInterval = null;                    // The interval
var nameBox = null;
var bulletsClass = [];
var monsterClass = [];
var goodThingClass = [];
var disappearingPlatformClass = [];
var platformClass = [];
var monsterBullet = null;
var monsterKing = null;
var verticalPlatform = null;
var portalPair = [];    // blue / red
var cheatEnabled = false;
var superCheatEnabled = false;
var shootSound = null;
var gameOverSound = null;
var monsterHitSound = null;
var goodThingSound = null;
var gateOpenSound = null;
var gate = null;
var svgdoc = null;
var inputName = null;

var platforms = null;
var bulletsNodeSet = null;
var gatesNodeSet = null;
var remainingTimeNodeSet = null;
var monsterNodeSet = null;
var portalNodeSet = null;
var remainingBulletsNodeSet = null;
var scoreNodeSet = null;
var goodThingNodeSet = null;
var currentLevelNodeSet = null;
var currentSeedNodeSet = null;
var startAgainFlag = false;
var playEndingMusicTimeout = null;

var seed = Math.floor(Math.random() * 10000000000000).toString();

function setSeedAndStart(evt) {
    while (true) {
        seed = prompt("Please enter your seed", "");
        if (seed != null && seed != "") {
            break;
        }
    }
    Math.seedrandom(seed);
    welcomeScreenLoad(evt);
}
// The load functions
//
function welcomeScreenLoad(event) {
    svgdoc = event.target.ownerDocument;
    let welcomeMusic = document.getElementById("welcomeMusic");
    welcomeMusic.volume = 0.5;
    welcomeMusic.play();
    let welcomeScreen = svgdoc.getElementById("welcomeScreen");
    welcomeScreen.setAttribute("style", "visibility: hidden");
    let introductionScreen = svgdoc.getElementById("introductionScreen");
    introductionScreen.setAttribute("style", "visibility: visible");
    shootSound = document.getElementById("shootSound");
    gameOverSound = document.getElementById("gameOverSound");
    monsterHitSound = document.getElementById("monsterHitSound");
    goodThingSound = document.getElementById("goodThingSound");
    gateOpenSound = document.getElementById("gateOpenSound");
    endingMusic = document.getElementById("endingMusic");
    bulletsNodeSet = document.getElementById("bullets");
    gatesNodeSet = document.getElementById("gates");
    remainingTimeNodeSet = document.getElementById("remainingTime");
    monsterNodeSet = document.getElementById("monsters");
    portalNodeSet = document.getElementById("portals");
    remainingBulletsNodeSet = document.getElementById("remainingBullets");
    goodThingNodeSet = document.getElementById("goodThings");
    scoreNodeSet = document.getElementById("score");
    currentLevelNodeSet = document.getElementById("currentLevel");
    currentSeedNodeSet = document.getElementById("currentSeed");

    platforms = document.getElementById("platforms");

}
function introductionScreenLoad() {
    let introductionScreen = svgdoc.getElementById("introductionScreen");
    introductionScreen.setAttribute("style", "visibility: hidden");
    let loadingScreen = svgdoc.getElementById("loadingScreen");
    loadingScreen.setAttribute("style", "visibility: visible");
    let gameScreen = svgdoc.getElementById("gameScreen");
    gameScreen.setAttribute("style", "visibility: hidden");


    regeneratePlatforms();
    loadGameFinish();
}
function startAgainWithSeed() {
    while (true) {
        seed = prompt("Please enter your seed", "");
        if (seed != null && seed != "") {
            break;
        }
    }
    Math.seedrandom(seed);
    startAgain();
}
function startAgain(randomStart) {
    clearTimeout(playEndingMusicTimeout);
    endingMusic.pause();
    endingMusic.currentTime = 0;
    startAgainFlag = true;
    let highScoreScreen = document.getElementById("highscoretable");
    highScoreScreen.style.setProperty("visibility", "hidden", null);
    document.getElementById("highscoretext").innerHTML = '';
    currentLevelNodeSet.innerHTML = 'Level:0';
    score = 0;
    verticalPlatform.node.parentNode.removeChild(verticalPlatform.node);
    for (let i = 0; i < disappearingPlatformClass.length; i++) {
        platforms.removeChild(disappearingPlatformClass[i].node);
    }
    let loadingScreen = svgdoc.getElementById("loadingScreen");
    loadingScreen.setAttribute("style", "visibility: visible");
    if (randomStart) {
        Math.seedrandom(new Date().toLocaleTimeString());
        seed = Math.random().toString();
    }
    Math.seedrandom(seed);
    regeneratePlatforms();
    loadGameFinish();
}
function findPlatformPosition() {
    while (true) {
        let found = true;
        let x = Math.floor(Math.random() * 600);
        let y = Math.floor(Math.random() * 560);
        let w = Math.floor(Math.random() * MAX_WIDTH_OF_PLATFORMS);
        if (w < 50 || x + w > 600 || y - 69 < 0) {
            continue;
        }
        let newPos = new Point(x, y);
        for (let i = 0; i < platformClass.length; i++) {
            let platform = platformClass[i];
            if (intersect(platform.position, new Size(platform.width, 20), newPos, new Size(w, 20))) {
                found = false;
                break;
            }
        }
        if (found) {
            return [newPos, w];
        }
    }
}
function createPlatform(position, width) {
    platformNode = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    // Set the various attributes of the line
    platformNode.setAttribute("x", position.x);
    platformNode.setAttribute("y", position.y);
    platformNode.setAttribute("width", width);
    platformNode.setAttribute("height", 20);
    platformNode.setAttribute("fill", "orange");
    platforms.appendChild(platformNode);
    let platformSize = new Size(width, 20);
    let platform = new Platform(platformNode, position, platformSize);
    platformClass.push(platform);
}
function regeneratePlatforms() {
    platforms.innerHTML = '';
    platformClass = [];
    createPlatform(new Point(0, 540), 600);
    let numOfPlatform = Math.max(Math.floor(Math.random() * MAX_NUM_OF_PLATFORMS), 8);
    for (let index = 0; index < numOfPlatform; index++) {
        let returnOfFind = findPlatformPosition();
        createPlatform(returnOfFind[0], returnOfFind[1]);
    }
}
function loadGameFinish() {


    player = null;                          // The player object
    gameInterval = null;                    // The interval
    timeInterval = null;                    // The interval
    nameBox = null;
    bulletsClass = [];
    monsterClass = [];
    goodThingClass = [];
    disappearingPlatformClass = [];
    monsterBullet = null;
    monsterKing = null;
    verticalPlatform = null;
    portalPair = [];    // blue / red
    gate = null;
    bulletsNodeSet.innerHTML = '';
    gatesNodeSet.innerHTML = '';
    remainingTimeNodeSet.innerHTML = '120';
    monsterNodeSet.innerHTML = '';
    portalNodeSet.innerHTML = '';
    remainingBulletsNodeSet.innerHTML = String.raw
        `<use xlink:href="#bullet" x="30" y="20" />
    <use xlink:href="#bullet" x="40" y="20" />
    <use xlink:href="#bullet" x="50" y="20" />
    <use xlink:href="#bullet" x="60" y="20" />
    <use xlink:href="#bullet" x="70" y="20" />
    <use xlink:href="#bullet" x="80" y="20" />
    <use xlink:href="#bullet" x="90" y="20" />
    <use xlink:href="#bullet" x="100" y="20" />
    `;
    goodThingNodeSet.innerHTML = '';
    currentSeedNodeSet.innerHTML = "Seed: " + seed;
    function levelUp(levelNodeTrim) {
        return levelNodeTrim.slice(0, 6) + (parseInt(levelNodeTrim.slice(6)) + 1);
    }
    currentLevelNodeSet.innerHTML = levelUp(currentLevelNodeSet.innerHTML.trim());
    //scoreNodeSet.innerHTML=score;

    document.documentElement.addEventListener("keydown", keydown, false);
    document.documentElement.addEventListener("keyup", keyup, false);

    //TODO platformClass
    for (let i = 0; i < platforms.childNodes.length; i++) {
        let node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") {
            continue;
        }
        let x = parseFloat(node.getAttribute("x"));
        let y = parseFloat(node.getAttribute("y"));
        let w = parseFloat(node.getAttribute("width"));
        platform = new Platform(node, new Point(x, y), new Size(w, 20));
        platformClass.push(platform);
    }
    nameBox = new NameBox();
    if (inputName == null) {
        inputName = prompt("Please enter your name", "");
        if (inputName != null && inputName != "") {
            nameBox.playerName = inputName;
        }
        else {
            inputName = "Anonymous";
            nameBox.playerName = "Anonymous";
        }
    }
    else {
        if (startAgainFlag) {
            inputName = prompt("Please enter your name", inputName);
        }
        nameBox.playerName = inputName;
    }
    let welcomeMusic = document.getElementById("welcomeMusic");
    welcomeMusic.pause();
    let gameMusic = document.getElementById("gameMusic");
    if (startAgainFlag) {
        gameMusic.currentTime = 0;
    }
    gameMusic.play();
    let loadingScreen = svgdoc.getElementById("loadingScreen");
    loadingScreen.setAttribute("style", "visibility: hidden");
    let gameScreen = svgdoc.getElementById("gameScreen");
    gameScreen.setAttribute("style", "visibility: visible");
    // Attach keyboard events
    function createDisappearingPlatform(pos, width) {
        disappearingPlatformNode = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        // Set the various attributes of the line
        disappearingPlatformNode.setAttribute("x", pos.x);
        disappearingPlatformNode.setAttribute("y", pos.y);
        disappearingPlatformNode.setAttribute("width", width);
        disappearingPlatformNode.setAttribute("height", 20);
        disappearingPlatformNode.setAttribute("fill", "#66ccff");
        disappearingPlatformNode.style.setProperty("opacity", 1, null);
        // Add the new platform to the end of the group
        platforms.appendChild(disappearingPlatformNode);
        let disappearingPlatformSize = new Size(width, 20);
        let disappearingPlatform = new DisappearingPlatform(disappearingPlatformNode, pos, disappearingPlatformSize);
        disappearingPlatformClass.push(disappearingPlatform);
        platformClass.push(disappearingPlatform);
    }
    // Create disappearing platforms
    /*createDisappearingPlatform(new Point(0, 260), 100);
    createDisappearingPlatform(new Point(110, 260), 100);
    createDisappearingPlatform(new Point(220, 260), 100);*/

    //randomized disappearing platform
    for (let index = 0; index < 3; index++) {
        let returnOfFind = findPlatformPosition();
        let newPos = returnOfFind[0];
        let width = returnOfFind[1];
        createDisappearingPlatform(newPos, width);
    }

    function createVerticalPlatform(pos, width, range) {
        verticalPlatformNode = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        // Set the various attributes of the line
        verticalPlatformNode.setAttribute("x", pos.x);
        verticalPlatformNode.setAttribute("y", pos.y);
        verticalPlatformNode.setAttribute("width", width);
        verticalPlatformNode.setAttribute("height", 20);
        verticalPlatformNode.setAttribute("fill", "green");
        // Add the new platform to the end of the group
        platforms.appendChild(verticalPlatformNode);
        let verticalPlatformNodeSize = new Size(width, 20);
        verticalPlatform = new VerticalPlatform(verticalPlatformNode, pos, verticalPlatformNodeSize, pos.y, pos.y - range);
    }
    while (true) {
        let found = true;
        let returnOfFind = findPlatformPosition();
        let range = Math.floor(Math.random() * 500);
        if (range < 70 || returnOfFind[0].y - range <= 0 || returnOfFind[0].y + range >= 600) {
            continue;
        }
        for (let i = 0; i < platformClass.length; i++) {
            let platform = platformClass[i];
            let movementPos = new Point(returnOfFind[0].x, returnOfFind[0].y - range);
            let sizeOfMovement = new Size(returnOfFind[1], range + 20);
            if (intersect(movementPos, sizeOfMovement, platform.position, new Size(platform.width, 20))) {
                found = false;
                break;
            }
        }
        if (found) {
            createVerticalPlatform(returnOfFind[0], returnOfFind[1], range);
            break;
        }
    }
    //createVerticalPlatform(new Point(550, 260), 50,);

    // Create the player
    player = new Player();

    nameBox.node.firstElementChild.innerHTML = nameBox.playerName;

    function findObjectPos(objectSize) {
        let possiblePositions = [];
        for (let i = 0; i < platforms.childNodes.length; i++) {
            let node = platforms.childNodes.item(i);
            if (node.nodeName != "rect") {
                continue;
            }
            if (node == verticalPlatform.node) {
                continue;
            }
            let disappearingPlatformNodes = disappearingPlatformClass.map(function (item) { return item.node; });
            if (disappearingPlatformNodes.includes(node)) {
                continue;
            }

            let x = parseFloat(node.getAttribute("x"));
            let y = parseFloat(node.getAttribute("y"));
            let w = parseFloat(node.getAttribute("width"));
            let x_start = x;
            let x_end = x + w - objectSize.w;

            possiblePositions.push([x_start, x_end, y - objectSize.h]);
        }
        let possiblePositionsLength = possiblePositions.length;

        let platformIndex = Math.floor(Math.random() * possiblePositionsLength);
        let x_start = possiblePositions[platformIndex][0];
        let x_end = possiblePositions[platformIndex][1];
        let y = possiblePositions[platformIndex][2];
        let x = x_start + (x_end - x_start) * Math.random();
        let objectPos = new Point(x, y);

        for (let i = 0; i < platforms.childNodes.length; i++) {
            let node = platforms.childNodes.item(i);
            if (node.nodeName != "rect")
                continue;
            let x = parseFloat(node.getAttribute("x"));
            let y = parseFloat(node.getAttribute("y"));
            let w = parseFloat(node.getAttribute("width"));
            let h = parseFloat(node.getAttribute("height"));
            let platformPos = new Point(x, y);
            let platformSize = new Size(w, h);

            if (intersect(objectPos, objectSize, platformPos, platformSize)) {
                return null;
            }
        }
        let regionOfMovement = new Point(x_start, x_end);
        return [objectPos, regionOfMovement];
    }

    // create a portal pair
    for (let index = 0; index < 2; index++) {
        let portalReturn = null;
        while (true) {
            let found = false;
            portalReturn = findObjectPos(PORTAL_SIZE);
            if (portalReturn != null) {
                found = true;
                let portalPos = portalReturn[0];
                let regionOfMovement = portalReturn[1];

                if (portalPos.x + PORTAL_SIZE.w + MONSTER_SIZE.w > regionOfMovement.y || portalPos.x - MONSTER_SIZE.w < regionOfMovement.x) {
                    found = false;
                }
                if (found) {
                    let possibleMonsterPos1 = new Point(portalPos.x + PORTAL_SIZE.w, portalPos.y + PORTAL_SIZE.h - MONSTER_SIZE.h);
                    let possibleMonsterPos2 = new Point(portalPos.x - MONSTER_SIZE.w, portalPos.y + PORTAL_SIZE.h - MONSTER_SIZE.h);
                    for (let i = 0; i < platformClass.length; i++) {
                        let platform = platformClass[i];
                        if (intersect(platform.position, new Size(platform.width, 20), possibleMonsterPos1, MONSTER_SIZE) || intersect(platform.position, new Size(platform.width, 20), possibleMonsterPos2, MONSTER_SIZE)) {
                            found = false;
                            break;
                        }
                    }
                }
                if (found) {
                    for (let index = 0; index < portalPair.length; index++) {
                        const item = portalPair[index];
                        if (intersect(item.position, PORTAL_SIZE, portalPos, PORTAL_SIZE)) {
                            found = false;
                            break;
                        }
                    }
                }
                if (found)
                    break;
            }
        }

        let portalPos = portalReturn[0];
        let regionOfMovement = portalReturn[1];
        let faceRight = null;
        if (Math.random() > 0.5) {
            faceRight = true;
        }
        else {
            faceRight = false;
        }

        createPortal(portalPos.x, portalPos.y, faceRight);
        let portal = new Portal(portalPos, regionOfMovement, faceRight);
        portalPair.push(portal);
    }


    // Create the monsters

    for (let index = 0; index < NUM_ALL_MONSTERS; index++) {
        let monsterReturn = null;
        while (true) {
            let found = false;
            monsterReturn = findObjectPos(MONSTER_SIZE);
            if (monsterReturn != null) {
                found = true;
                let monsterPos = monsterReturn[0];
                for (let index = 0; index < monsterClass.length; index++) {
                    const item = monsterClass[index];
                    if (intersect(item.position, MONSTER_SIZE, monsterPos, MONSTER_SIZE)) {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    for (let index = 0; index < 2; index++) {
                        let portal = portalPair[index];
                        if (portal.faceRight && portal.position.x + PORTAL_SIZE.w + 2 * MONSTER_SIZE.w > portal.regionOfMovement.y || !portal.faceRight && portal.position.x - 2 * MONSTER_SIZE.w < portal.regionOfMovement.x) {
                            fount = false;
                        }
                    }
                }
                if (found)
                    break;
            }

        }

        let monsterPos = monsterReturn[0];
        let regionOfMovement = monsterReturn[1];
        //var monsterNode = createMonster(monsterPos.x, monsterPos.y);

        let motion = null;
        if (Math.random() > 0.5) {
            motion = motionType.LEFT;
        }
        else {
            motion = motionType.RIGHT;
        }
        let monster = null;
        if (index < NUM_ALL_MONSTERS - 1) {
            let monsterNode = createMonster(0, 0, false);
            monster = new Monster(monsterNode, monsterPos, motion, regionOfMovement);
        } else {
            let monsterKingNode = createMonster(0, 0, true);
            monster = new MonsterKing(monsterKingNode, monsterPos, motion, regionOfMovement);
            monsterKing = monster;
        }
        monsterClass.push(monster);
    }



    // create a exit gate
    let gateReturn = null;
    while (true) {
        let found = false;
        gateReturn = findObjectPos(GATE_SIZE);
        if (gateReturn != null) {
            found = true;
            let gatePos = gateReturn[0];
            for (let index = 0; index < portalPair.length; index++) {
                if (intersect(gatePos, GATE_SIZE, portalPair[index].position, PORTAL_SIZE)) {
                    found = false;
                }
            }

            if (found)
                break;
        }
    }
    let gatePos = gateReturn[0];
    let gateNode = document.createElementNS("http://www.w3.org/2000/svg", "use");
    gateNode.setAttribute("x", gatePos.x);
    gateNode.setAttribute("y", gatePos.y);
    gateNode.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#closedGate");
    gatesNodeSet.appendChild(gateNode);
    gate = new Gate(gateNode, gatePos);

    // create good things
    for (let index = 0; index < NUM_GOOD_THING; index++) {
        let goodThingReturn = null;
        while (true) {
            let found = false;
            goodThingReturn = findObjectPos(GOOD_THING_SIZE);
            if (goodThingReturn != null) {
                found = true;
                let goodThingPos = goodThingReturn[0];
                for (let index = 0; index < goodThingClass.length; index++) {
                    const item = goodThingClass[index];
                    if (intersect(item.position, GOOD_THING_SIZE, goodThingPos, GOOD_THING_SIZE)) {
                        found = false;
                        break;
                    }
                }
                for (let index = 0; index < portalPair.length; index++) {
                    const item = portalPair[index];
                    if (intersect(item.position, PORTAL_SIZE, goodThingPos, GOOD_THING_SIZE)) {
                        found = false;
                        break;
                    }
                }
                if (found)
                    break;
            }
        }

        let goodThingPos = goodThingReturn[0];
        let goodThingNode = createGoodThing(goodThingPos.x, goodThingPos.y);
        let goodThing = new GoodThing(goodThingNode, goodThingPos);
        goodThingClass.push(goodThing);
    }

    moveMonsters();

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    if (!superCheatEnabled) {
        timeInterval = setInterval("updateTime()", 1000);
    }

}
function nextLevel() {
    startAgainFlag = false;

    clearInterval(timeInterval);
    clearInterval(gameInterval);
    platforms.removeChild(verticalPlatform.node);
    for (let i = 0; i < disappearingPlatformClass.length; i++) {
        platforms.removeChild(disappearingPlatformClass[i].node);
    }
    introductionScreenLoad();
}
function updateTime() {
    let timeNode = remainingTimeNodeSet;
    let remainingTime = parseInt(timeNode.innerHTML);
    remainingTime -= 1;
    timeNode.innerHTML = remainingTime;
    if (remainingTime == 0) {
        endGame();
        return;
    }
}
//
// This function creates the monsters in the game
//
function createMonster(x, y, isMonsterKing) {
    let monster = document.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    if (isMonsterKing) {
        monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monsterKing");
    } else {
        monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    }
    monsterNodeSet.appendChild(monster);
    return monster
}

//
// This function creates the good things in the game
//
function createGoodThing(x, y) {
    let goodThing = document.createElementNS("http://www.w3.org/2000/svg", "use");
    goodThing.setAttribute("x", x);
    goodThing.setAttribute("y", y);

    goodThing.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#goodThing");
    goodThingNodeSet.appendChild(goodThing);
    return goodThing
}

//
// This function creates a portal in the game
//
function createPortal(x, y, faceRight) {
    let portalNode = document.createElementNS("http://www.w3.org/2000/svg", "use");
    if (faceRight) {
        transformString = "translate(" + x + "," + y + ")";
        portalNode.setAttribute("transform", transformString);
        portalNode.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#portal");
    }
    else {
        transformString = "translate(" + x + "," + y + ")" + "translate(" + PORTAL_SIZE.w + ", 0) scale(-1, 1)";
        portalNode.setAttribute("transform", transformString);
        portalNode.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#portal");
    }
    portalNodeSet.appendChild(portalNode);
}

//
// This function shoots a bullet from the player
//
function shootBullet() {
    shootSound.currentTime = 0;
    shootSound.play();
    if (!cheatEnabled) {
        remainingBulletsNode = remainingBulletsNodeSet;
        let foundUse = false;
        for (let i = 0; i < remainingBulletsNode.childNodes.length; i++) {
            let node = remainingBulletsNode.childNodes.item(i);
            if (node.nodeName == "use") {
                node.parentNode.removeChild(node);
                break;
            }
            else {
                continue;
            }
        }
        for (let i = 0; i < remainingBulletsNode.childNodes.length; i++) {
            let node = remainingBulletsNode.childNodes.item(i);
            if (node.nodeName == "use") {
                foundUse = true;
                break;
            }
            else {
                continue;
            }
        }

        // Disable shooting for a short period of time
        canShoot = false;
        if (foundUse) {
            setTimeout("canShoot = true", SHOOT_INTERVAL);
        }
    }
    else {
        canShoot = false;
        setTimeout("canShoot = true", SHOOT_INTERVAL);
    }
    // Create the bullet using the use node
    let bullet = new Bullet();
    bullet.faceRight = player.faceRight;
    bullet.node = document.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.node.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    bullet.node.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    bullet.node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    bulletsNodeSet.appendChild(bullet.node);
    bulletsClass.push(bullet);
}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    let keyCode = (evt.keyCode) ? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.faceRight = false;
            break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            player.faceRight = true;
            break;

        case "W".charCodeAt(0):
            if (!superCheatEnabled) {
                //if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
                //}
            }
            else {
                player.verticalSpeed = -MOVE_DISPLACEMENT;
            }
            break;
        case "S".charCodeAt(0):
            if (!superCheatEnabled) {
                if (!player.isOnPlatform()) {
                    player.verticalSpeed = player.verticalSpeed - JUMP_SPEED;
                }
            }
            else {
                player.verticalSpeed = MOVE_DISPLACEMENT;
            }
            break;
        case "H".charCodeAt(0):
            if (canShoot) shootBullet();
            break;
        case "C".charCodeAt(0):
            cheatEnabled = true;
            break;
        case "P".charCodeAt(0):
            superCheatEnabled = true;
            cheatEnabled = true;
            break;
        case "T".charCodeAt(0):
            nextLevel();
            break;
        case "V".charCodeAt(0):
            cheatEnabled = false;
            superCheatEnabled = false;
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    let keyCode = (evt.keyCode) ? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;
        case "W".charCodeAt(0):
            if (superCheatEnabled) {
                player.verticalSpeed = 0;
            }
            break;
        case "S".charCodeAt(0):
            if (superCheatEnabled) {
                player.verticalSpeed = 0;
            }
            break;
        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}

function endGame() {
    gameMusic.pause();
    gameOverSound.play()
    // Clear the game interval
    clearInterval(timeInterval);
    clearInterval(gameInterval);

    // Get the high score table from cookies
    let highScoreTable = getHighScoreTable();
    // Create the new score record

    let record = new ScoreRecord(nameBox.playerName, score, true);
    // Insert the new score record
    let j = 0;
    while (j < highScoreTable.length && highScoreTable[j].score > score) {
        ++j;
    }
    highScoreTable.splice(j, 0, record);
    // Store the new high score table
    setHighScoreTable(highScoreTable);
    // Show the high score table
    showHighScoreTable(highScoreTable);
    playEndingMusicTimeout = setTimeout(playEndingMusic, 30000);
    return;
}
function playEndingMusic() {
    endingMusic.play();
}
function resolveMonsterCollision() {
    for (let j = 0; j < monsterClass.length; j++) {
        let monster1 = monsterClass[j];
        for (let i = 0; i < monsterClass.length; i++) {
            let monster2 = monsterClass[i];
            if (monster1 == monster2) {
                continue;
            }
            if (intersect(monster1.position, MONSTER_SIZE, monster2.position, MONSTER_SIZE)) {
                let midPointX = (monster1.position.x + monster2.position.x) / 2;
                let monster1NewX = midPointX;
                let monster1NewY = monster1.position.y;
                monster1.position = new Point(monster1NewX, monster1NewY);
                let monster2NewX = midPointX - MONSTER_SIZE.w;
                let monster2NewY = monster2.position.y;
                monster2.position = new Point(monster2NewX, monster2NewY);
                if (monster1.motion == motionType.RIGHT) {
                    let transformString1 = "translate(" + monster1NewX + "," + monster1NewY + ")";
                    monster1.node.setAttribute("transform", transformString1);
                }
                else {
                    let transformString1 = "translate(" + monster1NewX + "," + monster1NewY + ")" + "translate(" + MONSTER_SIZE.w + ", 0) scale(-1, 1)";
                    monster1.node.setAttribute("transform", transformString1);
                }
                if (monster2.motion == motionType.RIGHT) {
                    let transformString2 = "translate(" + monster2NewX + "," + monster2NewY + ")";
                    monster2.node.setAttribute("transform", transformString2);
                }
                else {
                    let transformString2 = "translate(" + monster2NewX + "," + monster2NewY + ")" + "translate(" + MONSTER_SIZE.w + ", 0) scale(-1, 1)";
                    monster2.node.setAttribute("transform", transformString2);
                }
            }
        }
    }
}
//
// This function checks collision
//
function collisionDetection() {
    // check portals and monsters
    let monsterTeleported = false;
    for (let i = 0; i < portalPair.length; i++) {
        let portal = portalPair[i];
        let portalPos = portal.position;
        for (let j = 0; j < monsterClass.length; j++) {
            let monster = monsterClass[j];
            let monsterPos = monster.position;
            let canEnterPortal = ((monster.motion == motionType.RIGHT) == !portal.faceRight) || ((monster.motion == motionType.LEFT) == portal.faceRight);
            if (canEnterPortal && intersect(portalPos, PORTAL_SIZE, monsterPos, MONSTER_SIZE)) {
                monsterTeleported = true;
                newPortal = portalPair[1 - i];
                let newPortalPos = newPortal.position;
                monster.regionOfMovement = newPortal.regionOfMovement;
                if (newPortal.faceRight) {
                    monster.motion = motionType.RIGHT;
                    let monsterNewX = (newPortalPos.x + PORTAL_SIZE.w + 1);
                    let monsterNewY = (newPortalPos.y + PORTAL_SIZE.h - MONSTER_SIZE.h);
                    monster.position = new Point(monsterNewX, monsterNewY);
                    let transformString = "translate(" + monsterNewX + "," + monsterNewY + ")";
                    monster.node.setAttribute("transform", transformString);
                }
                else {
                    monster.motion = motionType.LEFT;
                    let monsterNewX = (newPortalPos.x - MONSTER_SIZE.w - 1);
                    let monsterNewY = (newPortalPos.y + PORTAL_SIZE.h - MONSTER_SIZE.h);
                    monster.position = new Point(monsterNewX, monsterNewY);
                    let transformString = "translate(" + monsterNewX + "," + monsterNewY + ")" + "translate(" + MONSTER_SIZE.w + ", 0) scale(-1, 1)";
                    monster.node.setAttribute("transform", transformString);
                }
            }
        }
    }
    if (monsterTeleported) {
        resolveMonsterCollision();
    }

    // check portals and bullets
    for (let i = 0; i < portalPair.length; i++) {
        let portal = portalPair[i];
        let portalPos = portal.position;
        for (let j = 0; j < bulletsClass.length; j++) {
            let bullet = bulletsClass[j];
            let bulletX = parseInt(bullet.node.getAttribute("x"));
            let bulletY = parseInt(bullet.node.getAttribute("y"));
            let bulletPos = new Point(bulletX, bulletY);
            let canEnterPortal = (bullet.faceRight == !portal.faceRight) || (!bullet.faceRight == portal.faceRight);
            if (canEnterPortal && intersect(portalPos, PORTAL_SIZE, bulletPos, BULLET_SIZE)) {
                newPortal = portalPair[1 - i];
                let newPortalPos = newPortal.position;
                bullet.faceRight = newPortal.faceRight;
                if (newPortal.faceRight) {
                    let bulletNewX = (newPortalPos.x + PORTAL_SIZE.w + 1);
                    let bulletNewY = (bulletPos.y - portalPos.y + newPortalPos.y);
                    bullet.node.setAttribute("x", bulletNewX);
                    bullet.node.setAttribute("y", bulletNewY);
                }
                else {
                    let bulletNewX = (newPortalPos.x - BULLET_SIZE.w - 1);
                    let bulletNewY = (bulletPos.y - portalPos.y + newPortalPos.y);
                    bullet.node.setAttribute("x", bulletNewX);
                    bullet.node.setAttribute("y", bulletNewY);
                }
            }
        }
    }
    // check portals and monsterBullet
    if (monsterBullet != null && monsterBullet.exsistence) {
        for (let i = 0; i < portalPair.length; i++) {
            let portal = portalPair[i];
            let portalPos = portal.position;
            let monsterBulletX = parseInt(monsterBullet.node.getAttribute("x"));
            let monsterBulletY = parseInt(monsterBullet.node.getAttribute("y"));
            let monsterBulletPos = new Point(monsterBulletX, monsterBulletY);
            let canEnterPortal = (monsterBullet.faceRight == !portal.faceRight) || (!monsterBullet.faceRight == portal.faceRight);
            if (canEnterPortal && intersect(portalPos, PORTAL_SIZE, monsterBulletPos, BULLET_SIZE)) {
                newPortal = portalPair[1 - i];
                let newPortalPos = newPortal.position;
                monsterBullet.faceRight = newPortal.faceRight;
                if (newPortal.faceRight) {
                    let monsterBulletNewX = (newPortalPos.x + PORTAL_SIZE.w + 1);
                    let monsterBulletNewY = (monsterBulletPos.y - portalPos.y + newPortalPos.y);
                    monsterBullet.node.setAttribute("x", monsterBulletNewX);
                    monsterBullet.node.setAttribute("y", monsterBulletNewY);
                }
                else {
                    let monsterBulletNewX = (newPortalPos.x - BULLET_SIZE.w - 1);
                    let monsterBulletNewY = (monsterBulletPos.y - portalPos.y + newPortalPos.y);
                    monsterBullet.node.setAttribute("x", monsterBulletNewX);
                    monsterBullet.node.setAttribute("y", monsterBulletNewY);
                }
                break;
            }
        }
    }
    // check portals and player
    for (let i = 0; i < portalPair.length; i++) {
        let portal = portalPair[i];
        let portalPos = portal.position;
        let playerPos = player.position;
        let canEnterPortal = ((player.motion == motionType.RIGHT) == !portal.faceRight) || ((player.motion == motionType.LEFT) == portal.faceRight);
        if (canEnterPortal && intersect(portalPos, PORTAL_SIZE, playerPos, PLAYER_SIZE)) {
            newPortal = portalPair[1 - i];
            let newPortalPos = newPortal.position;
            player.faceRight = newPortal.faceRight;
            player.motion = motionType.NONE;
            if (newPortal.faceRight) {
                let playerNewX = (newPortalPos.x + PORTAL_SIZE.w + 1);
                let playerNewY = (newPortalPos.y + PORTAL_SIZE.h - PLAYER_SIZE.h);
                player.position = new Point(playerNewX, playerNewY);
                transformString = "translate(" + playerNewX + "," + playerNewY + ")";
                player.node.setAttribute("transform", transformString);
            }
            else {
                let playerNewX = (newPortalPos.x - PLAYER_SIZE.w - 1);
                let playerNewY = (newPortalPos.y + PORTAL_SIZE.h - PLAYER_SIZE.h);
                player.position = new Point(playerNewX, playerNewY);
                transformString = "translate(" + playerNewX + "," + playerNewY + ")" + "translate(" + PLAYER_SIZE.w + ", 0) scale(-1, 1)";
                player.node.setAttribute("transform", transformString);
            }
        }
    }

    if (!cheatEnabled && monsterBullet != null && monsterBullet.exsistence) {
        let monsterBulletNode = monsterBullet.node;
        let monsterBulletX = parseInt(monsterBulletNode.getAttribute("x"));
        let monsterBulletY = parseInt(monsterBulletNode.getAttribute("y"));
        let monsterBulletPos = new Point(monsterBulletX, monsterBulletY);

        if (intersect(player.position, PLAYER_SIZE, monsterBulletPos, BULLET_SIZE)) {
            endGame();
            return;
        }
    }

    // Check whether the player collides with a monster
    if (!cheatEnabled) {
        for (let i = 0; i < monsterClass.length; i++) {
            let monster = monsterClass[i];
            let monsterPos = monster.position;
            let x = monsterPos.x
            let y = monsterPos.y

            if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
                endGame();
                return;
            }
        }
    }
    // Check whether a bullet hits a monster

    for (let i = 0; i < bulletsClass.length; i++) {
        let bullet = bulletsClass[i].node;
        let x = parseInt(bullet.getAttribute("x"));
        let y = parseInt(bullet.getAttribute("y"));
        let bulletPos = new Point(x, y);

        for (let j = 0; j < monsterClass.length; j++) {
            let monster = monsterClass[j];
            let monsterPos = monster.position;
            let monsterNode = monster.node;
            let mx = monsterPos.x
            let my = monsterPos.y

            if (intersect(bulletPos, BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                if (monsterKing == monster) {
                    monsterKing.exsistence = false;
                }
                monsterNode.parentNode.removeChild(monsterNode);
                monsterHitSound.currentTime = 0;
                monsterHitSound.play();
                bullets.removeChild(bullet);
                bulletsClass.splice(i, 1);
                monsterClass.splice(j, 1);
                j--;
                i--;

                //write some code to update the score
                score += 10;
                scoreNodeSet.firstChild.data = score;
            }
        }
    }

    // check goodThing
    for (let i = 0; i < goodThingClass.length; i++) {
        let goodThing = goodThingClass[i];
        let goodThingNode = goodThing.node;
        if (intersect(player.position, PLAYER_SIZE, goodThing.position, GOOD_THING_SIZE)) {
            goodThingNode.parentNode.removeChild(goodThingNode);
            goodThingClass.splice(i, 1);
            i--;
            goodThingSound.currentTime = 0;
            goodThingSound.play();
            //write some code to update the score
            score += 10;
            scoreNodeSet.firstChild.data = score;
        }
    }

    //check gate and player
    if (gate.isOpen && intersect(player.position, PLAYER_SIZE, gate.position, GATE_SIZE)) {
        nextLevel();
    }
}


//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets

    bulletsClass.forEach(function (item, i) {
        let node = item.node;
        // Update the position of the bullet
        let x = parseInt(node.getAttribute("x"));
        if (item.faceRight) {
            node.setAttribute("x", x + BULLET_SPEED);
        }
        else {
            node.setAttribute("x", x - BULLET_SPEED);
        }

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0) {
            node.parentNode.removeChild(node);
            bulletsClass.splice(i, 1);
            i--;
        }

    });
}
function moveMonsterBullet() {
    let node = monsterBullet.node;
    // Update the position of the bullet
    let x = parseInt(node.getAttribute("x"));
    if (monsterBullet.faceRight) {
        node.setAttribute("x", x + BULLET_SPEED);
    }
    else {
        node.setAttribute("x", x - BULLET_SPEED);
    }

    // If the bullet is not inside the screen delete it from the group
    if (x > SCREEN_SIZE.w || x < 0) {
        node.parentNode.removeChild(node);
        monsterBullet.exsistence = false;
    }
}
function moveMonsters() {
    monsterClass.forEach(function (item) {
        let node = item.node;
        // Update the position of the bullet
        let x = item.position.x;
        let y = item.position.y;

        if (item.motion == motionType.RIGHT) {
            let newX = x + MONSTER_SPEED;
            if (newX < item.regionOfMovement.y && !item.isMonsterCollidePlatform(new Point(newX, y)) && !item.isMonsterCollideMonster(new Point(newX, y))) {
                transformString = "translate(" + newX + "," + y + ")";
                node.setAttribute("transform", transformString);
                item.position = new Point(newX, y);
            }
            else {
                transformString = "translate(" + x + "," + y + ")";
                node.setAttribute("transform", transformString);
                item.motion = motionType.LEFT;
            }
        }
        else {
            let newX = x - MONSTER_SPEED;
            if (newX > item.regionOfMovement.x && !item.isMonsterCollidePlatform(new Point(newX, y)) && !item.isMonsterCollideMonster(new Point(newX, y))) {
                transformString = "translate(" + newX + "," + y + ")" + "translate(" + MONSTER_SIZE.w + ", 0) scale(-1, 1)";
                node.setAttribute("transform", transformString);
                item.position = new Point(newX, y);
                //node.setAttribute("x", newX);
            }
            else {
                transformString = "translate(" + x + "," + y + ")" + "translate(" + MONSTER_SIZE.w + ", 0) scale(-1, 1)";
                node.setAttribute("transform", transformString);
                item.motion = motionType.RIGHT;
            }
        }



    });
}

function moveVerticalPlatform() {
    let node = verticalPlatform.node;
    let x = verticalPlatform.position.x;
    let y = verticalPlatform.position.y;
    let yDown = verticalPlatform.yDown;
    let yUp = verticalPlatform.yUp;
    if (verticalPlatform.canMove) {
        if (verticalPlatform.moveUp) {
            if (y - VERTICAL_MOVE_SPEED >= yUp) {
                verticalPlatform.position.y = y - VERTICAL_MOVE_SPEED;
                node.setAttribute("y", y - VERTICAL_MOVE_SPEED);
            }
            else {
                verticalPlatform.moveUp = false;
                verticalPlatform.canMove = false;
                setTimeout("verticalPlatform.canMove = true", 1000);
            }
        }
        else {
            if (y + VERTICAL_MOVE_SPEED <= yDown) {
                verticalPlatform.position.y = y + VERTICAL_MOVE_SPEED;
                node.setAttribute("y", y + VERTICAL_MOVE_SPEED);
            }
            else {
                verticalPlatform.moveUp = true;
                verticalPlatform.canMove = false;
                setTimeout("verticalPlatform.canMove = true", 1000);
            }
        }
    }
}
//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    if (monsterKing != null && monsterKing.exsistence && monsterKing.monsterKingCanShoot && (monsterBullet == null || !monsterBullet.exsistence)) {
        monsterKing.shootBullet();
    }
    for (let i = 0; i < disappearingPlatformClass.length; i++) {
        let disappearingPlatform = disappearingPlatformClass[i];
        let disappearingPlatformNode = disappearingPlatform.node;
        let playerX = player.position.x;
        let playerY = player.position.y;
        let platformOpacity = parseFloat(disappearingPlatformNode.style.getPropertyValue("opacity"));
        if (isOnParticularPlatform(playerX, playerY, disappearingPlatform.position.x, disappearingPlatform.position.y, disappearingPlatform.size.w, player.motion)) {
            platformOpacity -= 0.1;
            disappearingPlatformNode.style.setProperty("opacity", platformOpacity, null);
        }
        if (platformOpacity == 0.0) {
            platforms.removeChild(disappearingPlatformNode);
            disappearingPlatform = null;
            disappearingPlatformClass.splice(i, 1);
            i--;
        }
    }

    // Check collisions
    collisionDetection();

    // Check whether the player is on a platform
    let isOnPlatform = player.isOnPlatform();

    // Update player position
    let displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!superCheatEnabled) {
        if (!isOnPlatform && player.verticalSpeed <= 0) {
            displacement.y = -player.verticalSpeed;
            player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        }
    }


    // Jump
    if (!superCheatEnabled) {
        if (player.verticalSpeed > 0) {
            displacement.y = -player.verticalSpeed;
            player.verticalSpeed -= VERTICAL_DISPLACEMENT;
            if (player.verticalSpeed <= 0)
                player.verticalSpeed = 0;
        }
    }
    if (superCheatEnabled) {
        displacement.y = player.verticalSpeed;
    }

    // Get the new position of the player
    let position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    if (!superCheatEnabled) {
        // Check collision with platforms and screen
        player.collidePlatform(position);
        player.collideScreen(position);
    }
    // Set the location back to the player object (before update the screen)
    player.position = position;

    // Move the bullets
    moveBullets();
    moveMonsters();
    if (monsterBullet != null && monsterBullet.exsistence) {
        moveMonsterBullet();
    }
    moveVerticalPlatform();
    updateScreen();
    if (!gate.isOpen && goodThingClass.length == 0) {
        gate.isOpen = true;
        gateOpenSound.play();
        let gateNode = gate.node;
        gateNode.parentNode.removeChild(gateNode);
        gateNode = document.createElementNS("http://www.w3.org/2000/svg", "use");
        gateNode.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#openGate");
        gateNode.setAttribute("x", gate.position.x);
        gateNode.setAttribute("y", gate.position.y);
        gatesNodeSet.appendChild(gateNode);
        gate.node = gateNode;
    }
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player

    if (player.faceRight) {
        transformString = "translate(" + player.position.x + "," + player.position.y + ")";
    }
    else {
        transformString = "translate(" + player.position.x + "," + player.position.y + ")" + "translate(" + PLAYER_SIZE.w + ", 0) scale(-1, 1)";
    }
    player.node.setAttribute("transform", transformString);
    nameBox.node.firstElementChild.setAttribute("transform", "translate(" + (player.position.x + PLAYER_SIZE.w / 2) + "," + (player.position.y - 10) + ")");
}

