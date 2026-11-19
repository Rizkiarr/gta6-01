// police.js - Wanted level and police pursuit
// All classic scripts, no modules

const Police = {
    patrolCars: [],
    footOfficers: [],
    sirensOn: false,
    chaseTarget: null,
    
    init() {
        this.patrolCars = [];
        this.footOfficers = [];
        this.sirensOn = false;
        this.chaseTarget = null;
    },
    
    update(dt) {
        const stars = gameState.wantedLevel;
        
        if (stars > 0) {
            this.spawnIfNeeded(stars);
            this.updatePatrolCars(dt);
            this.updateFootOfficers(dt);
        } else {
            // Wanted level falling
            if (gameState.wantedTimer > 0) {
                gameState.wantedTimer -= dt;
                if (gameState.wantedTimer <= 0) {
                    gameState.wantedLevel = 0;
                    this.clear();
                }
            }
        }
    },
    
    spawnIfNeeded(stars) {
        // Spawn patrol cars based on wanted level
        if (stars >= 1 && this.patrolCars.length < stars) {
            const car = Vehicle.create(
                200 + Math.random() * 600, 
                100 + Math.random() * 400,
                Math.floor(Math.random() * Vehicle.LIST.length),
                '#0000FF'
            );
            car.isPolice = true;
            car.siren = true;
            car.speed = 40 + stars * 15;
            this.patrolCars.push(car);
            Audio.playSiren();
        }
        
        // Spawn foot officers at higher wanted levels
        if (stars >= 3 && Math.random() < 0.02) {
            const officer = {
                x: 100 + Math.random() * 1800,
                y: 100 + Math.random() * 1400,
                speed: 60,
                targetX: null,
                targetY: null
            };
            this.footOfficers.push(officer);
        }
    },
    
    updatePatrolCars(dt) {
        for (let i = this.patrolCars.length - 1; i >= 0; i--) {
            const car = this.patrolCars[i];
            const target = player;
            
            // Calculate distance to player
            const dx = target.x - car.x;
            const dy = target.y - car.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Move toward player
            const angle = Math.atan2(dy, dx);
            car.angle = angle;
            
            const targetSpeed = car.maxSpeed * 0.8;
            if (dist < 100) {
                car.speed = Math.min(car.speed + 20 * dt, targetSpeed);
            } else {
                car.speed = Math.min(car.speed + car.acceleration * dt, targetSpeed);
            }
            
            car.x += Math.cos(car.angle) * car.speed * dt;
            car.y += Math.sin(car.angle) * car.speed * dt;
            
            // Check for collision with player
            if (dist < 30) {
                this.handleCollision(car);
            }
            
            // Clean up if far away
            if (dist > 2000) {
                this.patrolCars.splice(i, 1);
            }
        }
    },
    
    updateFootOfficers(dt) {
        for (let i = this.footOfficers.length - 1; i >= 0; i--) {
            const o = this.footOfficers[i];
            const player = gameState.player;
            
            const dx = player.x - o.x;
            const dy = player.y - o.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                o.x += (dx / dist) * 80 * dt;
                o.y += (dy / dist) * 80 * dt;
            }
            
            // Check for collision
            if (dist < 25) {
                this.handleCollisionOfficer(o);
            }
        }
    },
    
    handleCollision(car) {
        // Ram player's vehicle
        if (playerVehicle) {
            playerVehicle.speed *= 0.5;
            player.health -= 15;
            gameState.screenShake = 15;
            Audio.playCrashSound();
        }
    },
    
    handleCollisionOfficer(officer) {
        // Tackle player on foot
        player.health -= 25;
        gameState.screenShake = 20;
        Audio.playCrashSound();
    },
    
    clear() {
        this.patrolCars = [];
        this.footOfficers = [];
    }
};