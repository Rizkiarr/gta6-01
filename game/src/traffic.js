// traffic.js - Non-player vehicles with simple AI
// All classic scripts, no modules

const Traffic = {
    vehicles: [],
    
    create(x, y, angle, targetX, targetY, routeIdx) {
        const v = Vehicle.create(x, y, Math.floor(Math.random() * Vehicle.LIST.length), 
            '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0'));
        v.angle = angle;
        v.speed = 20 + Math.random() * 30;
        v.targetX = targetX;
        v.targetY = targetY;
        v.routeIdx = routeIdx;
        v.isTraffic = true;
        this.vehicles.push(v);
        return v;
    },
    
    init() {
        this.vehicles = [];
        
        // Place vehicles along major roads
        // Main arterial: y = 650
        for (let i = 0; i < 15; i++) {
            this.create(200 + i * 120, 650, 0, 1800, 650, 0);
        }
        
        // Vertical road: x = 650
        for (let i = 0; i < 10; i++) {
            this.create(650, 200 + i * 140, Math.PI/2, 650, 1300, 1);
        }
        
        // Harbor loop
        for (let i = 0; i < 8; i++) {
            this.create(1000 + i * 50, 400, Math.PI, 1000 + i * 50, 250, 2);
        }
    },
    
    update(dt) {
        for (let v of this.vehicles) {
            this.driveVehicle(v, dt);
        }
    },
    
    driveVehicle(v, dt) {
        if (v.isTraffic) {
            // Simple lane-following AI
            const road = this.findRoad(v.x, v.y);
            if (road) {
                // Follow the road
                const targetSpeed = road.speed;
                if (v.speed < targetSpeed) {
                    v.speed += v.acceleration * 0.5 * dt;
                } else if (v.speed > targetSpeed) {
                    v.speed -= v.acceleration * 0.3 * dt;
                }
                
                // Update position
                v.x += Math.cos(v.angle) * v.speed * dt;
                v.y += Math.sin(v.angle) * v.speed * dt;
                
                // Stay in lane (small steering)
                if (Math.random() < 0.01) {
                    v.angle += (Math.random() - 0.5) * 0.1;
                }
            }
        }
    },
    
    findRoad(x, y) {
        for (let r of WORLD.ROADS) {
            // Check if near this road
            const dx = Math.abs(x - r.x - r.w/2);
            const dy = Math.abs(y - r.y - r.h/2);
            if (dx < r.w/2 + 30 && dy < r.h/2 + 30) {
                return r;
            }
        }
        return null;
    }
};