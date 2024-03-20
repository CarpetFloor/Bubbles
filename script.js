let c;
let r;
let w, h;

const CIRCLES_MAX_COUNT_HORIZONTAL = 18;
const CIRCLES_STARTING_ROWS_COUNT = 9;
const CIRCLES_SPACING = 3;
let circleSize = -1;

window.onload = () => {
    c = document.querySelector("canvas");
    r = c.getContext("2d");
    w = parseInt(window.getComputedStyle(c, null).getPropertyValue("width"));
    h = parseInt(window.getComputedStyle(c, null).getPropertyValue("width"));
    c.width = w;
    c.height = h;

    // circleSize = (CIRCLES_MAX_COUNT_HORIZONTAL + CIRCLES_SPACING);
    circleSize = w / (((CIRCLES_MAX_COUNT_HORIZONTAL + 1) * 2) + CIRCLES_SPACING);

    launcherX = (w / 2) - (circleSize / 1) + CIRCLES_SPACING;
    launcherY = h - (circleSize * 1) + CIRCLES_SPACING;
    aimer.smallerSize = circleSize / 3;
    
    initCircles();
    
    c.addEventListener("mousemove", setMouseAngle);
    c.addEventListener("click", launch);
    window.setInterval(loop, 1000 / 60);
}

function offsetHex(hex, offset) {
    let red = parseInt("0x" + hex[1] + hex[2]) + offset;
    if(red < 0) {red = 0;}
    if(red > 255) {red = 255;}
    
    let green = parseInt("0x" + hex[3] + hex[4]) + offset;
    if(green < 0) {green = 0;}
    if(green > 255) {green = 255;}
    
    let blue = parseInt("0x" + hex[5] + hex[6]) + offset;
    if(blue < 0) {blue = 0;}
    if(blue > 255) {blue = 255;}

    return "#" + red.toString(16) + green.toString(16) + blue.toString(16);
}

/**
 * mouse angle only gets updated when mouse is moved, 
 * so if click to launch without ever moving mouse the 
 * mouse angle would never be set, so use movedMouse so 
 * that when click to launch function is called it will 
 * set mouse angle
 */
let movedMouse = false;
// 90 degrees, start by aiming straight up (for aimer only)
let mouseAngle = 1.5708;
let mouseXpos = false;
const LAUNCH_SPEED = 8;

let launcherX = -1;
let launcherY = -1;
let launched = {
    x: -1, 
    y: -1, 
    moveX: -1, 
    moveY: -1, 
    moving: false, 
    update: function() {
        this.x += this.moveX;
        this.y += this.moveY;

        // bounce off wall
        if((this.x > w - circleSize) || (this.x < circleSize)) {
            this.moveX *= -1;
        }

        drawCircle(this.x, this.y, 
            currentColor, circleSize);
    }
};

let aimer = {
    smallerSize: -1, 
    spacing: 23, 
    count: 3, 
    draw: function() {
        let x = launcherX;
        let y = launcherY;

        let firstMoveX = Math.cos(mouseAngle) * (circleSize / 1.75);
        let firstMoveY = Math.sin(mouseAngle) * (circleSize / 1.75);

        let moveX = Math.cos(mouseAngle) * this.spacing;
        let moveY = Math.sin(mouseAngle) * this.spacing;
        
        if(!(mouseXpos)) {
            firstMoveY *= -1;
            firstMoveX *= -1;
            moveY *= -1;
            moveX *= -1;
        }

        // main circle
        drawCircle(x, y, 
            currentColor, circleSize);

        x += firstMoveX;
        y += firstMoveY;

        let color = currentColor;

        for(let i = 0; i < this.count; i++) {
            x += moveX;
            y += moveY;

            color = offsetHex(color, -30);

            drawCircle(x, y, 
                color, this.smallerSize);
        }
    }   
}

let colors = {
    current: null, 
    bright: [
        "#F06292", "#9575CD", "#4FC3F7", "#81C784", "#FF8A65"
    ], 
    pastel: [
        "#F1948A", "#C39BD3", "#85C1E9", "#82E0AA", "#F5CBA7"
    ]
}
colors.current = colors.bright;
let currentColor = randomColor();

