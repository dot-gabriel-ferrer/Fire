// Particle System for Fire Effects
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.particles = [];
        this.maxParticles = 2000;
        this.particleSize = 3;
        this.enabled = true;
        
        // Constants
        this.TARGET_FPS = 60;
    }

    createParticle() {
        const x = this.canvas.width * (0.45 + Math.random() * 0.1);
        const y = this.canvas.height * 0.95;
        
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 3,
            life: 1.0,
            decay: 0.01 + Math.random() * 0.02,
            size: this.particleSize * (0.5 + Math.random() * 0.5),
            hue: 15 + Math.random() * 45,
            saturation: 80 + Math.random() * 20,
            brightness: 50 + Math.random() * 50
        };
    }

    update(deltaTime) {
        if (!this.enabled) return;

        // Add new particles
        const particlesToAdd = Math.min(
            Math.floor(this.maxParticles / this.TARGET_FPS),
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
            
            // Turbulence
            p.vx += (Math.random() - 0.5) * 0.5;
            p.vy -= 0.05; // Slight upward acceleration
            
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
            
            // Glow effect
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
