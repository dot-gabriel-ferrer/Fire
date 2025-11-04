// Shader Management System
class ShaderManager {
    constructor(gl) {
        this.gl = gl;
        this.programs = {};
        this.currentShader = 'realistic';
    }

    compileShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const shaderType = type === this.gl.VERTEX_SHADER ? 'Vertex' : 'Fragment';
            const errorLog = this.gl.getShaderInfoLog(shader);
            console.error(`${shaderType} shader compilation error:`, errorLog);
            console.error('Shader source:', source);
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.compileShader(vertexSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragmentSource, this.gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) {
            return null;
        }

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    initializeShaders() {
        // Create realistic fire shader
        this.programs.realistic = this.createProgram(
            this.getVertexShader(),
            this.getRealisticFragmentShader()
        );

        // Create anime fire shader (original)
        this.programs.anime = this.createProgram(
            this.getVertexShader(),
            this.getAnimeFragmentShader()
        );

        // Create Studio Ghibli inspired 80s anime shader
        this.programs.ghibli80s = this.createProgram(
            this.getVertexShader(),
            this.getGhibli80sFragmentShader()
        );

        // Create modern cartoon shader
        this.programs.cartoon = this.createProgram(
            this.getVertexShader(),
            this.getCartoonFragmentShader()
        );
    }

    getVertexShader() {
        return `
            attribute vec2 a_position;
            varying vec2 v_texCoord;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_position * 0.5 + 0.5;
            }
        `;
    }

