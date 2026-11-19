// missions.js - Mission system with story and objectives
// All classic scripts, no modules

const Missions = {
    LIST: {
        'find_drift': {
            name: 'Easy Drift',
            location: { x: 400, y: 350 },
            description: 'Drift for 10 seconds in the parking lot near District Police Station',
            rewards: { money: 500, unlock: 'sports_car' },
            prerequisites: [],
            availableFrom: 0
        },
        'speed_run': {
            name: 'Harbor Speed Run',
            location: { x: 1000, y: 200 },
            description: 'Reach 120 mph on Coastal Highway without hitting anything',
            rewards: { money: 1000, unlock: 'motorcycle' },
            prerequisites: ['find_drift'],
            availableFrom: 1
        },
        'cargo_heist': {
            name: 'Cargo Heist',
            location: { x: 1400, y: 550 },
            description: 'Steal the cargo truck from Industrial District and deliver to Harbor Docks',
            rewards: { money: 2500, unlock: 'suv' },
            prerequisites: ['speed_run'],
            availableFrom: 2
        },
        'final_escape': {
            name: 'Federal Investigation',
            location: { x: 500, y: 100 },
            description: 'Escape from Downtown with maximum wanted level for 60 seconds',
            rewards: { money: 5000 },
            prerequisites: ['cargo_heist'],
            availableFrom: 3
        }
    },
    
    activeMission: null,
    completed: [],
    currentProgress: 0,
    
    init() {
        this.activeMission = null;
        this.completed = this.loadProgress();
        this.currentProgress = 0;
    },
    
    getAvailableMissions() {
        const unlocked = gameState.unlockedDistricts || ['Downtown'];
        const result = [];
        
        for (let [id, mission] of Object.entries(this.LIST)) {
            if (this.completed.includes(id)) continue;
            if (!mission.prerequisites.every(p => this.completed.includes(p))) continue;
            
            // Check if in an unlocked district
            const dist = WORLD.DISTRICTS.find(d => 
                mission.location.x > d.x && mission.location.x < d.x + d.w &&
                mission.location.y > d.y && mission.location.y < d.y + d.h
            );
            if (dist && unlocked.includes(dist.name)) {
                result.push({ id, ...mission });
            }
        }
        
        return result;
    },
    
    startMission(id) {
        const mission = this.LIST[id];
        if (!mission) return false;
        
        // Check prerequisites
        if (!mission.prerequisites.every(p => this.completed.includes(p))) {
            return false;
        }
        
        this.activeMission = { id, ...mission, progress: 0 };
        gameState.missionActive = true;
        this.updateHUD();
        return true;
    },
    
    update(dt) {
        if (!this.activeMission) return;
        
        // Update mission progress based on current state
        const m = this.activeMission;
        this.checkProgress(m, dt);
    },
    
    checkProgress(m, dt) {
        if (m.id === 'find_drift') {
            // Check if drifting (player in car, speeding, sharp turns)
            if (playerVehicle && Math.abs(playerVehicle.speed - playerVehicle.maxSpeed) < 30) {
                // High speed
                if (playerVehicle.steering > 0.1) {
                    m.progress += dt * 0.5;
                    if (m.progress >= 10) this.complete(m.id);
                }
            }
        }
        
        if (m.id === 'speed_run') {
            if (playerVehicle && playerVehicle.speed >= 120) {
                m.progress += dt * 2;
                if (m.progress >= 120) this.complete(m.id);
            }
        }
        
        if (m.id === 'cargo_heist') {
            // Check if near destination
            const dist = Math.sqrt(
                Math.pow(player.x - 1200) + Math.pow(player.y - 550)
            );
            if (dist < 50) {
                this.complete(m.id);
            }
        }
        
        if (m.id === 'final_escape') {
            if (gameState.wantedLevel >= 4) {
                m.progress += dt;
                if (m.progress >= 60) this.complete(m.id);
            }
        }
        
        this.updateHUD();
    },
    
    complete(id) {
        const m = this.activeMission;
        if (!m || m.id !== id) return;
        
        this.completed.push(id);
        this.activeMission = null;
        gameState.missionActive = false;
        gameState.money += m.rewards.money;
        
        // Unlock rewards
        if (m.rewards.unlock) {
            this.unlockVehicle(m.rewards.unlock);
        }
        
        this.saveProgress();
        
        // Show completion screen
        document.getElementById('missionReward').textContent = `Reward: $${m.rewards.money}`;
        document.getElementById('missionComplete').classList.remove('hidden');
    },
    
    unlockVehicle(type) {
        if (!gameState.ownedVehicles) gameState.ownedVehicles = [];
        if (!gameState.ownedVehicles.includes(type)) {
            gameState.ownedVehicles.push(type);
        }
    },
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('neoHarborSave');
            if (saved) {
                const data = JSON.parse(saved);
                return data.completed || [];
            }
        } catch(e) {}
        return [];
    },
    
    saveProgress() {
        try {
            const data = {
                completed: this.completed,
                money: gameState.money || 0,
                ownedVehicles: gameState.ownedVehicles || [],
                unlockedDistricts: gameState.unlockedDistricts || ['Downtown']
            };
            localStorage.setItem('neoHarborSave', JSON.stringify(data));
        } catch(e) {}
    },
    
    updateHUD() {
        const obj = document.getElementById('objective');
        if (this.activeMission) {
            obj.textContent = `MISSION: ${this.activeMission.name} - ${this.activeMission.description} (${Math.floor(this.activeMission.progress * 100) / 100}s)`;
        } else {
            const available = this.getAvailableMissions();
            if (available.length > 0) {
                obj.textContent = `MISSION AVAILABLE: ${available[0].name} near ${WORLD.DISTRICTS[0].name}`;
            } else {
                obj.textContent = 'Press E near a mission marker to start';
            }
        }
    }
};