// main.js - Game entry point, game loop, input handling, state
// All classic scripts, no modules

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;
let running = false;

const gameState = {
    player: null,
    playerVehicle: null,
    keys: {},
    wantedLevel: 0,
    money: 0,
    health: 100,
    alive: true,
    isInVehicle: false,
    cameraMode: 'foot',
    gameOver: false,
    screenShake: 0,
    combatCooldown: 0,
    wantedTimer: 0,
    unlockedDistricts: ['Downtown'],
    ownedVehicles: [],
    missionActive: false,
    musicTime: 0
};

let player = null;
let playerVehicle = null;

// Check for shot parameter BEFORE anything else
const params = new URLSearchParams(window.location.search);
const shotMode = params.get('shot');

// Initialize dependencies first
var vehiclesArray = vehicles || [];

// Hide start screen immediately for shot mode using class
if (shotMode) {
    var startScreen = document.getElementById('startScreen');
    if (startScreen) startScreen.classList.add('hidden');
}

// Player object factory
function createPlayer() {
    return {
        x: 0,
        y: 0,
        angle: 0,
        speed: 0,
        maxSpeed: 100,
        health: 100,
        alive: true,
        init: function() {
            this.x = 400;
            this.y = 350;
            this.angle = 0;
            this.speed = 0;
            this.maxSpeed = 100;
            this.health = 100;
            this.alive = true;
        },
        update: function(dt) {
            if (!this.alive) return;
            
            const keys = gameState.keys;
            let moving = false;
            let targetAngle = this.angle;
            
            if (keys.ArrowUp || keys.KeyW) {
                this.speed = Math.min(this.speed + 6 * dt, this.maxSpeed);
                moving = true;
            }
            if (keys.ArrowDown || keys.KeyS) {
                this.speed = Math.max(this.speed - 6 * dt, 0);
                moving = true;
            }
            
            if (keys.ArrowLeft || keys.KeyA) {
                targetAngle -= 3 * dt;
                moving = true;
            }
            if (keys.ArrowRight || keys.KeyD) {
                targetAngle += 3 * dt;
                moving = true;
            }
            
            let diff = ((targetAngle - this.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
            this.angle += diff * 0.1;
            
            this.x += Math.cos(this.angle) * this.speed * dt;
            this.y += Math.sin(this.angle) * this.speed * dt;
            
            this.x = Math.max(0, Math.min(WORLD.WIDTH, this.x));
            this.y = Math.max(0, Math.min(WORLD.HEIGHT, this.y));
            
            if (!moving && this.speed > 0) {
                this.speed *= 0.9;
            }
        },
        takeDamage: function(amount) {
            this.health -= amount;
            if (this.health <= 0) {
                this.die();
            }
        },
        die: function() {
            this.alive = false;
            this.speed = 0;
            gameState.gameOver = true;
            var wasted = document.getElementById('wastedScreen');
            if (wasted) wasted.style.display = 'flex';
        }
    };
}

// Populate vehicles globally
function populateVehicles() {
    vehiclesArray.length = 0;
    
    for (let i = 0; i < 25; i++) {
        const v = Vehicle.create(
            200 + Math.random() * 1600,
            200 + Math.random() * 1200,
            Math.floor(Math.random() * Vehicle.LIST.length),
            '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')
        );
        v.isTraffic = Math.random() < 0.6;
        v.inPlayerHands = false;
        vehiclesArray.push(v);
    }
}

// Set wanted stars in HUD
function setStars(count) {
    const starsEl = document.getElementById('wantedStars');
    if (!starsEl) return;
    starsEl.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('div');
        star.className = i < count ? 'star filled' : 'star empty';
        starsEl.appendChild(star);
    }
}

