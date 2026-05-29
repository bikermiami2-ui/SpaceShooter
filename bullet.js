class Bullet {
    constructor(x, y, vy, isPlayer = true) {
        this.x = x; this.y = y; this.vy = vy;
        this.isPlayer = isPlayer;
        this.width = 4; this.height = 12;
        this.active = true;
    }
    update() {
        this.y += this.vy;
        if (this.y < -20 || this.y > window.innerHeight + 20) this.active = false;
    }
    draw(ctx) {
        ctx.fillStyle = this.isPlayer ? '#00ffff' : '#ff4444';
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }
    getBounds() { return { x: this.x - this.width/2, y: this.y - this.height/2, w: this.width, h: this.height }; }
}
