class Enemy {
    constructor(type, wave) {
        this.type = type;
        this.width = type === 'tank' ? 50 : type === 'fast' ? 25 : 35;
        this.height = type === 'tank' ? 50 : type === 'fast' ? 25 : 35;
        this.x = Math.random() * (window.innerWidth - this.width) + this.width/2;
        this.y = -this.height;
        this.hp = type === 'tank' ? 5 + wave : type === 'fast' ? 1 + Math.floor(wave/3) : 2 + Math.floor(wave/2);
        this.speed = type === 'fast' ? 4 + wave * 0.3 : type === 'tank' ? 1 + wave * 0.1 : 2 + wave * 0.2;
        this.score = type === 'tank' ? 50 : type === 'fast' ? 30 : 10;
        this.color = type === 'tank' ? '#ff6600' : type === 'fast' ? '#ff00ff' : '#ff3333';
        this.active = true;
        this.shootTimer = Math.random() * 120;
        this.canShoot = type !== 'fast' && wave >= 2;
    }
    update() {
        this.y += this.speed;
        if (this.y > window.innerHeight + 60) this.active = false;
        if (this.canShoot) {
            this.shootTimer--;
            if (this.shootTimer <= 0) { this.shootTimer = 100 + Math.random() * 100; return true; }
        }
        return false;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.type === 'tank') {
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        } else {
            ctx.moveTo(this.x, this.y + this.height/2);
            ctx.lineTo(this.x - this.width/2, this.y - this.height/2);
            ctx.lineTo(this.x + this.width/2, this.y - this.height/2);
            ctx.closePath(); ctx.fill();
        }
        // HP bar
        if (this.hp > 1) {
            ctx.fillStyle = '#333'; ctx.fillRect(this.x - 15, this.y - this.height/2 - 8, 30, 4);
            ctx.fillStyle = '#0f0'; ctx.fillRect(this.x - 15, this.y - this.height/2 - 8, 30 * Math.min(1, this.hp / (this.type === 'tank' ? 8 : 4)), 4);
        }
    }
    getBounds() { return { x: this.x - this.width/2, y: this.y - this.height/2, w: this.width, h: this.height }; }
}