    getRealisticFragmentShader() {
        return `
            precision highp float;
            
            varying vec2 v_texCoord;
            uniform float u_time;
            uniform float u_intensity;
            uniform float u_height;
            uniform float u_turbulence;
            uniform float u_temperature;
            uniform float u_saturation;
            uniform float u_windStrength;
            uniform float u_windDirection;
            uniform float u_zoom;
            uniform float u_cameraX;
            uniform float u_cameraY;
            uniform float u_flipX;
            uniform float u_flipY;
            uniform float u_flameSourceX;
            uniform float u_flameSourceY;
            uniform float u_flameSourceSize;
            uniform float u_buoyancy;
            uniform float u_vorticity;
            uniform float u_diffusion;
            uniform float u_baseWidth;
            uniform float u_flameTaper;
            uniform float u_coreTemperature;
            uniform float u_oxygenLevel;
            uniform float u_dragVelocityX;
            uniform float u_dragVelocityY;
            
            const float TWO_PI = 6.283185307;
            const float PI = 3.14159265359;
            
            // Enhanced physics-based drag deformation constants - MUCH stronger effects
            const float DRAG_HORIZONTAL_SCALE = 0.8;   // Horizontal tilt/stretch factor (was 0.15)
            const float DRAG_VERTICAL_SCALE = 0.5;     // Vertical compression/stretch factor (was 0.1)
            const float DRAG_TURBULENCE_SCALE = 1.2;   // Dynamic turbulence from movement (was 0.2)
            
            // Fluid dynamics constants for realistic simulation
            const float VELOCITY_ADVECTION_STRENGTH = 0.6;  // How much velocity affects flame position
            const float VORTICITY_STRENGTH = 0.4;           // Rotational force multiplier
            const float PRESSURE_GRADIENT_SCALE = 0.3;      // Pressure-driven flow
            
            // Simple hash function for noise generation
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }
            
            // Smooth noise function
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f); // Smoothstep interpolation
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            // Fractal Brownian Motion for multi-scale turbulence
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for(int i = 0; i < 4; i++) {
                    value += amplitude * noise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                
                return value;
            }
            
            // Advanced fluid dynamics: Compute velocity field from drag
            // Creates fluid-like motion using multi-frequency noise
            vec2 computeVelocityField(vec2 p, float time, float dragVelX, float dragVelY) {
                vec2 velocity = vec2(0.0);
                
                // Base velocity from drag (external force)
                velocity += vec2(dragVelX, dragVelY) * VELOCITY_ADVECTION_STRENGTH;
                
                // Add rotational component (vorticity) for realistic swirls
                // Use orthogonal noise fields to create curl-like rotational flow
                float vortNoise1 = fbm(vec2(p.x * 2.5 + time * 0.3, p.y * 2.5 - time * 0.6));
                float vortNoise2 = fbm(vec2(p.x * 3.5 - time * 0.4, p.y * 3.5 + time * 0.5));
                
                // Create rotational field: orthogonal components for swirling motion
                vec2 vorticity = vec2(
                    (vortNoise1 - 0.5),   // Horizontal component
                    -(vortNoise2 - 0.5)   // Orthogonal vertical component (negative for rotation)
                ) * VORTICITY_STRENGTH * u_vorticity;
                
                velocity += vorticity;
                
                return velocity;
            }
            
            // Navier-Stokes inspired pressure gradient for flame spread
            float computePressureEffect(vec2 p, float time, float normalizedHeight) {
                // Pressure from heat creates outward expansion
                // Higher pressure at base (heat source) pushes flame outward
                float basePressure = 1.0 - normalizedHeight;
                
                // Turbulent pressure fluctuations
                float pressureNoise = fbm(vec2(p.x * 4.0 + time * 0.8, p.y * 4.0 - time * 1.2));
                
                // Pressure gradient drives expansion (diffusion)
                return basePressure * u_diffusion * PRESSURE_GRADIENT_SCALE + 
                       (pressureNoise - 0.5) * 0.3 * u_diffusion;
            }
            
            // Realistic flame shape with advanced physical parameters
            float flameShape(vec2 p, float time) {
                // p.x = horizontal distance from flame source (0 = center)
                // p.y = vertical distance from flame source (0 = source, positive = upward)
                
                // IMPORTANT: Turbulence deformation should NOT affect the flame origin position
                // Store original position for source calculations
                vec2 originalPos = p;
                
                // Normalize height progress (0 = base, 1 = top)
                float effectiveHeight = u_height * (1.5 + u_buoyancy * 0.5);
                float normalizedHeight = p.y / (effectiveHeight * 2.0);
                
                // Calculate base width with advanced parameter
                float baseWidthMultiplier = 0.5 + u_baseWidth * 1.0;
                float baseSize = u_flameSourceSize * baseWidthMultiplier;
                
                // Width profile: controlled by taper parameter
                // Low taper = wide flame, high taper = narrow flame
                float taperStrength = 0.3 + u_flameTaper * 0.7;
                float widthProfile = sin(normalizedHeight * PI) * (1.0 - normalizedHeight * taperStrength);
                float width = baseSize * 0.5 + widthProfile * (0.3 + u_height * 0.4);
                
                // Apply diffusion (flame spread)
                width *= 1.0 + u_diffusion * 0.5;
                
                // ADVANCED FLUID DYNAMICS SIMULATION
                // Compute velocity field from drag (Navier-Stokes based)
                vec2 velocityField = computeVelocityField(p, time, u_dragVelocityX, u_dragVelocityY);
                
                // Drag magnitude and influence on flame structure
                float dragMagnitude = length(vec2(u_dragVelocityX, u_dragVelocityY));
                
                // Quadratic height scaling for realistic mass distribution
                // Base is heavy and stable, tip is light and responsive
                float dragInfluence = normalizedHeight * normalizedHeight;
                
                // HORIZONTAL DEFORMATION: Velocity field advection
                // Flame tilts and flows with the velocity field
                float dragDeformX = u_dragVelocityX * dragInfluence * DRAG_HORIZONTAL_SCALE;
                dragDeformX += velocityField.x * dragInfluence * 0.5;  // Additional flow from velocity field
                
                // VERTICAL DEFORMATION: Compression/stretching from vertical forces
                float dragDeformY = u_dragVelocityY * dragInfluence * DRAG_VERTICAL_SCALE;
                dragDeformY += velocityField.y * dragInfluence * 0.3;  // Upward buoyancy modulation
                
                // TURBULENT CHAOS: Dynamic turbulence from rapid movement
                // Fast drag creates strong chaotic motion (like stirring a flame)
                float dragTurbulence = dragMagnitude * normalizedHeight * DRAG_TURBULENCE_SCALE;
                float dragNoise = fbm(vec2(p.x * 4.0 + time * 1.5, p.y * 3.5 - time)) * dragTurbulence;
                
                // PRESSURE-DRIVEN EXPANSION: Heat creates outward pressure
                float pressureExpansion = computePressureEffect(p, time, normalizedHeight);
                width *= 1.0 + pressureExpansion;
                
                // WIND DEFORMATION: Environmental force
                // Wind should deform the flame but NOT move its origin
                float windAngle = u_windDirection * TWO_PI;
                vec2 windDir = vec2(cos(windAngle), sin(windAngle));
                float windDeform = windDir.x * u_windStrength * normalizedHeight * 0.6;  // Increased from 0.3
                
                // ENHANCED VORTICITY: Swirling rotational chaos with stronger effect
                float vortNoise = fbm(vec2(p.x * 3.0 + time * 0.4, p.y * 2.0 - time * 0.8));
                float vorticityDeform = (vortNoise - 0.5) * u_vorticity * 0.8;  // Increased from 0.3
                
                // MULTI-SCALE TURBULENCE: Layered chaos at different frequencies
                float turbNoise1 = fbm(vec2(p.x * 2.5 + time * 0.6, p.y * 3.0 - time * 1.2));
                float turbNoise2 = fbm(vec2(p.x * 5.0 - time * 0.4, p.y * 4.0 + time * 0.8));
                float turbDeform = ((turbNoise1 - 0.5) * 0.7 + (turbNoise2 - 0.5) * 0.3) * u_turbulence;  // Multi-scale
                
                // Combine all deformations (these only affect shape, not origin)
                float totalDeform = windDeform + vorticityDeform + turbDeform + dragDeformX + dragNoise;
                
                // Calculate distance from center line with deformation
                // Add minimum width to prevent artifacts when base becomes very small
                float safeWidth = max(width, 0.01);
                float distFromCenter = abs(p.x + totalDeform) / safeWidth;
                
                // Base shape (smooth teardrop)
                float shape = 1.0 - smoothstep(0.0, 1.0, distFromCenter);
                
                // ENHANCED VERTICAL FLICKERING: Flame dancing with buoyancy modulation
                float flickerSpeed = 2.5 + u_buoyancy * 2.0;  // Stronger buoyancy effect
                float verticalFlicker = sin(time * flickerSpeed + p.x * 4.0) * 0.08 * u_turbulence;  // Doubled amplitude
                verticalFlicker += sin(time * flickerSpeed * 1.5 - p.x * 3.0) * 0.04 * u_turbulence;  // Secondary flicker
                
                // Apply drag-induced vertical compression/stretching
                float heightMod = p.y - verticalFlicker + dragDeformY;
                
                // Height cutoff with soft edges
                // Flame starts at y=0 (source) and extends upward
                shape *= smoothstep(-0.1, 0.0, heightMod); // Fade in at base
                shape *= smoothstep(effectiveHeight * 2.5, effectiveHeight * 1.5, heightMod); // Fade out at top
                
                // Add subtle detail for realism
                float detail = fbm(vec2(p.x * 6.0, p.y * 8.0 - time * 2.0));
                shape *= 0.8 + detail * 0.2;
                
                // Oxygen level affects flame completeness
                shape *= 0.5 + u_oxygenLevel * 0.5;
                
                return clamp(shape * 1.5, 0.0, 1.0);
            }
            
            // Realistic fire color based on temperature physics
            vec3 flameColor(float intensity, float height) {
                // Core temperature affects the base heat
                float coreHeat = 0.8 + u_coreTemperature * 0.4;
                
                // Temperature gradient: hotter at bottom, cooler at top
                float temp = intensity * (1.0 - height * 0.6) * coreHeat;
                temp = mix(temp, temp * u_temperature, 0.7);
                
                vec3 color;
                
                // Blackbody radiation color palette
                if (temp < 0.2) {
                    // Dark red/embers
                    color = vec3(0.2, 0.0, 0.0);
                } else if (temp < 0.4) {
                    // Red to orange-red
                    float t = (temp - 0.2) / 0.2;
                    color = mix(vec3(0.6, 0.1, 0.0), vec3(1.0, 0.25, 0.0), t);
                } else if (temp < 0.6) {
                    // Orange
                    float t = (temp - 0.4) / 0.2;
                    color = mix(vec3(1.0, 0.25, 0.0), vec3(1.0, 0.5, 0.0), t);
                } else if (temp < 0.8) {
                    // Orange to yellow
                    float t = (temp - 0.6) / 0.2;
                    color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.85, 0.2), t);
                } else {
                    // Yellow to white (hottest)
                    float t = (temp - 0.8) / 0.2;
                    color = mix(vec3(1.0, 0.85, 0.2), vec3(1.0, 1.0, 0.9), t);
                }
                
                // Apply saturation
                float gray = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(vec3(gray), color, u_saturation);
                
                return color;
            }
            
            void main() {
                // Wrap time early to prevent precision issues
                float time = mod(u_time, 1000.0);
                
                vec2 uv = v_texCoord;
                
                // Apply flip transformations
                if (u_flipX > 0.5) {
                    uv.x = 1.0 - uv.x;
                }
                if (u_flipY > 0.5) {
                    uv.y = 1.0 - uv.y;
                }
                
                // Apply zoom (scale)
                uv = (uv - 0.5) / u_zoom + 0.5;
                
                // Apply camera offset
                uv.x -= u_cameraX * 0.5;
                uv.y -= u_cameraY * 0.5;
                
                // Transform coordinates for correct flame orientation
                // Flame source is at u_flameSourceY (0 = bottom of screen, 1 = top)
                // Flame extends upward (positive Y in flame space = upward on screen)
                vec2 p;
                p.x = uv.x - u_flameSourceX; // Horizontal distance from flame source
                p.y = uv.y - u_flameSourceY; // Vertical distance: positive = above source (upward)
                
                float flame = flameShape(p, time);
                
                // Calculate color based on position and intensity
                float heightFactor = clamp(p.y / (u_height * 2.0), 0.0, 1.0);
                vec3 color = flameColor(flame, heightFactor);
                
                // Enhance brightness
                float brightness = pow(flame, 0.6);
                color *= 1.0 + brightness * 0.5;
                
                // Add glow effect
                float glow = pow(flame, 0.4) * 0.6;
                color += vec3(glow * 0.4);
                
                // Inner core brightness (hottest part at base)
                float coreBrightness = pow(flame, 0.25) * (1.0 - heightFactor * 0.6) * u_coreTemperature;
                color += vec3(coreBrightness * 0.5);
                
                // Calculate final alpha
                float baseAlpha = flame * (0.7 + u_intensity * 0.6);
                float alpha = baseAlpha * smoothstep(0.0, 0.03, flame);
                
                gl_FragColor = vec4(color, alpha);
            }
        `;
    }

