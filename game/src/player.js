// player.js - Player character, movement, combat, vehicle entry
// All classic scripts, no modules

const Player = {
    x: 100,
    y: 100,
    angle: 0,
    speed: 0,
    maxSpeed: 100,
    health: 100,
    alive: true,
    
    init() {
        this.x = 400;
        this.y = 350;
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = 100;
        this.health = 100;
        this.alive = true;
    },
    
    update(dt) {
        if (!this.alive) return;
        
        const keys = gameState.keys;
        let moving = false;
        let targetAngle = this.angle;
        
        // Movement
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
        
        // Smooth angle rotation
        let diff = ((targetAngle - this.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        this.angle += diff * 0.1;
        
        if (Math.abs(diff) > 0.01) moving = true;
        
        // Update position
        this.x += Math.cos(this.angle) * this.speed * dt;
        this.y += Math.sin(this.angle) * this.speed * dt;
        
        // Clamp to world
        this.x = Math.max(0, Math.min(WORLD.WIDTH, this.x));
        this.y = Math.max(0, Math.min(WORLD.HEIGHT, this.y));
        
        // Apply friction when not moving
        if (!moving && this.speed > 0) {
            this.speed *= 0.9;
        }
        
        // Check for vehicle entry
        if (keys.KeyE) {
            this.tryEnterVehicle();
        }
        
        // Check for combat
        if (keys.Space && gameState.combatCooldown <= 0) {
            this.attack();
            gameState.combatCooldown = 0.5;
        }
        
        // Combat cooldown
        if (gameState.combatCooldown > 0) {
            gameState.combatCooldown -= dt;
        }
        
        // Update HUD
        HUD.update();
    },
    
    tryEnterVehicle() {
        // Find nearby parked vehicle
        for (let v of vehicles) {
            const dx = v.x - this.x;
            const dy = v.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 30 && !v.inPlayerHands && !v.isTraffic) {
                // Enter vehicle
                playerVehicle = v;
                v.inPlayerHands = true;
                v.driverAge = true;
                gameState.isInVehicle = true;
                gameState.cameraMode = 'vehicle';
                v.x = this.x - v.w/2;
                v.y = this.y - v.h/2;
                return;
            }
        }
        
        // Try to exit vehicle
        if (playerVehicle) {
            playerVehicle.inPlayerHands = false;
            playerVehicle = null;
            this.x += 30;
            this.y += 30;
            gameState.isInVehicle = false;
            gameState.cameraMode = 'foot';
        }
    },
    
    attack() {
        // Simple melee attack
        if (gameState.isInVehicle) {
            // Horn as "attack" in vehicle
            Audio.playHorns();
        } else {
            // Melee - check nearby traffic
            for (let v of Traffic.vehicles) {
                const dx = v.x - this.x;
                const dy = v.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 25) {
                    v.speed *= 0.3;
                    Audio.playCrashSound();
                }
            }
        }
    },
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    },
    
    die() {
        player.alive = false;
        this.speed = 0;
        // Check if died in vehicle or on foot
        if (playerVehicle) {
            document.getElementById('wastedScreen').classList.remove('hidden');
        } else {
            document.getElementById('bustedScreen').classList.remove('hidden');
        }
        gameState.gameOver = true;
    }
};

const player = new Player();