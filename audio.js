const Audio = (() => {
    let ctx = null;
    const init = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); };
    const playTone = (freq, type, duration, vol = 0.3) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    };
    return {
        init,
        shoot: () => { init(); playTone(800, 'square', 0.1, 0.2); },
        enemyShoot: () => { init(); playTone(400, 'sawtooth', 0.1, 0.15); },
        explosion: () => { init(); playTone(100, 'sawtooth', 0.3, 0.4); },
        powerup: () => { init(); playTone(600, 'sine', 0.15, 0.3); setTimeout(() => playTone(900, 'sine', 0.15, 0.3), 100); },
        hit: () => { init(); playTone(200, 'square', 0.1, 0.2); }
    };
})();
