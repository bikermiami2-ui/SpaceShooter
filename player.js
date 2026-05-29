class Player {
    constructor() {
        this.width = 40; this.height = 40;
        this.reset();
    }
    reset() {
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight - 80;
        this.hp = 3; this.maxHp = 3;
        this.speed = 5;
        this.shootCooldown = 0;
        this.doubleShot = false; this.doubleShotTimer = 0;
        this.shield = false; this.shieldTimer = 0;
        this.invulnerable = 0;
    }
    update(keys, dt) {
        if (keys['ArrowLeft'] || keys['a']) this.x -= this.speed;
        if (keys['ArrowRight'] || keys['d']) this.x += this.speed;
        if (keys['ArrowUp'] || keys['w']) this.y -= this.speed;
        if (keys['ArrowDown'] || keys['s']) this.y += this.speed;
        this.x = Math.max(this.width/2, Math.min(window.innerWidth - this.width/2, this.x));
        this.y = Math.max(this.height/2, Math.min(window.innerHeight - this.height/2, this.y));
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.doubleShotTimer > 0) { this.doubleShotTimer--; if (this.doubleShotTimer <= 0) this.doubleShot = false; }
        if (this.shieldTimer > 0) { this.shieldTimer--; if (this.shieldTimer <= 0) this.shield = false; }
        if (this.invulnerable > 0) this.invulnerable--;
    }
    shoot() {
        if (this.shootCooldown > 0) return [];
        this.shootCooldown = 12;
        Audio.shoot();
        if (this.doubleShot) return [new Bullet(this.x - 10, this.y - 20, -10), new Bullet(this.x + 10, this.y - 20, -10)];
        return [new Bullet(this.x, this.y - 20, -10)];
    }
    takeDamage() {
        if (this.invulnerable > 0 || this.shield) return false;
        this.hp--;
        this.invulnerable = 60;
        Audio.hit();
        return this.hp <= 0;
    }
    applyPowerup(type) {
        Audio.powerup();
        if (type === 'double') { this.doubleShot = true; this.doubleShotTimer = 600; }
        else if (type === 'shield') { this.shield = true; this.shieldTimer = 480; }
        else if (type === 'heal') { this.hp = Math.min(this.maxHp, this.hp + 1); }
    }
    draw(ctx) {
        if (this.invulnerable > 0 && Math.floor(this.invulnerable / 4) % 2 === 0) return;
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.height/2);
        ctx.lineTo(this.x - this.width/2, this.y + this.height/2);
        ctx.lineTo(this.x, this.y + this.height/4);
        ctx.lineTo(this.x + this.width/2, this.y + this.height/2);
        ctx.closePath(); ctx.fill();
        if (this.shield) {
            ctx.strokeStyle = `rgba(0,200,255,${0.5 + Math.sin(Date.now()/100)*0.3})`;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(this.x, this.y, 30, 0, Math.PI*2); ctx.stroke();
        }
    }
    getBounds() { return { x: this.x - this.width/3, y: this.y - this.height/3, w: this.width*2/3, h: this.height*2/3 }; }
}