// Stage scenes - set up game state for screenshots
function stageScene() {
    if (shotMode === 'chase') {
        gameState.wantedLevel = 3;
        gameState.money = 2500;
        gameState.health = 80;
        
        player.x = 800;
        player.y = 500;
        player.angle = 0.5;
        
        playerVehicle = Vehicle.create(790, 490, 1, '#E74C3C');
        playerVehicle.speed = 80;
        playerVehicle.inPlayerHands = true;
        playerVehicle.angle = 0.5;
        playerVehicle.maxSpeed = 180;
        playerVehicle.acceleration = 1.2;
        playerVehicle.handling = 0.9;
        gameState.isInVehicle = true;
        gameState.cameraMode = 'vehicle';
        
        Traffic.create(700, 450, 0, 1800, 450, 0);
        Traffic.create(750, 450, 0, 1800, 450, 0);
        Traffic.create(800, 450, 0, 1800, 450, 0);
        
        const pc1 = Vehicle.create(600, 420, 3, '#0000FF');
        pc1.isPolice = true;
        pc1.siren = true;
        pc1.speed = 70;
        pc1.maxSpeed = 120;
        Police.patrolCars.push(pc1);
        
        const pc2 = Vehicle.create(1000, 550, 2, '#0000FF');
        pc2.isPolice = true;
        pc2.speed = 60;
        pc2.maxSpeed = 120;
        Police.patrolCars.push(pc2);
        
        // Update HUD for chase
        document.getElementById('money').textContent = '$2,500';
        document.getElementById('health').textContent = '80%';
        document.getElementById('speed').textContent = '85 MPH';
        
    } else if (shotMode === 'street') {
        player.x = 400;
        player.y = 350;
        player.angle = 0;
        gameState.cameraMode = 'foot';
        gameState.money = 1200;
        gameState.wantedLevel = 0;
        gameState.health = 100;
        
        for (let i = 0; i < 8; i++) {
            Traffic.create(300 + i * 100, 650, 0, 1800, 650, 0);
        }
        
        Traffic.create(650, 300, Math.PI/2, 650, 100, 1);
        Traffic.create(650, 500, Math.PI/2, 650, 1300, 1);
        
        // Update HUD for street
        document.getElementById('health').textContent = '100%';
        document.getElementById('money').textContent = '$1,200';
        document.getElementById('speed').textContent = '0 MPH';
        
    } else if (shotMode === 'mission') {
        player.x = 1000;
        player.y = 280;
        player.angle = -0.5;
        gameState.isInVehicle = true;
        gameState.cameraMode = 'vehicle';
        gameState.money = 500;
        gameState.wantedLevel = 1;
        gameState.health = 100;
        
        playerVehicle = Vehicle.create(990, 270, 1, '#3498DB');
        playerVehicle.speed = 100;
        playerVehicle.inPlayerHands = true;
        playerVehicle.angle = -0.5;
        playerVehicle.maxSpeed = 180;
        playerVehicle.acceleration = 1.2;
        playerVehicle.handling = 0.9;
        
        const pc = Vehicle.create(1100, 350, 2, '#0000FF');
        pc.isPolice = true;
        pc.speed = 60;
        pc.siren = true;
        pc.maxSpeed = 120;
        Police.patrolCars.push(pc);
        
        Traffic.create(900, 280, -0.5, 700, 280, 0);
        
        // Update HUD for mission
        document.getElementById('health').textContent = '100%';
        document.getElementById('money').textContent = '$500';
        document.getElementById('speed').textContent = '95 MPH';
        document.getElementById('objective').textContent = 'ESCORT - 3 MINUTES REMAINING';
        
        // Show 1 star
        setStars(1);
        
        // Show mission marker
        var marker = document.createElement('circle');
        marker.setAttribute('cx', '1100');
        marker.setAttribute('cy', '150');
        marker.setAttribute('r', '8');
        marker.setAttribute('fill', '#FFFF00');
        document.getElementById('gameWorld').appendChild(marker);
        
        var mtext = document.createElement('text');
        mtext.setAttribute('x', '1100');
        mtext.setAttribute('y', '155');
        mtext.setAttribute('font-size', '10');
        mtext.setAttribute('text-anchor', 'middle');
        mtext.setAttribute('fill', '#000');
        mtext.textContent = 'M';
        document.getElementById('gameWorld').appendChild(mtext);
    }
    
    gameState.wantedLevel = gameState.wantedLevel || 0;
    if (gameState.wantedLevel > 0) {
        setStars(gameState.wantedLevel);
    }
}

// Render function - draw everything on canvas
function render() {
    // Clear with day lighting gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');  // Light sky
    gradient.addColorStop(0.5, '#4FC3F7');  // Horizon blue
    gradient.addColorStop(1, '#228B22');  // Ground
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sun
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Translate to camera
    ctx.save();
    ctx.translate(canvas.width/2 - gameState.cameraX, canvas.height/2 - gameState.cameraY);
    
    drawWorld();
    
    ctx.restore();
}

