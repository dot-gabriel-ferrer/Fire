// Enhanced Particle System for Fire Effects with Physical Simulation
class ParticleSystem {
    // Class constants
    static MAX_PARTICLES = 500;
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.particles = [];
        this.embers = [];
        this.sparks = [];
        this.maxParticles = ParticleSystem.MAX_PARTICLES; // Limited to 500 for better performance and realism
        this.particleSize = 3;
        this.enabled = true;
        
        // Particle lifetime control (in seconds)
        this.averageLifetime = 1.0; // Average particle lifetime in seconds
        
        // Wind parameters
        this.windStrength = 0;
        this.windDirection = 0;
        
        // Flame source position (normalized 0-1)
        this.flameSourceX = 0.5;  // Center by default
        this.flameSourceY = 0.2;  // Near bottom by default
        this.flameSourceSize = 0.3;  // Source width
        
        // Constants
        this.TARGET_FPS = 60;
        this.GRAVITY = 0.5; // Positive in screen coordinates (y increases downward)
        this.EMBER_CHANCE = 0.1; // 10% chance for ember vs regular particle
        this.SPARK_CHANCE = 0.05; // 5% chance for spark
    }

    createParticle(type = 'normal') {
        // Use flame source position for particle emission
        // flameSourceY is in texture coords (0=bottom, 1=top)
        // Screen coords: y=0 at top, so we need to convert
        const screenY = (1.0 - this.flameSourceY) * this.canvas.height;
        const sourceWidth = this.flameSourceSize * this.canvas.width;
        
        const x = this.canvas.width * this.flameSourceX + (Math.random() - 0.5) * sourceWidth;
        const y = screenY;
        
        // Calculate decay based on average lifetime
        // Life starts at 1.0 and decays to 0
        const lifetimeVariation = 0.5 + Math.random(); // 0.5 to 1.5 multiplier
        const lifetime = this.averageLifetime * lifetimeVariation;
        const decayRate = 1.0 / (lifetime * this.TARGET_FPS); // Decay per frame
        
        const baseParticle = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 3,
            life: 1.0,
            decay: decayRate,
            size: this.particleSize * (0.5 + Math.random() * 0.5),
            temperature: 0.8 + Math.random() * 0.2,
            maxLife: lifetime
        };
        
        if (type === 'ember') {
            // Embers: larger, slower, longer-lived (1-2 seconds)
            const emberLifetime = (1.0 + Math.random()) * 1.5;
            return {
                ...baseParticle,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -1.5 - Math.random() * 2,
                size: this.particleSize * (1.2 + Math.random() * 0.8),
                decay: 1.0 / (emberLifetime * this.TARGET_FPS),
                hue: 10 + Math.random() * 25,
                saturation: 90 + Math.random() * 10,
                brightness: 60 + Math.random() * 30,
                type: 'ember',
                maxLife: emberLifetime
            };
        } else if (type === 'spark') {
            // Sparks: small, fast, short-lived (0.2-0.5 seconds)
            const sparkLifetime = 0.2 + Math.random() * 0.3;
            return {
                ...baseParticle,
                vx: (Math.random() - 0.5) * 4,
                vy: -4 - Math.random() * 3,
                size: this.particleSize * (0.3 + Math.random() * 0.3),
                decay: 1.0 / (sparkLifetime * this.TARGET_FPS),
                hue: 40 + Math.random() * 20,
                saturation: 70 + Math.random() * 30,
                brightness: 90 + Math.random() * 10,
                type: 'spark',
                maxLife: sparkLifetime
            };
        } else {
            // Normal particles - lifetime based on averageLifetime
            return {
                ...baseParticle,
                hue: 15 + Math.random() * 45,
                saturation: 80 + Math.random() * 20,
                brightness: 50 + Math.random() * 50,
                type: 'normal'
            };
        }
    }

    update(deltaTime) {
        if (!this.enabled) return;

        // Add new particles with type variation
        const particlesToAdd = Math.min(
            Math.floor(this.maxParticles / this.TARGET_FPS),
            this.maxParticles - this.particles.length
        );
        
        for (let i = 0; i < particlesToAdd; i++) {
            const rand = Math.random();
            let particleType = 'normal';
            
            if (rand < this.SPARK_CHANCE) {
                particleType = 'spark';
            } else if (rand < this.SPARK_CHANCE + this.EMBER_CHANCE) {
                particleType = 'ember';
            }
            
            this.particles.push(this.createParticle(particleType));
        }

        // Calculate wind force
        const windAngle = this.windDirection * 2.0 * Math.PI; // 0 to 2π
        const windForceX = Math.cos(windAngle) * this.windStrength * 5.0;
        const windForceY = Math.sin(windAngle) * this.windStrength * 5.0;

        // Update existing particles with improved physics
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Apply wind force
            p.vx += windForceX * deltaTime * this.TARGET_FPS * 0.1;
            p.vy += windForceY * deltaTime * this.TARGET_FPS * 0.1;
            
            // Apply velocity
            p.x += p.vx * deltaTime * this.TARGET_FPS;
            p.y += p.vy * deltaTime * this.TARGET_FPS;
            
            // Physics based on particle type
            if (p.type === 'ember') {
                // Embers: affected by gravity, slow turbulence
                p.vy += this.GRAVITY * 0.3 * deltaTime * this.TARGET_FPS;
                p.vx += (Math.random() - 0.5) * 0.3;
                
                // Embers cool down (hue shifts toward red)
                p.temperature *= 0.995;
                p.brightness *= 0.998;
            } else if (p.type === 'spark') {
                // Sparks: minimal gravity, fast decay
                p.vy += this.GRAVITY * 0.1 * deltaTime * this.TARGET_FPS;
                p.vx *= 0.98; // Air resistance
                p.vy *= 0.98;
            } else {
                // Normal particles: standard behavior with upward buoyancy
                p.vx += (Math.random() - 0.5) * 0.5;
                p.vy -= 0.05 * this.TARGET_FPS * deltaTime; // Upward acceleration (buoyancy counteracts gravity)
            }
            
            // Common turbulence
            const turbulence = (Math.random() - 0.5) * 0.3;
            p.vx += turbulence;
            
            // Life decay
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
            
            // Different rendering based on particle type
            if (p.type === 'ember') {
                // Embers: solid core with glow
                const coreGradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 1.5);
                const emberHue = 10 + (1.0 - p.temperature) * 15; // Shift to red as it cools
                coreGradient.addColorStop(0, `hsla(${emberHue}, 100%, 60%, ${alpha})`);
                coreGradient.addColorStop(0.4, `hsla(${emberHue}, 90%, 50%, ${alpha * 0.8})`);
                coreGradient.addColorStop(1, `hsla(${emberHue}, 70%, 30%, 0)`);
                
                this.ctx.fillStyle = coreGradient;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, size * 1.5, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.type === 'spark') {
                // Sparks: bright, sharp points with trails
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                
                // Trail effect
                const trailLength = Math.sqrt(p.vx * p.vx + p.vy * p.vy) * 2;
                const trailGradient = this.ctx.createLinearGradient(
                    p.x, p.y,
                    p.x - p.vx * 0.5, p.y - p.vy * 0.5
                );
                trailGradient.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, ${p.brightness}%, ${alpha})`);
                trailGradient.addColorStop(1, `hsla(${p.hue}, ${p.saturation}%, ${p.brightness}%, 0)`);
                
                this.ctx.strokeStyle = trailGradient;
                this.ctx.lineWidth = size;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x - p.vx * 0.5, p.y - p.vy * 0.5);
                this.ctx.stroke();
                
                // Bright core
                this.ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, ${p.brightness}%, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, size * 1.2, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.restore();
            } else {
                // Normal particles: standard glow
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

    setMaxParticles(count) {
        this.maxParticles = Math.min(count, ParticleSystem.MAX_PARTICLES); // Hard cap at MAX_PARTICLES
        // Remove excess particles
        if (this.particles.length > this.maxParticles) {
            this.particles.length = this.maxParticles;
        }
    }

    setParticleSize(size) {
        this.particleSize = size;
    }

    setAverageLifetime(lifetime) {
        this.averageLifetime = Math.max(0.2, Math.min(lifetime, 3.0)); // Range: 0.2 to 3 seconds
    }
    
    setWind(strength, direction) {
        this.windStrength = strength;
        this.windDirection = direction;
    }
    
    setFlameSource(x, y, size) {
        this.flameSourceX = x;
        this.flameSourceY = y;
        this.flameSourceSize = size;
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
