(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let W, H;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize); resize();

    // Stars background
    const stars = Array.from({length: 150}, () => ({
        x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        s: Math.random() * 2 + 0.5, sp: Math.random() * 2 + 0.5
    }));

    // Input
    const keys = {};
    let tapShoot = false, tapMoveX = null;
    window.addEventListener('keydown', e => { keys[e.key] = true; if (e.code === 'Space') keys[' '] = true; });
    window.addEventListener('keyup', e => { keys[e.key] = false; if (e.code === 'Space') keys[' '] = false; });
    canvas.addEventListener('touchstart', e => {
        e.preventDefault(); Audio.init();
        for (const t of e.changedTouches) {
            if (t.clientX < W/2) tapMoveX = t.clientX;
            else tapShoot = true;
        }
    }, {passive: false});
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        for (const t of e.changedTouches) {
            if (t.clientX < W/2) tapMoveX = t.clientX;
        }
    }, {passive: false});
    canvas.addEventListener('touchend', e => {
        e.preventDefault();
        if (e.changedTouches.length === 0) { tapMoveX = null; tapShoot = false; }
    }, {passive: false});

    // Game state
    let state = 'menu'; // menu, playing, gameover
    let player, bullets, enemies, powerups, score, wave, waveTimer, spawnTimer, difficulty;

    const startGame = () => {
        Audio.init();
        player = new Player();
        bullets = []; enemies = []; powerups = [];
        score = 0; wave = 1; waveTimer = 0; spawnTimer = 0; difficulty = 1;
        Particles.clear();
        state = 'playing';
    };

    const rectsOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    const spawnEnemy = () => {
        const r = Math.random();
        const type = r < 0.15 ? 'tank' : r < 0.4 ? 'fast' : 'normal';
        enemies.push(new Enemy(type, wave));
    };

    const spawnPowerup = (x, y) => {
        if (Math.random() > 0.12) return;
        const types = ['double', 'shield', 'heal'];
        const type = types[Math.floor(Math.random() * types.length)];
        powerups.push({ x, y, type, vy: 2, size: 15, active: true });
    };

    // Main loop
    const loop = () => {
        requestAnimationFrame(loop);
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

        // Draw stars
        stars.forEach(s => {
            s.y += s.sp; if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
            ctx.fillStyle = `rgba(255,255,255,${s.s/3})`; ctx.fillRect(s.x, s.y, s.s, s.s);
        });

        if (state === 'menu') { UI.drawMenu(ctx, W, H); if (keys[' ']) startGame(); return; }
        if (state === 'gameover') { UI.drawGameOver(ctx, score, W, H); if (keys[' ']) { keys[' '] = false; startGame(); } return; }

        // Mobile movement override
        if (tapMoveX !== null) {
            const diff = tapMoveX - player.x;
            if (Math.abs(diff) > 5) { keys['ArrowRight'] = diff > 0; keys['ArrowLeft'] = diff < 0; }
            else { keys['ArrowRight'] = false; keys['ArrowLeft'] = false; }
        }

        player.update(keys);
        if ((keys[' '] || tapShoot) && state === 'playing') {
            const newBullets = player.shoot();
            bullets.push(...newBullets);
            tapShoot = false;
        }

        // Wave management
        waveTimer++;
        spawnTimer++;
        const spawnRate = Math.max(20, 60 - wave * 3);
        if (spawnTimer >= spawnRate) { spawnTimer = 0; spawnEnemy(); }
        if (waveTimer > 600 + wave * 100) { wave++; waveTimer = 0; }

        // Update bullets
        bullets.forEach(b => b.update());
        bullets = bullets.filter(b => b.active);

        // Update enemies
        enemies.forEach(e => {
            const shouldShoot = e.update();
            if (shouldShoot) { bullets.push(new Bullet(e.x, e.y + e.height/2, 5, false)); Audio.enemyShoot(); }
        });

        // Bullet-enemy collisions
        bullets.filter(b => b.isPlayer && b.active).forEach(b => {
            enemies.forEach(e => {
                if (e.active && rectsOverlap(b.getBounds(), e.getBounds())) {
                    b.active = false; e.hp--;
                    if (e.hp <= 0) {
                        e.active = false; score += e.score;
                        Particles.spawn(e.x, e.y, e.color, 20);
                        Audio.explosion();
                        spawnPowerup(e.x, e.y);
                    }
                }
            });
        });

        // Bullet-player collisions
        bullets.filter(b => !b.isPlayer && b.active).forEach(b => {
            if (rectsOverlap(b.getBounds(), player.getBounds())) {
                b.active = false;
                if (player.takeDamage()) { state = 'gameover'; Particles.spawn(player.x, player.y, '#00ff88', 40); Audio.explosion(); }
            }
        });

        // Enemy-player collisions
        enemies.forEach(e => {
            if (e.active && rectsOverlap(e.getBounds(), player.getBounds())) {
                e.active = false; Particles.spawn(e.x, e.y, e.color, 15); Audio.explosion();
                if (player.takeDamage()) { state = 'gameover'; Particles.spawn(player.x, player.y, '#00ff88', 40); }
            }
        });
        enemies = enemies.filter(e => e.active);

        // Powerups
        powerups.forEach(p => {
            p.y += p.vy; if (p.y > H + 20) p.active = false;
            if (p.active && rectsOverlap({x: p.x-p.size, y: p.y-p.size, w: p.size*2, h: p.size*2}, player.getBounds())) {
                p.active = false; player.applyPowerup(p.type);
            }
        });
        powerups = powerups.filter(p => p.active);

        Particles.update();

        // Draw everything
        powerups.forEach(p => {
            const colors = { double: '#ffff00', shield: '#00ccff', heal: '#00ff00' };
            const labels = { double: 'D', shield: 'S', heal: '+' };
            ctx.fillStyle = colors[p.type];
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.font = 'bold 14px Courier New'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(labels[p.type], p.x, p.y);
        });
        bullets.forEach(b => b.draw(ctx));
        enemies.forEach(e => e.draw(ctx));
        player.draw(ctx);
        Particles.draw(ctx);
        UI.drawHUD(ctx, score, player.hp, wave, W);
    };

    // Handle tap to start/restart
    canvas.addEventListener('touchstart', () => {
        if (state === 'menu' || state === 'gameover') startGame();
    }, {once: false});

    loop();
})();
