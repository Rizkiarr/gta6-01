// audio.js - WebAudio synthesis for game effects
// All classic scripts, no modules

const Audio = {
    ctx: null,
    
    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            this.ctx = null;
        }
    },
    
    playEngineSound(volume, type) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = type || 'sawtooth';
        osc.frequency.value = type === 'car' ? 300 + volume * 200 : 80;
        filter.type = 'lowpass';
        filter.frequency.value = type === 'car' ? 800 + volume * 400 : 200;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume * 0.5, this.ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 1.1);
    },
    
    playCrashSound() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.7);
        
        // Screen shake effect
        gameState.screenShake = 10;
    },
    
    playFootstep() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = 150;
        
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },
    
    playHorns() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);
    },
    
    playSiren() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.6);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.9);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 1);
    },
    
    playMusicLoop() {
        if (!this.ctx) return;
        // Simple 4-bar loop using multiple oscillators
        const master = this.ctx.createGain();
        master.gain.value = 0.1;
        master.connect(this.ctx.destination);
        
        const notes = [261.63, 293.66, 329.63, 349.23]; // C, D, E, F
        let time = 0;
        
        for (let octave = 3; octave <= 5; octave++) {
            for (let note of notes) {
                const osc = this.ctx.createOscillator();
                const gainNode = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = note * Math.pow(2, octave - 4);
                gainNode.gain.value = 0.05;
                gainNode.gain.setValueAtTime(0, this.ctx.currentTime + time);
                gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + time + 0.4);
                osc.connect(gainNode);
                gainNode.connect(master);
                osc.start(this.ctx.currentTime + time);
                osc.stop(this.ctx.currentTime + time + 0.5);
                time += 0.5;
            }
            time += 0.2; // rest
        }
    }
};