function drawWorld() {
    // Draw roads (dark gray)
    ctx.fillStyle = '#555';
    for (let r of WORLD.ROADS) {
        ctx.fillRect(r.x, r.y, r.w, r.h);
    }
    
    // Draw sidewalks (light gray)
    ctx.fillStyle = '#888';
    for (let r of WORLD.ROADS) {
        ctx.fillRect(r.x - 5, r.y - 5, r.w, 5);
        ctx.fillRect(r.x - 5, r.y + r.h, r.w, 5);
    }
    
    // Draw buildings
    ctx.fillStyle = '#444';
    for (let b of WORLD.BUILDINGS) {
        ctx.fillRect(b.x, b.y, b.w, b.h);
        
        // Building windows
        ctx.fillStyle = '#666';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.fillRect(b.x + 10 + i * 10, b.y + 10 + j * 10, 6, 6);
            }
        }
        ctx.fillStyle = '#444';
    }
    
    // Draw parks (green)
    ctx.fillStyle = '#228B22';
    for (let p of WORLD.PARKS) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
    }
    
    // Draw beaches (sand)
    ctx.fillStyle = '#FFE4B5';
    for (let b of WORLD.BEACHES) {
        ctx.fillRect(b.x, b.y, b.w, b.h);
    }
    
    // Draw pedestrian paths
    ctx.fillStyle = '#777';
    ctx.fillRect(600, 1350, 400, 10);
    
    // Draw player
    if (gameState.isInVehicle && playerVehicle) {
        const v = playerVehicle;
        ctx.fillStyle = v.color;
        ctx.fillRect(v.x, v.y, v.w, v.h);
        
        // Driver
        ctx.fillStyle = '#00AA00';
        ctx.fillRect(v.x + v.w/2 - 3, v.y + v.h/2 - 2, 6, 4);
    } else {
        // Player on foot
        ctx.fillStyle = '#00AA00';
        ctx.fillRect(player.x - 4, player.y - 8, 8, 16);
    }
    
    // Draw traffic vehicles
    for (let v of Traffic.vehicles) {
        if (!v.isTraffic) continue;
        ctx.fillStyle = '#888';
        ctx.fillRect(v.x, v.y, v.w, v.h);
        ctx.fillStyle = '#AAAAAA';
        ctx.fillRect(v.x + 2, v.y + 2, v.w - 4, v.h - 4);
    }
    
    // Draw police
    for (let car of Police.patrolCars) {
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(car.x, car.y, car.w, car.h);
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(car.x + 5, car.y + 5, 6, 6);
    }
    
    // Draw mission markers
    const available = Missions.getAvailableMissions ? Missions.getAvailableMissions() : [];
    for (let m of available) {
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(m.location.x, m.location.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('M', m.location.x, m.location.y + 3);
    }
}

// Input handling
window.addEventListener('keydown', function(e) {
    gameState.keys[e.code] = true;
    
    if (e.code === 'Escape') {
        togglePause();
    }
    
    e.preventDefault();
});

window.addEventListener('keyup', function(e) {
    gameState.keys[e.code] = false;
});

function togglePause() {
    if (gameState.gameOver) return;
    var menu = document.getElementById('pauseMenu');
    menu.classList.toggle('hidden');
}

// Main initialization function
function init() {
    // Initialize game systems
    Audio.init();
    WORLD.init();
    Traffic.init();
    Police.init();
    Missions.init();
    HUD.init();
    
    // Create player
    player = createPlayer();
    gameState.player = player;
    player.init();
    player.x = 400;
    player.y = 350;
    
    // Populate vehicles
    populateVehicles();
    
    // Initialize camera
    gameState.cameraX = player.x;
    gameState.cameraY = player.y;
    
    // Update HUD
    document.getElementById('health').textContent = '100%';
    document.getElementById('money').textContent = '$0';
    
    // Run initial render
    render();
}

// Start on button click (normal mode)
if (!shotMode) {
    document.getElementById('startBtn').addEventListener('click', function() {
        document.getElementById('startScreen').classList.add('hidden');
        init();
    });
}

// Handle modals
document.getElementById('resumeBtn').addEventListener('click', togglePause);
document.getElementById('continueBtn').addEventListener('click', function() {
    document.getElementById('missionComplete').classList.add('hidden');
});
document.getElementById('restartBtn').addEventListener('click', function() {
    location.reload();
});
document.getElementById('wastedRestartBtn').addEventListener('click', function() {
    location.reload();
});

// Shot mode initialization - runs at load time
if (shotMode) {
    // Initialize systems synchronously
    Audio.init();
    WORLD.init();
    Traffic.init();
    Police.init();
    Missions.init();
    HUD.init();
    
    // Create player
    player = createPlayer();
    gameState.player = player;
    player.init();
    player.x = 400;
    player.y = 350;
    
    // Populate vehicles
    populateVehicles();
    
    // Initialize camera
    gameState.cameraX = player.x;
    gameState.cameraY = player.y;
    
    // Update HUD elements immediately
    document.getElementById('health').textContent = '100%';
    document.getElementById('money').textContent = '$0';
    if (HUD.setStars) HUD.setStars(0);
    
    // Stage the requested scene
    stageScene();
    
    // Render frame synchronously for screenshot
    render();
    
    // Update minimap
    if (HUD.updateMiniMap) {
        HUD.updateMiniMap();
    }
}