function randomColor() {
    let max = colors.current.length;
    let min = 0;

    return colors.current[Math.floor((Math.random() * (max - min)) + min)];
}

let circles = [];

function initCircles() {
    circles = [];

    for(let row = 0; row < CIRCLES_STARTING_ROWS_COUNT; row++) {
        let currentRow = [];
    
        for(let col = 0; col < CIRCLES_MAX_COUNT_HORIZONTAL; col++) {
            currentRow.push(randomColor());
        }

        circles.push(currentRow);
    }
}

let shiftOddRows = true;
function drawCircles() {
    let x = -1;
    let y = circleSize + CIRCLES_SPACING;

    for(let row = 0; row < circles.length; row++) {
        x = circleSize + CIRCLES_SPACING;
        
        if(row % 2 == 1 && shiftOddRows) {
            x += circleSize + CIRCLES_SPACING;
        }

        for(let col = 0; col < circles[row].length; col++) {
            drawCircle(
                x, 
                y, 
                circles[row][col], 
                circleSize
            );

            x += (circleSize * 2) + CIRCLES_SPACING;
        }

        y += (circleSize * 2) + CIRCLES_SPACING;
    }
}

/**
 * returns the column and row of circle object at position given, 
 * or -1 if no circle object is there
 */
function getCircleAt(x, y) {
    let row = Math.floor(y / ((circleSize * 2) + CIRCLES_SPACING));

    if((row < 0) || (row > circles.length - 1)) {
        return -1;
    }

    for(let col = 0; col < circles[row].length; col++) {
        let xdiff = Math.abs(circles[row][col].x - x);
        let ydiff = Math.abs(circles[row][col].y - y);

        let dist = Math.sqrt((xdiff * xdiff) + (ydiff * ydiff));

        if(dist <= circleSize + CIRCLES_SPACING) {
            return [col, row];
        }
    }

    return -1;
}

function setMouseAngle(e) {
    movedMouse = true;
    let xdiff = e.offsetX - launcherX;
    let ydiff = e.offsetY - launcherY;

    mouseXpos = xdiff > 0;
    
    mouseAngle = Math.atan(ydiff / xdiff);
}

function launch(e) {
    // don't allow launching ball to horizontal to prevent bouncing back and forth horizontally
    if(!(launched.moving) && (e.offsetY < h - 100)) {
        launched.moving = true;

        if(!(movedMouse)) {
            launched.x = launcherX;
            launched.y = launcherY;
            
            launched.moveX = 0;
            launched.moveY = 0 - LAUNCH_SPEED;
        }
        else {
            launched.x = launcherX;
            launched.y = launcherY;
            
            launched.moveX = Math.cos(mouseAngle) * LAUNCH_SPEED;
            launched.moveY = Math.sin(mouseAngle) * LAUNCH_SPEED;
            // if pointing directly up, moveY will be negative
            if(launched.moveY > 0) {
                launched.moveY *= -1;
            }
            
            if(!(mouseXpos)) {
                launched.moveY *= -1;
                launched.moveX *= -1;
            }
        }
    }
}

let border = true;
const BORDER_COLOR_DIFF = 40;
const BORDER_SIZE = 2.5;
let borderStyle = 1;
function drawCircle(x, y, color, size) {
    r.fillStyle = color;
    r.beginPath();
    r.arc(x, y, 
        size, 
        0, 2 * Math.PI); 
    r.fill();

    if(border) {
        
        if(borderStyle == 0) {
            r.strokeStyle = offsetHex(color, 0 - BORDER_COLOR_DIFF);
            r.lineWidth = BORDER_SIZE;
        }
        else {
            r.strokeStyle = "Black"
            r.lineWidth = 3;
        }

        r.stroke();
        r.closePath();
    }

    r.closePath();
}

function loop() {
    let frameStart = Date.now();

    r.clearRect(0, 0, w, h);

    drawCircles();

    if(launched.moving) {
        launched.update();
    }
    // aiming
    else {
        aimer.draw();
    }

    let frameEnd = Date.now();
}