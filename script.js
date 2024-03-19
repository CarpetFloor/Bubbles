// 18 x 9
let c;
let r;
let w, h;
const CIRCLE_SIZE = 25;
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
        if((this.x > w - CIRCLE_SIZE) || (this.x < CIRCLE_SIZE)) {
            this.moveX *= -1;
        }

        drawCircle(this.x, this.y, "orchid");
    }
};

window.onload = () => {
    c = document.querySelector("canvas");
    r = c.getContext("2d");
    w = parseInt(window.getComputedStyle(c, null).getPropertyValue("width"));
    h = parseInt(window.getComputedStyle(c, null).getPropertyValue("width"));
    c.width = w;
    c.height = h;
    
    c.addEventListener("click", launch);
    window.setInterval(loop, 1000 / 30);
}

function launch(e) {
    if(!(launched.moving)) {
        launched.moving = true;
        launched.x = (w / 2) - (CIRCLE_SIZE / 2);
        launched.y = h - (CIRCLE_SIZE / 2);

        let xdiff = e.offsetX - (w / 2);
        let ydiff = e.offsetY - h;
        
        let theta = Math.atan(ydiff / xdiff);
        
        launched.moveX = Math.cos(theta) * LAUNCH_SPEED;
        launched.moveY = Math.sin(theta) * LAUNCH_SPEED;
        
        if(e.offsetX < w / 2) {
            launched.moveY *= -1;
            launched.moveX *= -1;
        }
    }
}

function drawCircle(x, y, color) {
    r.fillStyle = color;
    r.beginPath();
    r.arc(Math.round(x), Math.round(y), 
        CIRCLE_SIZE, 
        0, 2 * Math.PI);
    r.fill();
    r.closePath();
}

function loop() {
    r.clearRect(0, 0, w, h);

    if(launched.moving) {
        launched.update();
    }
}