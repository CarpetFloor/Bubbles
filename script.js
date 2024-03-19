// 18 x 9
let c;
let r;
let w, h;
const CIRCLE_SIZE = 25;
const LAUNCH_SPEED = 15;
let currentColor = "orchid";
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
        if((this.x > w - CIRCLE_SIZE) || (this.x < CIRCLE_SIZE)) {
            this.moveX *= -1;
        }

        drawCircle(this.x, this.y, 
            currentColor, CIRCLE_SIZE);
    }
};
let aimer = {
    smallerSize: CIRCLE_SIZE / 3, 
    spacing: 23, 
    count: 3, 
    draw: function() {
        let x = (w / 2) - (CIRCLE_SIZE / 2);
        let y = h - (CIRCLE_SIZE / 2);

        let firstMoveX = Math.cos(mouseAngle) * (CIRCLE_SIZE / 1.75);
        let firstMoveY = Math.sin(mouseAngle) * (CIRCLE_SIZE / 1.75);

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
            currentColor, CIRCLE_SIZE);

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

window.onload = () => {
    c = document.querySelector("canvas");
    r = c.getContext("2d");
    w = parseInt(window.getComputedStyle(c, null).getPropertyValue("width"));
    h = parseInt(window.getComputedStyle(c, null).getPropertyValue("width"));
    c.width = w;
    c.height = h;
    
    c.addEventListener("mousemove", setMouseAngle);
    c.addEventListener("click", launch);
    window.setInterval(loop, 1000 / 30);
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
        launched.x = (w / 2) - (CIRCLE_SIZE / 2);
        launched.y = h - (CIRCLE_SIZE / 2);
        
        launched.moveX = Math.cos(mouseAngle) * LAUNCH_SPEED;
        launched.moveY = Math.sin(mouseAngle) * LAUNCH_SPEED;
        
        if(!(mouseXpos)) {
            launched.moveY *= -1;
            launched.moveX *= -1;
        }
    }
}

function drawCircle(x, y, color, size) {
    r.fillStyle = color;
    r.beginPath();
    r.arc(Math.round(x), Math.round(y), 
        size, 
        0, 2 * Math.PI);
    r.fill();
    r.closePath();
}

function loop() {
    r.clearRect(0, 0, w, h);

    if(launched.moving) {
        launched.update();
    }
    // aiming
    else {
        aimer.draw();
    }
}