    getAnimeFragmentShader() {
        return `
            precision highp float;
            
            varying vec2 v_texCoord;
            uniform float u_time;
            uniform float u_intensity;
            uniform float u_height;
            uniform float u_turbulence;
            uniform float u_temperature;
            uniform float u_saturation;
            uniform float u_zoom;
            uniform float u_cameraX;
            uniform float u_cameraY;
            uniform float u_flipX;
            uniform float u_flipY;
            uniform float u_flameSourceX;
            uniform float u_flameSourceY;
            uniform float u_flameSourceSize;
            uniform float u_buoyancy;
            uniform float u_vorticity;
            uniform float u_diffusion;
            uniform float u_baseWidth;
            uniform float u_flameTaper;
            uniform float u_coreTemperature;
            uniform float u_oxygenLevel;
            uniform float u_dragVelocityX;
            uniform float u_dragVelocityY;
            
            const float PI = 3.14159265359;
            const float TWO_PI = 6.283185307;
            
            // ENHANCED physics-based drag deformation constants for anime style
            const float DRAG_HORIZONTAL_SCALE = 0.6;   // Horizontal tilt/stretch factor (was 0.15)
            const float DRAG_VERTICAL_SCALE = 0.4;     // Vertical compression/stretch factor (was 0.1)
            const float DRAG_TURBULENCE_SCALE = 0.8;   // Dynamic turbulence from movement
            
            // Fluid dynamics constants for stylized simulation
            const float VELOCITY_ADVECTION_STRENGTH = 0.5;
            const float VORTICITY_STRENGTH = 0.35;
            
            // Simplified noise for anime style
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }
            
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            // Simplified FBM for anime style (2 octaves for stylized look)
            float fbmAnime(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                for(int i = 0; i < 2; i++) {
                    value += amplitude * noise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }
            
            // Stylized velocity field for anime fluid dynamics
            vec2 computeVelocityFieldAnime(vec2 p, float time, float dragVelX, float dragVelY) {
                vec2 velocity = vec2(0.0);
                
                // Base velocity from drag
                velocity += vec2(dragVelX, dragVelY) * VELOCITY_ADVECTION_STRENGTH;
                
                // Stylized vorticity (orthogonal components for swirling motion)
                float vortNoiseX = noise(vec2(p.x * 2.0 + time * 0.3, p.y * 2.0 - time * 0.5));
                float vortNoiseY = noise(vec2(p.x * 2.2 - time * 0.4, p.y * 2.2 + time * 0.6));
                
                // Create rotational flow with orthogonal components
                velocity += vec2(
                    (vortNoiseX - 0.5),   // Horizontal swirl
                    -(vortNoiseY - 0.5)   // Orthogonal vertical swirl (negative for rotation)
                ) * VORTICITY_STRENGTH * u_vorticity;
                
                return velocity;
            }
            
            // Anime-style flame shape with ENHANCED distinct layers and fluid dynamics
            float animeFlame(vec2 p, float time) {
                // p.x = horizontal distance from flame source
                // p.y = vertical distance from flame source (positive = upward)
                
                // Normalize height
                float effectiveHeight = u_height * (1.5 + u_buoyancy * 0.5);
                float normalizedHeight = p.y / (effectiveHeight * 2.0);
                
                // Calculate base width with diffusion
                float baseWidthMultiplier = 0.5 + u_baseWidth * 1.0;
                float baseSize = u_flameSourceSize * baseWidthMultiplier;
                
                // ENHANCED FLUID DYNAMICS for anime style
                vec2 velocityField = computeVelocityFieldAnime(p, time, u_dragVelocityX, u_dragVelocityY);
                float dragMagnitude = length(vec2(u_dragVelocityX, u_dragVelocityY));
                
                // Quadratic mass distribution (light tip, heavy base)
                float dragInfluence = normalizedHeight * normalizedHeight;
                
                // STRONG horizontal deformation with velocity field
                float dragDeformX = u_dragVelocityX * dragInfluence * DRAG_HORIZONTAL_SCALE;
                dragDeformX += velocityField.x * dragInfluence * 0.4;
                
                // ENHANCED stylized wobble - more exaggerated than realistic
                float wobble = sin(p.y * 8.0 - time * 3.0) * 0.15 * u_turbulence;  // Increased from 0.08
                wobble += sin(p.y * 4.0 - time * 2.0) * 0.2 * u_turbulence;  // Increased from 0.12
                wobble += sin(p.y * 12.0 + time * 4.0) * 0.08 * u_turbulence;  // Additional high-frequency wobble
                
                // Dynamic turbulence from drag (anime-style chaos)
                float dragTurbulence = dragMagnitude * normalizedHeight * DRAG_TURBULENCE_SCALE;
                wobble += noise(vec2(p.x * 5.0 + time * 2.0, p.y * 4.0)) * dragTurbulence;
                
                // ENHANCED vorticity effect - stronger swirling
                float vortEffect = sin(p.y * 6.0 + time * 2.0) * u_vorticity * 0.25;  // Increased from 0.1
                vortEffect += velocityField.y * normalizedHeight * 0.3;  // Add vertical velocity component
                
                // Combine all deformations
                float totalDeform = wobble + vortEffect + dragDeformX;
                
                // Flame shape with taper
                float flame = 1.0 - normalizedHeight;
                flame *= smoothstep(0.0, 0.2, normalizedHeight);
                
                // Width based on source size and diffusion
                float taperStrength = 0.3 + u_flameTaper * 0.7;
                float width = 1.0 - abs(p.x + totalDeform) / (baseSize * (0.5 + u_diffusion * 0.5) + normalizedHeight * (1.0 - taperStrength) * 0.5);
                flame *= smoothstep(0.0, 0.4, width);
                
                // ENHANCED stylized layers with more distinct transitions
                float layer1 = step(0.25, flame);  // Lowered threshold for more coverage
                float layer2 = step(0.45, flame);  // Adjusted for smoother transition
                float layer3 = step(0.65, flame);  // More prominent bright core
                float layer4 = step(0.85, flame);  // Super bright core
                
                // Combine layers with MORE distinct edges and brighter core
                flame = layer1 * 0.25 + layer2 * 0.3 + layer3 * 0.3 + layer4 * 0.15;
                
                // Height cutoff with STRONGER drag-induced vertical deformation
                float dragDeformY = u_dragVelocityY * dragInfluence * DRAG_VERTICAL_SCALE;
                dragDeformY += velocityField.y * dragInfluence * 0.2;  // Additional vertical flow
                flame *= smoothstep(effectiveHeight * 2.5, effectiveHeight * 1.5, p.y + dragDeformY);
                flame *= smoothstep(-0.1, 0.0, p.y + dragDeformY);
                
                // Oxygen level affects completeness
                flame *= 0.5 + u_oxygenLevel * 0.5;
                
                return flame;
            }
            
            // ENHANCED Anime color palette with more vibrant colors
            vec3 animeFireColor(float value, float temp, float sat) {
                vec3 color;
                
                // Core temperature affects base colors
                float coreHeat = 0.8 + u_coreTemperature * 0.4;
                
                // ENHANCED distinct color bands with MORE vibrant anime colors
                if (value < 0.2) {
                    color = vec3(0.5, 0.0, 0.15); // Deeper dark red/purple
                } else if (value < 0.4) {
                    color = vec3(1.0, 0.15, 0.0); // Vibrant bright red
                } else if (value < 0.6) {
                    color = vec3(1.0, 0.45, 0.0); // Rich orange
                } else if (value < 0.8) {
                    color = vec3(1.0, 0.8, 0.1); // Golden yellow
                } else {
                    color = vec3(1.0, 1.0, 0.5); // Brilliant bright yellow-white
                }
                
                // STRONGER temperature shift for dramatic effect
                color = mix(color, vec3(1.0, 1.0, 1.0), temp * coreHeat * 0.4);
                
                // Saturation with enhanced vibrancy
                float gray = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(vec3(gray), color, sat * 1.1);  // Boost saturation slightly
                
                return color;
            }
            
            void main() {
                // Wrap time early to prevent precision issues
                float time = mod(u_time, 1000.0);
                
                vec2 uv = v_texCoord;
                
                // Apply flip transformations
                if (u_flipX > 0.5) {
                    uv.x = 1.0 - uv.x;
                }
                if (u_flipY > 0.5) {
                    uv.y = 1.0 - uv.y;
                }
                
                // Apply zoom (scale)
                uv = (uv - 0.5) / u_zoom + 0.5;
                
                // Apply camera offset
                uv.x -= u_cameraX * 0.5;
                uv.y -= u_cameraY * 0.5;
                
                // Transform coordinates for correct flame orientation
                vec2 p;
                p.x = uv.x - u_flameSourceX;
                p.y = uv.y - u_flameSourceY; // Positive = above source (upward)
                
                float flame = animeFlame(p, time);
                
                // Get ENHANCED anime-style color
                vec3 fireColor = animeFireColor(flame, u_temperature, u_saturation);
                
                // SHARPER edges for anime style with better intensity control
                float alpha = step(0.08, flame) * (0.75 + u_intensity * 0.25);
                
                // ENHANCED highlight with multi-level brightness
                float highlight1 = step(0.7, flame) * 0.35;  // Mid highlight
                float highlight2 = step(0.85, flame) * 0.45; // Bright core highlight
                fireColor += vec3(highlight1 + highlight2);
                
                // STRONGER outline effect for cel-shaded look
                float outline = smoothstep(0.06, 0.10, flame) - smoothstep(0.10, 0.14, flame);
                fireColor = mix(fireColor, vec3(0.0), outline * 0.6);  // Darker outline
                
                // Add subtle inner glow for depth
                float innerGlow = smoothstep(0.5, 0.7, flame) - smoothstep(0.7, 0.9, flame);
                fireColor += vec3(innerGlow * 0.2);
                
                gl_FragColor = vec4(fireColor, alpha);
            }
        `;
    }

