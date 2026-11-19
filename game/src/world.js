// world.js - Neo Harbor city world, districts, terrain
// All classic scripts, no modules
// 12 distinct districts with roads, parks, and beaches

const WORLD = {
    WIDTH: 2000,
    HEIGHT: 1500,
    
    DISTRICTS: [
        { name: 'Downtown', x: 500, y: 200, w: 400, h: 300, color: '#8B4513' },
        { name: 'Harbor', x: 900, y: 150, w: 300, h: 250, color: '#4682B4' },
        { name: 'West Beach', x: 1200, y: 100, w: 350, h: 200, color: '#228B22' },
        { name: 'Oakwood', x: 400, y: 500, w: 350, h: 250, color: '#654321' },
        { name: 'East Harbor', x: 800, y: 500, w: 400, h: 350, color: '#8B4513' },
        { name: 'Docks', x: 1300, y: 350, w: 250, h: 200, color: '#4169E1' },
        { name: 'Airport', x: 1550, y: 400, w: 200, h: 250, color: '#696969' },
        { name: 'Hills', x: 200, y: 800, w: 300, h: 400, color: '#2F4F4F' },
        { name: 'Suburbs', x: 600, y: 850, w: 500, h: 400, color: '#8B7D6B' },
        { name: 'Industrial', x: 1100, y: 750, w: 450, h: 300, color: '#4B4B4B' },
        { name: 'Sunset Park', x: 300, y: 1250, w: 300, h: 200, color: '#228B22' },
        { name: 'Riverside', x: 650, y: 1200, w: 400, h: 200, color: '#4169E1' }
    ],
    
    ROADS: [
        // Main arterial roads
        { x: 0, y: 650, w: 2000, h: 20, speed: 50 },
        { x: 650, y: 0, w: 20, h: 1500, speed: 40 },
        { x: 650, y: 650, w: 200, h: 20, speed: 50 },
        // Harbor loop
        { x: 900, y: 150, w: 20, h: 250, speed: 35 },
        { x: 900, y: 400, w: 400, h: 20, speed: 35 },
        { x: 1300, y: 400, w: 20, h: 200, speed: 35 },
        { x: 1300, y: 600, w: 350, h: 20, speed: 35 },
        // Cross streets
        { x: 300, y: 300, w: 300, h: 20, speed: 40 },
        { x: 300, y: 600, w: 200, h: 20, speed: 30 },
        { x: 800, y: 250, w: 200, h: 20, speed: 45 },
        { x: 400, y: 450, w: 200, h: 20, speed: 30 },
        { x: 1000, y: 500, w: 200, h: 20, speed: 40 },
        { x: 1200, y: 300, w: 20, h: 200, speed: 35 },
        { x: 1500, y: 450, w: 200, h: 20, speed: 30 },
        // Beach road
        { x: 1200, y: 0, w: 100, h: 200, speed: 30 },
        // Downtown grid
        { x: 500, y: 300, w: 200, h: 20, speed: 35 },
        { x: 500, y: 350, w: 20, h: 300, speed: 25 },
        { x: 700, y: 350, w: 20, h: 300, speed: 25 },
        { x: 600, y: 450, w: 100, h: 20, speed: 30 },
    ],
    
    PARKS: [
        { x: 300, y: 1250, w: 150, h: 150, color: '#228B22' },
        { x: 650, y: 1200, w: 100, h: 150, color: '#228B22' },
    ],
    
    BEACHES: [
        { x: 1200, y: 100, w: 350, h: 100, color: '#FFE4B5' }
    ],
    
    BUILDINGS: [],
    
    // Get available districts based on player progress
    getAvailableDistricts: function(unlocked = ['Downtown']) {
        return this.DISTRICTS.filter(d => unlocked.includes(d.name));
    },
    
    init() {
        // Generate building grid
        for (let district of this.DISTRICTS) {
            this.BUILDINGS.push({
                x: district.x + 30, y: district.y + 30,
                w: district.w - 60, h: district.h - 60,
                color: '#444', type: 'residential'
            });
        }
    }
};

const WORLD_SIZE = 3000; // For minimap calculation