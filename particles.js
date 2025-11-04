// Physics-Based Particle System with Convection and Temperature Simulation
// Redesigned from scratch to integrate with flame dynamics
class ParticleSystem {
    // Class constants
    static MAX_PARTICLES = 500;
    
    // Physical constants (SI-inspired but scaled for visual effect)
    static GRAVITY = 9.81;  // m/s² - Gravitational acceleration
    static AIR_DENSITY = 1.2;  // kg/m³ - Air density at sea level
    static SPARK_DENSITY = 2500;  // kg/m³ - Density of hot carbon particles
    static SMOKE_DENSITY = 0.3;  // kg/m³ - Hot smoke is less dense than air
    static BOLTZMANN = 1.0;  // Simplified constant for buoyancy
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.particles = [];
        this.maxParticles = ParticleSystem.MAX_PARTICLES;
        this.particleSize = 3;
        this.enabled = true;
        
        // Particle lifetime control (in seconds)
        this.averageLifetime = 1.0;
        
        // Wind parameters
        this.windStrength = 0;
        this.windDirection = 0;
        
        // Flame source position (normalized 0-1)
        this.flameSourceX = 0.5;
        this.flameSourceY = 0.2;
        this.flameSourceSize = 0.3;
        
        // Physics simulation constants
        this.TARGET_FPS = 60;
        this.TIMESTEP = 1.0 / this.TARGET_FPS;
        
        // Temperature simulation (Kelvin-like scale, normalized)
        this.FLAME_TEMP = 1500;  // Base flame temperature
        this.AMBIENT_TEMP = 300;  // Ambient air temperature
        this.COOLING_RATE = 150;  // Temperature loss per second
        
        // Convection parameters - particles spawn in updraft zones
        this.CONVECTION_STRENGTH = 8.0;  // Upward velocity in hot zones
        this.TURBULENCE_SCALE = 0.5;  // Random motion amplitude
        