    getGhibli80sFragmentShader() {
        return `
            precision highp float;
            
            varying vec2 v_texCoord;
            uniform float u_time;
            uniform float u_intensity;
            uniform float u_height;
            uniform float u_turbulence;
            uniform float u_temperature;
            uniform float u_saturation;
            uniform float u_windStrength;
            uniform float u_windDirection;
            uniform float u_zoom;
            uniform float u_cameraX;
            uniform float u_cameraY;
            uniform float u_flipX;
            uniform float u_flipY;
            uniform float u_flameSourceX;
            uniform float u_flameSourceY;
            uniform float u_flameSourceSize;
            uniform float u_buoyancy;
            uniform float u_vorticity;
            uniform float u_diffusion;
            uniform float u_baseWidth;
            uniform float u_flameTaper;
            uniform float u_coreTemperature;
            uniform float u_oxygenLevel;
            uniform float u_dragVelocityX;
            uniform float u_dragVelocityY;
            
            const float TWO_PI = 6.283185307;
            const float PI = 3.14159265359;
            
            // Physics-based drag deformation constants - same as realistic
            const float DRAG_HORIZONTAL_SCALE = 0.8;
            const float DRAG_VERTICAL_SCALE = 0.5;
            const float DRAG_TURBULENCE_SCALE = 1.2;
            
            // Fluid dynamics constants for Ghibli-style simulation
            const float VELOCITY_ADVECTION_STRENGTH = 0.6;
            const float VORTICITY_STRENGTH = 0.4;
            const float PRESSURE_GRADIENT_SCALE = 0.3;
            
            // Simple hash function for noise generation
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }
            
            // Smooth noise function
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            // Fractal Brownian Motion for hand-painted texture
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for(int i = 0; i < 3; i++) {
                    value += amplitude * noise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                
                return value;
            }
            
            // Velocity field computation - same physics as realistic
            vec2 computeVelocityField(vec2 p, float time, float dragVelX, float dragVelY) {
                vec2 velocity = vec2(0.0);
                
                velocity += vec2(dragVelX, dragVelY) * VELOCITY_ADVECTION_STRENGTH;
                
                float vortNoise1 = fbm(vec2(p.x * 2.5 + time * 0.3, p.y * 2.5 - time * 0.6));
                float vortNoise2 = fbm(vec2(p.x * 3.5 - time * 0.4, p.y * 3.5 + time * 0.5));
                
                vec2 vorticity = vec2(
                    (vortNoise1 - 0.5),
                    -(vortNoise2 - 0.5)
                ) * VORTICITY_STRENGTH * u_vorticity;
                
                velocity += vorticity;
                
                return velocity;
            }
            
            // Pressure effect for flame spread
            float computePressureEffect(vec2 p, float time, float normalizedHeight) {
                float basePressure = 1.0 - normalizedHeight;
                float pressureNoise = fbm(vec2(p.x * 4.0 + time * 0.8, p.y * 4.0 - time * 1.2));
                
                return basePressure * u_diffusion * PRESSURE_GRADIENT_SCALE + 
                       (pressureNoise - 0.5) * 0.3 * u_diffusion;
            }
            
            // Studio Ghibli style flame shape with full physics
            float ghibliFlameShape(vec2 p, float time) {
                vec2 originalPos = p;
                
                float effectiveHeight = u_height * (1.5 + u_buoyancy * 0.5);
                float normalizedHeight = p.y / (effectiveHeight * 2.0);
                
                float baseWidthMultiplier = 0.5 + u_baseWidth * 1.0;
                float baseSize = u_flameSourceSize * baseWidthMultiplier;
                
                float taperStrength = 0.3 + u_flameTaper * 0.7;
                float widthProfile = sin(normalizedHeight * PI) * (1.0 - normalizedHeight * taperStrength);
                float width = baseSize * 0.5 + widthProfile * (0.3 + u_height * 0.4);
                
                width *= 1.0 + u_diffusion * 0.5;
                
                // Full fluid dynamics simulation
                vec2 velocityField = computeVelocityField(p, time, u_dragVelocityX, u_dragVelocityY);
                
                float dragMagnitude = length(vec2(u_dragVelocityX, u_dragVelocityY));
                float dragInfluence = normalizedHeight * normalizedHeight;
                
                float dragDeformX = u_dragVelocityX * dragInfluence * DRAG_HORIZONTAL_SCALE;
                dragDeformX += velocityField.x * dragInfluence * 0.5;
                
                float dragDeformY = u_dragVelocityY * dragInfluence * DRAG_VERTICAL_SCALE;
                dragDeformY += velocityField.y * dragInfluence * 0.3;
                
                float dragTurbulence = dragMagnitude * normalizedHeight * DRAG_TURBULENCE_SCALE;
                float dragNoise = fbm(vec2(p.x * 4.0 + time * 1.5, p.y * 3.5 - time)) * dragTurbulence;
                
                float pressureExpansion = computePressureEffect(p, time, normalizedHeight);
                width *= 1.0 + pressureExpansion;
                
                // Wind deformation
                float windAngle = u_windDirection * TWO_PI;
                vec2 windDir = vec2(cos(windAngle), sin(windAngle));
                float windDeform = windDir.x * u_windStrength * normalizedHeight * 0.6;
                
                // Enhanced vorticity
                float vortNoise = fbm(vec2(p.x * 3.0 + time * 0.4, p.y * 2.0 - time * 0.8));
                float vorticityDeform = (vortNoise - 0.5) * u_vorticity * 0.8;
                
                // Multi-scale turbulence with hand-painted feel
                float turbNoise1 = fbm(vec2(p.x * 2.5 + time * 0.6, p.y * 3.0 - time * 1.2));
                float turbNoise2 = fbm(vec2(p.x * 5.0 - time * 0.4, p.y * 4.0 + time * 0.8));
                float turbDeform = ((turbNoise1 - 0.5) * 0.7 + (turbNoise2 - 0.5) * 0.3) * u_turbulence;
                
                float totalDeform = windDeform + vorticityDeform + turbDeform + dragDeformX + dragNoise;
                
                float safeWidth = max(width, 0.01);
                float distFromCenter = abs(p.x + totalDeform) / safeWidth;
                
                float shape = 1.0 - smoothstep(0.0, 1.0, distFromCenter);
                
                // Vertical flickering with buoyancy
                float flickerSpeed = 2.5 + u_buoyancy * 2.0;
                float verticalFlicker = sin(time * flickerSpeed + p.x * 4.0) * 0.08 * u_turbulence;
                verticalFlicker += sin(time * flickerSpeed * 1.5 - p.x * 3.0) * 0.04 * u_turbulence;
                
                float heightMod = p.y - verticalFlicker + dragDeformY;
                
                shape *= smoothstep(-0.1, 0.0, heightMod);
                shape *= smoothstep(effectiveHeight * 2.5, effectiveHeight * 1.5, heightMod);
                
                // Hand-painted texture detail
                float detail = fbm(vec2(p.x * 6.0, p.y * 8.0 - time * 2.0));
                shape *= 0.8 + detail * 0.2;
                
                shape *= 0.5 + u_oxygenLevel * 0.5;
                
                return clamp(shape * 1.5, 0.0, 1.0);
            }
            
            // Studio Ghibli color palette with layered ramp shading
            vec3 ghibliFireColor(float intensity, float height) {
                float coreHeat = 0.8 + u_coreTemperature * 0.4;
                
                // Temperature gradient - hotter at bottom
                float temp = intensity * (1.0 - height * 0.6) * coreHeat;
                temp = mix(temp, temp * u_temperature, 0.7);
                
                vec3 color;
                
                // Ghibli-style layered color ramps (soft transitions between zones)
                // Inspired by hand-painted cels with warm, rich colors
                if (temp < 0.15) {
                    // Deep ember red with purple tint
                    color = vec3(0.35, 0.05, 0.15);
                } else if (temp < 0.3) {
                    // Dark red to bright red transition
                    float t = (temp - 0.15) / 0.15;
                    t = smoothstep(0.0, 1.0, t); // Smooth ramp
                    color = mix(vec3(0.65, 0.08, 0.10), vec3(0.95, 0.20, 0.05), t);
                } else if (temp < 0.5) {
                    // Bright red to orange-red
                    float t = (temp - 0.3) / 0.2;
                    t = smoothstep(0.0, 1.0, t);
                    color = mix(vec3(0.95, 0.20, 0.05), vec3(1.0, 0.40, 0.05), t);
                } else if (temp < 0.7) {
                    // Orange to golden yellow
                    float t = (temp - 0.5) / 0.2;
                    t = smoothstep(0.0, 1.0, t);
                    color = mix(vec3(1.0, 0.40, 0.05), vec3(1.0, 0.75, 0.15), t);
                } else {
                    // Golden yellow to warm white (peak)
                    float t = (temp - 0.7) / 0.3;
                    t = smoothstep(0.0, 1.0, t);
                    color = mix(vec3(1.0, 0.75, 0.15), vec3(1.0, 0.95, 0.75), t);
                }
                
                // Apply saturation with Ghibli's rich color style
                float gray = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(vec3(gray), color, u_saturation * 1.05); // Slightly boosted saturation
                
                return color;
            }
            
            void main() {
                float time = mod(u_time, 1000.0);
                
                vec2 uv = v_texCoord;
                
                if (u_flipX > 0.5) {
                    uv.x = 1.0 - uv.x;
                }
                if (u_flipY > 0.5) {
                    uv.y = 1.0 - uv.y;
                }
                
                uv = (uv - 0.5) / u_zoom + 0.5;
                
                uv.x -= u_cameraX * 0.5;
                uv.y -= u_cameraY * 0.5;
                
                vec2 p;
                p.x = uv.x - u_flameSourceX;
                p.y = uv.y - u_flameSourceY;
                
                float flame = ghibliFlameShape(p, time);
                
                float heightFactor = clamp(p.y / (u_height * 2.0), 0.0, 1.0);
                vec3 color = ghibliFireColor(flame, heightFactor);
                
                // Cel-shaded posterization for Ghibli look
                // Quantize intensity into discrete bands
                float posterized = floor(flame * 5.0) / 5.0; // 5 levels like hand-painted cels
                float bandedFlame = mix(flame, posterized, 0.4); // Blend for soft cel look
                
                // Enhanced brightness with soft glow
                float brightness = pow(bandedFlame, 0.55);
                color *= 1.0 + brightness * 0.6;
                
                // Layered glow effect (Ghibli's signature soft glow)
                float glow = pow(bandedFlame, 0.35) * 0.7;
                color += vec3(glow * 0.5, glow * 0.4, glow * 0.2); // Warm glow
                
                // Core brightness
                float coreBrightness = pow(bandedFlame, 0.2) * (1.0 - heightFactor * 0.5) * u_coreTemperature;
                color += vec3(coreBrightness * 0.6);
                
                // Soft outline for hand-drawn aesthetic
                float outlineEdge = smoothstep(0.05, 0.08, flame) - smoothstep(0.08, 0.12, flame);
                color = mix(color, color * 0.7, outlineEdge * 0.3); // Subtle darkening at edges
                
                // Alpha with smooth transitions
                float baseAlpha = bandedFlame * (0.7 + u_intensity * 0.6);
                float alpha = baseAlpha * smoothstep(0.0, 0.04, flame);
                
                gl_FragColor = vec4(color, alpha);
            }
        `;
    }

