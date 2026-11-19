// vehicles.js - Player vehicles and vehicle physics
// All classic scripts, no modules

const Vehicle = {
    LIST: [
        { name: 'Sedan', w: 40, h: 20, maxSpeed: 120, acceleration: 0.8, handling: 0.7, price: 5000 },
        { name: 'Sports Car', w: 35, h: 15, maxSpeed: 180, acceleration: 1.2, handling: 0.9, price: 15000 },
        { name: 'SUV', w: 45, h: 22, maxSpeed: 100, acceleration: 0.6, handling: 0.5, price: 8000 },
        { name: 'Motorcycle', w: 25, h: 8, maxSpeed: 200, acceleration: 1.5, handling: 1.0, price: 7000 }
    ],
    
    create(x, y, type, color) {
        const v = this.LIST[type] || this.LIST[0];
        return {
            x: x, y: y, angle: 0,
            w: v.w, h: v.h,
            maxSpeed: v.maxSpeed,
            acceleration: v.acceleration,
            handling: v.handling,
            price: v.price,
            type: type,
            color: color || '#ff0000',
            speed: 0,
            steering: 0,
            inPlayerHands: false
        };
    }
};

const vehicles = []; // All parked/driving vehicles
let playerVehicle = null;