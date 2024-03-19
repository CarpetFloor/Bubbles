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
    aimer.smallerSize = circleSize / 3;
    initCircles();
    
    c.addEventListener("mousemove", setMouseAngle);
    c.addEventListener("click", launch);
    window.setInterval(loop, 1000 / 30);
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
const LAUNCH_SPEED = 15;

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
        let x = (w / 2) - (circleSize / 2);
        let y = h - (circleSize / 2);

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

        let color = 255;

        for(let i = 0; i < this.count; i++) {
            x += moveX;
            y += moveY;

            color -= 30;

            drawCircle(x, y, 
                "rgb(" + color + "," + color + "," + color + ")", this.smallerSize);
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

function Circle(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
}
let circles = [];

function initCircles() {
    let x = -1;
    let y = circleSize + CIRCLES_SPACING;
    circles = [];

    for(let row = 0; row < CIRCLES_STARTING_ROWS_COUNT; row++) {
        let currentRow = [];

        x = circleSize + CIRCLES_SPACING;

        if(row % 2 == 1) {
            x += circleSize + CIRCLES_SPACING;
        }
    
        for(let col = 0; col < CIRCLES_MAX_COUNT_HORIZONTAL; col++) {
            currentRow.push(new Circle(x, y, randomColor()));

            x += (circleSize * 2) + CIRCLES_SPACING;
        }

        circles.push(currentRow);

        y += (circleSize * 2) + CIRCLES_SPACING;
    }
}

function drawCircles() {
    for(let row = 0; row < circles.length; row++) {
        for(let col = 0; col < circles[row].length; col++) {
            drawCircle(
                circles[row][col].x, 
                circles[row][col].y, 
                circles[row][col].color, 
                circleSize
            );
        }
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
    let xdiff = e.offsetX - (w / 2);
    let ydiff = e.offsetY - h;

    mouseXpos = xdiff > 0;
    
    mouseAngle = Math.atan(ydiff / xdiff);
}

function launch(e) {
    // don't allow launching ball to horizontal to prevent bouncing back and forth horizontally
    if(!(launched.moving) && (e.offsetY < h - 100)) {
        if(!(movedMouse)) {
            let xdiff = e.offsetX - (w / 2);
            let ydiff = e.offsetY - h;
            
            mouseAngle = Math.atan(ydiff / xdiff);
        }

        launched.moving = true;
        launched.x = (w / 2) - (circleSize / 2);
        launched.y = h - (circleSize / 2);
        
        launched.moveX = Math.cos(mouseAngle) * LAUNCH_SPEED;
        launched.moveY = Math.sin(mouseAngle) * LAUNCH_SPEED;
        
        if(!(mouseXpos)) {
            launched.moveY *= -1;
            launched.moveX *= -1;
        }
    }
}

let border = true;
function drawCircle(x, y, color, size) {
    r.fillStyle = color;
    r.beginPath();
    r.arc(x, y, 
        size, 
        0, 2 * Math.PI); 
    r.fill();

    if(border) {
        let borderColor = (parseInt("0x" + (color).replace("#", "")) - 20).toString(16);
        
        // if(!(isNaN(borderColor))) {
        r.strokeStle = "#" + borderColor;
        r.lineWidth = 4;
        r.stroke();
        // }
    }

    r.closePath();
}

function loop() {
    r.clearRect(0, 0, w, h);

    drawCircles();

    if(launched.moving) {
        launched.update();
    }
    // aiming
    else {
        aimer.draw();
    }
}