    getCartoonFragmentShader() {
        return `
            precision highp float;
            
            varying vec2 v_texCoord;
            uniform float u_time;
            uniform float u_intensity;
            uniform float u_height;
            uniform float u_turbulence;
            uniform float u_temperature;
            uniform float u_saturation;
            uniform float u_windStrength;
            uniform float u_windDirection;
            uniform float u_zoom;
            uniform float u_cameraX;
            uniform float u_cameraY;
            uniform float u_flipX;
            uniform float u_flipY;
            uniform float u_flameSourceX;
            uniform float u_flameSourceY;
            uniform float u_flameSourceSize;
            uniform float u_buoyancy;
            uniform float u_vorticity;
            uniform float u_diffusion;
            uniform float u_baseWidth;
            uniform float u_flameTaper;
            uniform float u_coreTemperature;
            uniform float u_oxygenLevel;
            uniform float u_dragVelocityX;
            uniform float u_dragVelocityY;
            
            const float PI = 3.14159265359;
            const float TWO_PI = 6.283185307;
            
            // Simplified physics for cartoon style
            const float DRAG_HORIZONTAL_SCALE = 0.5;
            const float DRAG_VERTICAL_SCALE = 0.3;
            
            // Simple noise for cartoon
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }
            
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            // Minimal FBM for simple cartoon look
            float simpleNoise(vec2 p) {
                return noise(p) * 0.6 + noise(p * 2.0) * 0.4;
            }
            
            // Simple cartoon flame shape
            float cartoonFlameShape(vec2 p, float time) {
                float effectiveHeight = u_height * (1.3 + u_buoyancy * 0.3);
                float normalizedHeight = p.y / (effectiveHeight * 2.0);
                
                float baseWidthMultiplier = 0.5 + u_baseWidth * 1.0;
                float baseSize = u_flameSourceSize * baseWidthMultiplier;
                
                // Simple drag physics
                float dragMagnitude = length(vec2(u_dragVelocityX, u_dragVelocityY));
                float dragInfluence = normalizedHeight * normalizedHeight;
                
                float dragDeformX = u_dragVelocityX * dragInfluence * DRAG_HORIZONTAL_SCALE;
                float dragDeformY = u_dragVelocityY * dragInfluence * DRAG_VERTICAL_SCALE;
                
                // Simple wobble
                float wobble = sin(p.y * 6.0 - time * 2.5) * 0.12 * u_turbulence;
                wobble += noise(vec2(p.x * 4.0 + time, p.y * 3.0)) * 0.1 * u_turbulence;
                
                // Simple wind effect
                float windAngle = u_windDirection * TWO_PI;
                float windDeform = cos(windAngle) * u_windStrength * normalizedHeight * 0.4;
                
                float totalDeform = wobble + windDeform + dragDeformX;
                
                // Simple teardrop shape
                float taperStrength = 0.4 + u_flameTaper * 0.6;
                float width = baseSize * (1.0 - normalizedHeight * taperStrength) * (1.0 + u_diffusion * 0.3);
                
                float distFromCenter = abs(p.x + totalDeform) / max(width, 0.01);
                float shape = 1.0 - smoothstep(0.0, 1.0, distFromCenter);
                
                // Height cutoff
                float heightMod = p.y + dragDeformY;
                shape *= smoothstep(-0.1, 0.0, heightMod);
                shape *= smoothstep(effectiveHeight * 2.3, effectiveHeight * 1.3, heightMod);
                
                // Oxygen effect
                shape *= 0.5 + u_oxygenLevel * 0.5;
                
                return clamp(shape * 1.3, 0.0, 1.0);
            }
            
            // Modern cartoon flat color palette (2-3 colors max)
            vec3 cartoonFireColor(float value, float temp, float sat) {
                vec3 color;
                
                // Bold, flat color bands - maximum 3 distinct colors
                if (value < 0.3) {
                    // Dark base - deep red/orange
                    color = vec3(0.8, 0.15, 0.0);
                } else if (value < 0.7) {
                    // Mid tone - bright orange/yellow
                    color = vec3(1.0, 0.55, 0.0);
                } else {
                    // Highlight - brilliant yellow/white
                    color = vec3(1.0, 0.95, 0.3);
                }
                
                // Temperature shift (minimal)
                float coreHeat = 0.8 + u_coreTemperature * 0.3;
                color = mix(color, vec3(1.0, 1.0, 0.9), temp * coreHeat * 0.25);
                
                // Saturation
                float gray = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(vec3(gray), color, sat * 1.15); // Boosted for vibrant cartoon look
                
                return color;
            }
            
            void main() {
                float time = mod(u_time, 1000.0);
                
                vec2 uv = v_texCoord;
                
                if (u_flipX > 0.5) {
                    uv.x = 1.0 - uv.x;
                }
                if (u_flipY > 0.5) {
                    uv.y = 1.0 - uv.y;
                }
                
                uv = (uv - 0.5) / u_zoom + 0.5;
                
                uv.x -= u_cameraX * 0.5;
                uv.y -= u_cameraY * 0.5;
                
                vec2 p;
                p.x = uv.x - u_flameSourceX;
                p.y = uv.y - u_flameSourceY;
                
                float flame = cartoonFlameShape(p, time);
                
                // Flat shading - posterize to exactly 3 levels
                float posterized = floor(flame * 3.0) / 3.0;
                
                // Get flat color
                vec3 fireColor = cartoonFireColor(posterized, u_temperature, u_saturation);
                
                // Sharp alpha cutoff for clean edges
                float alpha = step(0.1, flame) * (0.8 + u_intensity * 0.2);
                
                // Bold outline for cartoon style
                float outline = smoothstep(0.08, 0.12, flame) - smoothstep(0.12, 0.16, flame);
                fireColor = mix(fireColor, vec3(0.0), outline * 0.8); // Strong black outline
                
                // Simple highlight on brightest areas
                float highlight = step(0.75, posterized);
                fireColor += vec3(highlight * 0.4);
                
                gl_FragColor = vec4(fireColor, alpha);
            }
        `;
    }

    useShader(shaderName) {
        this.currentShader = shaderName;
        const program = this.programs[shaderName];
        if (program) {
            this.gl.useProgram(program);
            return program;
        }
        return null;
    }

    setUniforms(program, uniforms) {
        for (const [name, value] of Object.entries(uniforms)) {
            const location = this.gl.getUniformLocation(program, name);
            if (location !== null) {
                this.gl.uniform1f(location, value);
            }
        }
    }
}
