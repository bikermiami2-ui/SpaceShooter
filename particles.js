class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.03;
        this.color = color;
        this.size = 2 + Math.random() * 3;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

const Particles = (() => {
    let particles = [];
    return {
        spawn(x, y, color = '#ffaa00', count = 15) {
            for (let i = 0; i < count; i++) particles.push(new Particle(x, y, color));
        },
        update() { particles = particles.filter(p => p.life > 0); particles.forEach(p => p.update()); },
        draw(ctx) { particles.forEach(p => p.draw(ctx)); },
        clear() { particles = []; }
    };
})();