        // Particle type distribution
        this.SPARK_CHANCE = 0.15;  // Small hot sparks
        this.SMOKE_CHANCE = 0.40;  // Smoke particles
        // Remaining are heat shimmer particles
    }

    /**
     * Create a new particle with physics-based properties
     * Particles spawn in convection zones within the flame
     */
    createParticle(type = 'spark') {
        // Coordinate system conversion:
        // - Texture/shader space: (0, 0) = bottom-left, (1, 1) = top-right
        // - Screen/canvas space: (0, 0) = top-left, (width, height) = bottom-right
        const screenY = (1.0 - this.flameSourceY) * this.canvas.height;
        const sourceWidth = this.flameSourceSize * this.canvas.width;
        
        // Spawn position: within flame source area
        const x = this.canvas.width * this.flameSourceX + (Math.random() - 0.5) * sourceWidth;
        const y = screenY;
        
        // Determine particle type and properties
        if (type === 'spark') {
            // SPARKS: Small hot carbon particles carried by convection
            // These are tiny pieces of burning material lifted by hot air
            return this.createSpark(x, y);
        } else if (type === 'smoke') {
            // SMOKE: Combustion products, rise due to low density then cool
            return this.createSmoke(x, y);
        } else {
            // HEAT SHIMMER: Nearly invisible hot air distortions
            return this.createHeatShimmer(x, y);
        }
    }
    
    /**
     * Create a spark particle - hot carbon particle
     */
    createSpark(x, y) {
        // Sparks are small, hot particles of burning carbon
        // Initial temperature is very high (near flame temperature)
        const temp = this.FLAME_TEMP * (0.8 + Math.random() * 0.2);
        
        // Lifetime: 0.3 to 1.2 seconds (based on cooling rate)
        const lifetime = 0.3 + Math.random() * 0.9;
        
        // Initial velocity: carried upward by convection
        // Small random horizontal component
        const vx = (Math.random() - 0.5) * 1.5;
        const vy = -(this.CONVECTION_STRENGTH * (0.7 + Math.random() * 0.6));
        
        return {
            x, y, vx, vy,
            type: 'spark',
            temperature: temp,  // Current temperature in Kelvin-like units
            initialTemp: temp,  // For color calculations
            mass: 0.00001 * (0.8 + Math.random() * 0.4),  // Small mass
            size: this.particleSize * (0.4 + Math.random() * 0.4),
            life: 1.0,
            decay: 1.0 / (lifetime * this.TARGET_FPS),
            lifetime: lifetime,
            age: 0
        };
    }
    
    /**
     * Create a smoke particle - combustion product
     */
    createSmoke(x, y) {
        // Smoke starts hot and rises, then cools and disperses
        const temp = this.FLAME_TEMP * (0.5 + Math.random() * 0.3);
        
        // Lifetime: 1.0 to 2.5 seconds (smoke lingers longer)
        const lifetime = 1.0 + Math.random() * 1.5;
        
        // Initial velocity: moderate upward from convection
        const vx = (Math.random() - 0.5) * 2.0;
        const vy = -(this.CONVECTION_STRENGTH * (0.4 + Math.random() * 0.4));
        
        return {
            x, y, vx, vy,
            type: 'smoke',
            temperature: temp,
            initialTemp: temp,
            mass: 0.00002 * (0.7 + Math.random() * 0.6),  // Very light
            size: this.particleSize * (0.8 + Math.random() * 0.8),
            life: 1.0,
            decay: 1.0 / (lifetime * this.TARGET_FPS),
            lifetime: lifetime,
            age: 0,
            opacity: 0.2 + Math.random() * 0.3  // Smoke is semi-transparent
        };
    }
    
    /**
     * Create a heat shimmer particle - nearly invisible hot air
     */
    createHeatShimmer(x, y) {
        // Heat shimmer represents hot air distortions
        const temp = this.FLAME_TEMP * (0.6 + Math.random() * 0.3);
        
        // Lifetime: 0.5 to 1.5 seconds
        const lifetime = 0.5 + Math.random() * 1.0;
        
        // Initial velocity: rises quickly, very light
        const vx = (Math.random() - 0.5) * 1.0;
        const vy = -(this.CONVECTION_STRENGTH * (0.8 + Math.random() * 0.5));
        
        return {
            x, y, vx, vy,
            type: 'shimmer',
            temperature: temp,
            initialTemp: temp,
            mass: 0.000005,  // Extremely light
            size: this.particleSize * (0.3 + Math.random() * 0.3),
            life: 1.0,
            decay: 1.0 / (lifetime * this.TARGET_FPS),
            lifetime: lifetime,
            age: 0,
            opacity: 0.1 + Math.random() * 0.15  // Very faint
        };
    }

    /**
     * Update all particles with physics-based simulation
     */
    update(deltaTime) {
        if (!this.enabled) return;

        // Spawn new particles based on particle count setting
        const particlesToAdd = Math.min(
            Math.floor(this.maxParticles / this.TARGET_FPS),
            this.maxParticles - this.particles.length
        );
        
        for (let i = 0; i < particlesToAdd; i++) {
            const rand = Math.random();
            let particleType;
            
            if (rand < this.SPARK_CHANCE) {
                particleType = 'spark';
            } else if (rand < this.SPARK_CHANCE + this.SMOKE_CHANCE) {
                particleType = 'smoke';
            } else {
                particleType = 'shimmer';
            }
            
            this.particles.push(this.createParticle(particleType));
        }

        // Calculate wind force vector
        const windAngle = this.windDirection * 2.0 * Math.PI;
        const windForceX = Math.cos(windAngle) * this.windStrength * 5.0;
        const windForceY = Math.sin(windAngle) * this.windStrength * 5.0;

        // Update each particle with full physics simulation
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Age the particle
            p.age += deltaTime;
            
            // === TEMPERATURE SIMULATION ===
            // Particles cool over time, approaching ambient temperature
            const coolingThisFrame = this.COOLING_RATE * deltaTime;
            p.temperature = Math.max(
                this.AMBIENT_TEMP,
                p.temperature - coolingThisFrame
            );
            
            // === BUOYANCY FORCE ===
            // Hot particles rise (buoyancy), cold particles fall (gravity)
            // Buoyancy force: F = (ρ_air - ρ_particle) * V * g
            // Simplified: buoyancy proportional to temperature difference
            const tempDiff = p.temperature - this.AMBIENT_TEMP;
            const buoyancyForce = (tempDiff / this.FLAME_TEMP) * this.CONVECTION_STRENGTH;
            
            // Buoyancy affects vertical velocity (negative = upward in screen coords)
            const buoyancyAccel = -buoyancyForce / p.mass;
            
            // === GRAVITY FORCE ===
            // All particles experience downward gravitational pull
            // As particles cool, gravity dominates over buoyancy
            const gravityAccel = ParticleSystem.GRAVITY * this.TIMESTEP;
            
            // === DRAG FORCE ===
            // Air resistance proportional to velocity squared
            // F_drag = 0.5 * ρ * v² * C_d * A
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const dragCoeff = 0.05;  // Simplified drag coefficient
            const dragForce = dragCoeff * speed;
            
            // Apply drag to velocity
            if (speed > 0) {
                p.vx *= (1.0 - dragForce * deltaTime);
                p.vy *= (1.0 - dragForce * deltaTime);
            }
            
            // === TURBULENCE ===
            // Random perturbations simulate turbulent eddies in the air
            const turbulence = this.TURBULENCE_SCALE;
            p.vx += (Math.random() - 0.5) * turbulence;
            p.vy += (Math.random() - 0.5) * turbulence * 0.5;
            
            // === WIND FORCE ===
            p.vx += windForceX * deltaTime * 0.1;
            p.vy += windForceY * deltaTime * 0.1;
            
            // === INTEGRATE FORCES ===
            // Net vertical acceleration = buoyancy + gravity
            p.vy += (buoyancyAccel + gravityAccel) * deltaTime * this.TARGET_FPS;
            
            // === UPDATE POSITION ===
            p.x += p.vx * deltaTime * this.TARGET_FPS;
            p.y += p.vy * deltaTime * this.TARGET_FPS;
            
            // === TYPE-SPECIFIC BEHAVIORS ===
            if (p.type === 'smoke') {
                // Smoke expands as it rises and cools
                p.size *= 1.002;  // Gradual expansion
                
                // Smoke opacity fades with temperature
                const tempFactor = (p.temperature - this.AMBIENT_TEMP) / (p.initialTemp - this.AMBIENT_TEMP);
                p.opacity = 0.3 * tempFactor * p.life;
            } else if (p.type === 'spark') {
                // Sparks dim as they cool
                // No size change for sparks
            } else if (p.type === 'shimmer') {
                // Heat shimmer is very subtle
                p.opacity = 0.15 * p.life;
            }
            
            // === LIFE DECAY ===
            p.life -= p.decay;
            
            // === REMOVE DEAD OR OUT-OF-BOUNDS PARTICLES ===
            if (p.life <= 0 || p.y < -50 || p.y > this.canvas.height + 50) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Render all particles with temperature-based coloring
     */
    render() {
        if (!this.enabled) return;

        for (const p of this.particles) {
            const alpha = p.life;
            const size = p.size * p.life;
            
            // Calculate color based on temperature (blackbody radiation)
            const tempNormalized = (p.temperature - this.AMBIENT_TEMP) / (this.FLAME_TEMP - this.AMBIENT_TEMP);
            const tempClamped = Math.max(0, Math.min(1, tempNormalized));
            
            // Blackbody radiation color mapping
            let hue, saturation, brightness;
            
            if (p.type === 'spark') {
                // Sparks: bright hot colors when hot, dim red when cool
                if (tempClamped > 0.7) {
                    // Hot: yellow-white
                    hue = 45 + (1.0 - tempClamped) * 15;  // 45-60 (yellow)
                    saturation = 60 + tempClamped * 40;   // More saturated when hot
                    brightness = 80 + tempClamped * 20;   // Very bright
                } else if (tempClamped > 0.4) {
                    // Warm: orange
                    hue = 30 + (0.7 - tempClamped) * 20;  // Orange range
                    saturation = 80 + tempClamped * 15;
                    brightness = 60 + tempClamped * 30;
                } else {
                    // Cool: deep red, dimming
                    hue = 5 + tempClamped * 15;          // Red range
                    saturation = 70 + tempClamped * 20;
                    brightness = 30 + tempClamped * 40;   // Dimmer
                }
                
                // Render spark with small core and faint glow
                this.renderSpark(p, hue, saturation, brightness, alpha, size);
                
            } else if (p.type === 'smoke') {
                // Smoke: transitions from hot (orange tint) to cool (gray)
                if (tempClamped > 0.3) {
                    // Hot smoke: orange-gray
                    hue = 20 + tempClamped * 20;
                    saturation = 15 + tempClamped * 30;
                    brightness = 40 + tempClamped * 20;
                } else {
                    // Cool smoke: gray
                    hue = 0;
                    saturation = 5 + tempClamped * 10;
                    brightness = 30 + tempClamped * 20;
                }
                
                // Render smoke with soft diffuse appearance
                this.renderSmoke(p, hue, saturation, brightness, p.opacity * alpha, size);
                
            } else if (p.type === 'shimmer') {
                // Heat shimmer: barely visible, warm tint
                hue = 40;
                saturation = 30;
                brightness = 60 + tempClamped * 30;
                
                // Render shimmer as very faint glow
                this.renderShimmer(p, hue, saturation, brightness, p.opacity * alpha, size);
            }
        }
    }
    
    /**
     * Render a spark particle
     */
    renderSpark(p, hue, saturation, brightness, alpha, size) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        // Bright core
        const coreGradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 1.5);
        coreGradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${brightness}%, 1)`);
        coreGradient.addColorStop(0.5, `hsla(${hue}, ${saturation}%, ${brightness * 0.8}%, 0.6)`);
        coreGradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${brightness * 0.5}%, 0)`);
        
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, size * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    /**
     * Render a smoke particle
     */
    renderSmoke(p, hue, saturation, brightness, alpha, size) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        // Soft, diffuse smoke
        const smokeGradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
        smokeGradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${brightness}%, ${alpha * 0.4})`);
        smokeGradient.addColorStop(0.4, `hsla(${hue}, ${saturation * 0.8}%, ${brightness * 0.9}%, ${alpha * 0.25})`);
        smokeGradient.addColorStop(0.7, `hsla(${hue}, ${saturation * 0.6}%, ${brightness * 0.8}%, ${alpha * 0.1})`);
        smokeGradient.addColorStop(1, `hsla(${hue}, ${saturation * 0.4}%, ${brightness * 0.7}%, 0)`);
        
        this.ctx.fillStyle = smokeGradient;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    /**
     * Render a heat shimmer particle
     */
    renderShimmer(p, hue, saturation, brightness, alpha, size) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha * 0.5;  // Very faint
        
        // Subtle glow
        const shimmerGradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
        shimmerGradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${brightness}%, ${alpha * 0.3})`);
        shimmerGradient.addColorStop(0.5, `hsla(${hue}, ${saturation * 0.7}%, ${brightness * 0.9}%, ${alpha * 0.15})`);
        shimmerGradient.addColorStop(1, `hsla(${hue}, ${saturation * 0.5}%, ${brightness * 0.8}%, 0)`);
        
        this.ctx.fillStyle = shimmerGradient;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    setMaxParticles(count) {
        this.maxParticles = Math.min(count, ParticleSystem.MAX_PARTICLES);
        // Remove excess particles
        if (this.particles.length > this.maxParticles) {
            this.particles.length = this.maxParticles;
        }
    }

    setParticleSize(size) {
        this.particleSize = size;
    }

    setAverageLifetime(lifetime) {
        this.averageLifetime = Math.max(0.2, Math.min(lifetime, 3.0));
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
    
    setDragVelocity(velocityX, velocityY) {
        // Not used in new physics-based system
        // Particles respond to their own temperature and buoyancy
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
