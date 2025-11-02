// Particle System for Fire Effects
class ParticleSystem {
    // Constants
    static SMOKE_EMISSION_RATE = 0.6;
    static FIRE_EMISSION_RATE = 1.0;
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.particles = [];
        this.maxParticles = 500; // Reduced from 2000 for better performance and more realistic visual density
        this.particleSize = 3;
        this.enabled = true;
        this.particleType = 'fire'; // 'fire' or 'smoke'
        
        // Constants
        this.TARGET_FPS = 60;
    }

    createParticle() {
        const x = this.canvas.width * (0.45 + Math.random() * 0.1);
        const y = this.canvas.height * 0.95;
        
        if (this.particleType === 'smoke') {
            return this.createSmokeParticle(x, y);
        } else {
            return this.createFireParticle(x, y);
        }
    }

    createFireParticle(x, y) {
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 1.5, // Reduced horizontal spread
            vy: -1.5 - Math.random() * 2, // Reduced upward velocity
            life: 1.0,
            decay: 0.015 + Math.random() * 0.015, // Faster decay
            size: this.particleSize * (0.5 + Math.random() * 0.5),
            hue: 15 + Math.random() * 30, // Orange-red range
            saturation: 85 + Math.random() * 15,
            brightness: 55 + Math.random() * 40,
            type: 'fire'
        };
    }

    createSmokeParticle(x, y) {
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2.5, // More horizontal spread for smoke
            vy: -0.8 - Math.random() * 1.2, // Slower upward velocity
            life: 1.0,
            decay: 0.008 + Math.random() * 0.008, // Slower decay (smoke lingers)
            size: this.particleSize * (1.0 + Math.random() * 1.5), // Larger particles
            hue: 0, // Grayscale
            saturation: 0, // No color
            brightness: 30 + Math.random() * 30, // Gray range
            type: 'smoke'
        };
    }

    update(deltaTime) {
        if (!this.enabled) return;

        // Adjust emission rate based on particle type
        const emissionRate = this.particleType === 'smoke' 
            ? ParticleSystem.SMOKE_EMISSION_RATE 
            : ParticleSystem.FIRE_EMISSION_RATE;
        const particlesToAdd = Math.min(
            Math.floor((this.maxParticles / this.TARGET_FPS) * emissionRate),
            this.maxParticles - this.particles.length
        );
        
        for (let i = 0; i < particlesToAdd; i++) {
            this.particles.push(this.createParticle());
        }

        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Apply physics
            p.x += p.vx * deltaTime * this.TARGET_FPS;
            p.y += p.vy * deltaTime * this.TARGET_FPS;
            
            // Turbulence - more for smoke, less for fire
            const turbulence = p.type === 'smoke' ? 0.8 : 0.3;
            p.vx += (Math.random() - 0.5) * turbulence;
            
            // Upward acceleration - different for each type
            if (p.type === 'smoke') {
                p.vy -= 0.02; // Gentle rise for smoke
                p.vx *= 0.99; // Air resistance
            } else {
                p.vy -= 0.04; // Slight upward acceleration for fire
            }
            
            // Fade out
            p.life -= p.decay;
            
            // Remove dead particles
            if (p.life <= 0 || p.y < -10) {
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        if (!this.enabled) return;

        for (const p of this.particles) {
            const alpha = p.life;
            const size = p.size * p.life;
            
            // Different rendering for smoke vs fire
            if (p.type === 'smoke') {
                // Softer, larger glow for smoke
                const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
                gradient.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, ${p.brightness}%, ${alpha * 0.4})`);
                gradient.addColorStop(0.4, `hsla(${p.hue}, ${p.saturation}%, ${p.brightness * 0.8}%, ${alpha * 0.2})`);
                gradient.addColorStop(1, `hsla(${p.hue}, ${p.saturation}%, ${p.brightness * 0.6}%, 0)`);
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Brighter, more concentrated glow for fire
                const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
                gradient.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, ${p.brightness}%, ${alpha})`);
                gradient.addColorStop(0.5, `hsla(${p.hue}, ${p.saturation}%, ${p.brightness * 0.7}%, ${alpha * 0.5})`);
                gradient.addColorStop(1, `hsla(${p.hue}, ${p.saturation}%, ${p.brightness * 0.5}%, 0)`);
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    setParticleType(type) {
        this.particleType = type;
        // Clear existing particles when switching type
        this.clear();
    }

    setMaxParticles(count) {
        this.maxParticles = count;
        // Remove excess particles
        if (this.particles.length > count) {
            this.particles.length = count;
        }
    }

    setParticleSize(size) {
        this.particleSize = size;
    }

    clear() {
        this.particles = [];
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.clear();
        }
    }
}
