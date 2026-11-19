// hud.js - Heads-up display, minimap, health/money/wanted
// All classic scripts, no modules

const HUD = {
    canvas: null,
    miniCanvas: null,
    miniCtx: null,
    
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.miniCanvas = document.getElementById('miniCanvas');
        if (this.miniCanvas) {
            this.miniCtx = this.miniCanvas.getContext('2d');
        }
    },
    
    update() {
        this.updateStars();
        this.updateMiniMap();
    },
    
    updateStars() {
        const starsEl = document.getElementById('wantedStars');
        if (!starsEl) return;
        starsEl.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            if (i < gameState.wantedLevel) {
                star.style.background = '#e74c3c';
            } else {
                star.style.background = '#333';
            }
            starsEl.appendChild(star);
        }
    },
    
    setStars(level) {
        const starsEl = document.getElementById('wantedStars');
        if (starsEl) {
            starsEl.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                if (i < level) {
                    star.style.background = '#e74c3c';
                } else {
                    star.style.background = '#333';
                }
                starsEl.appendChild(star);
            }
        }
    },
    
    updateMiniMap() {
        if (!this.miniCtx) return;
        
        const ctx = this.miniCtx;
        const size = 150;
        ctx.clearRect(0, 0, size, size);
        
        // Draw map outline
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, size, size);
        
        // Scale factor
        const scale = size / 400;
        
        // Draw roads
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2 * scale;
        for (let r of WORLD.ROADS) {
            ctx.beginPath();
            ctx.moveTo((r.x * scale), (r.y * scale));
            ctx.lineTo(((r.x + r.w) * scale), ((r.y + r.h) * scale));
            ctx.stroke();
        }
        
        // Draw player
        ctx.fillStyle = '#00FF00';
        const pl = gameState.player || {x: 0, y: 0, angle: 0};
        const px = (pl.x * scale);
        const py = (pl.y * scale);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw player direction
        ctx.strokeStyle = '#00FF00';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(pl.angle) * 10, py + Math.sin(pl.angle) * 10);
        ctx.stroke();
        
        // Draw police
        ctx.fillStyle = '#FF0000';
        for (let car of Police.patrolCars) {
            const cx = car.x * scale;
            const cy = car.y * scale;
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw mission marker
        if (Missions.activeMission) {
            ctx.fillStyle = '#FFFF00';
            const mx = Missions.activeMission.location.x * scale;
            const my = Missions.activeMission.location.y * scale;
            ctx.beginPath();
            ctx.arc(mx, my, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};