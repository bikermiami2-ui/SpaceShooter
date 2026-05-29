const UI = (() => {
    const getScores = () => JSON.parse(localStorage.getItem('spaceShooterScores') || '[]');
    const saveScore = (score) => {
        const scores = getScores();
        scores.push({ score, date: new Date().toLocaleDateString() });
        scores.sort((a,b) => b.score - a.score);
        localStorage.setItem('spaceShooterScores', JSON.stringify(scores.slice(0, 10)));
    };
    const drawText = (ctx, text, x, y, size = 20, color = '#fff', align = 'center') => {
        ctx.fillStyle = color; ctx.font = `${size}px "Courier New"`; ctx.textAlign = align; ctx.fillText(text, x, y);
    };
    return {
        drawHUD(ctx, score, hp, wave, w) {
            drawText(ctx, `SCORE: ${score}`, 10, 30, 18, '#0ff', 'left');
            drawText(ctx, `WAVE: ${wave}`, w - 10, 30, 18, '#ff0', 'right');
            for (let i = 0; i < hp; i++) { ctx.fillStyle = '#0f8'; ctx.fillRect(10 + i * 22, 40, 18, 18); }
        },
        drawMenu(ctx, w, h) {
            drawText(ctx, 'SPACE SHOOTER', w/2, h/2 - 60, 48, '#0ff');
            drawText(ctx, 'WASD / Arrows to Move', w/2, h/2, 20, '#aaa');
            drawText(ctx, 'SPACE to Shoot', w/2, h/2 + 30, 20, '#aaa');
            drawText(ctx, '[ Tap Left = Move | Tap Right = Shoot ]', w/2, h/2 + 65, 14, '#666');
            drawText(ctx, 'Press SPACE or Tap to Start', w/2, h/2 + 120, 24, '#ff0');
            const scores = getScores();
            if (scores.length) {
                drawText(ctx, 'HIGH SCORES', w/2, h/2 + 170, 18, '#888');
                scores.slice(0,5).forEach((s,i) => drawText(ctx, `${i+1}. ${s.score}`, w/2, h/2 + 195 + i*22, 16, '#666'));
            }
        },
        drawGameOver(ctx, score, w, h) {
            saveScore(score);
            drawText(ctx, 'GAME OVER', w/2, h/2 - 50, 48, '#f33');
            drawText(ctx, `Score: ${score}`, w/2, h/2 + 10, 28, '#fff');
            drawText(ctx, 'Press SPACE or Tap to Restart', w/2, h/2 + 70, 22, '#ff0');
        }
    };
})();
