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

        // Create anime fire shader
        this.programs.anime = this.createProgram(
            this.getVertexShader(),
            this.getAnimeFragmentShader()
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
            
            const float TWO_PI = 6.283185307;
            const float PI = 3.14159265359;
            
            // Simple hash function for noise generation
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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
                
                // Wind deformation - more effect higher up
                // Wind should deform the flame but NOT move its origin
                float windAngle = u_windDirection * TWO_PI;
                vec2 windDir = vec2(cos(windAngle), sin(windAngle));
                float windDeform = windDir.x * u_windStrength * normalizedHeight * 0.3;
                
                // Vorticity-based turbulence (rotational chaos)
                float vortNoise = fbm(vec2(p.x * 3.0 + time * 0.4, p.y * 2.0 - time * 0.8));
                float vorticityDeform = (vortNoise - 0.5) * u_vorticity * 0.3;
                
                // Standard turbulence deformation
                float turbNoise = fbm(vec2(p.x * 2.5 + time * 0.6, p.y * 3.0 - time * 1.2));
                float turbDeform = (turbNoise - 0.5) * u_turbulence * 0.5;
                
                // Combine deformations (these only affect shape, not origin)
                float totalDeform = windDeform + vorticityDeform + turbDeform;
                
                // Calculate distance from center line with deformation
                float distFromCenter = abs(p.x + totalDeform) / width;
                
                // Base shape (smooth teardrop)
                float shape = 1.0 - smoothstep(0.0, 1.0, distFromCenter);
                
                // Vertical flickering (flame dancing) - buoyancy affects oscillation
                float flickerSpeed = 2.5 + u_buoyancy * 1.5;
                float verticalFlicker = sin(time * flickerSpeed + p.x * 4.0) * 0.04 * u_turbulence;
                float heightMod = p.y - verticalFlicker;
                
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
            
            const float PI = 3.14159265359;
            
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
            
            // Anime-style flame shape with distinct layers
            float animeFlame(vec2 p, float time) {
                // p.x = horizontal distance from flame source
                // p.y = vertical distance from flame source (positive = upward)
                
                // Normalize height
                float effectiveHeight = u_height * (1.5 + u_buoyancy * 0.5);
                float normalizedHeight = p.y / (effectiveHeight * 2.0);
                
                // Calculate base width
                float baseWidthMultiplier = 0.5 + u_baseWidth * 1.0;
                float baseSize = u_flameSourceSize * baseWidthMultiplier;
                
                // Add stylized wobble - turbulence doesn't move origin
                float wobble = sin(p.y * 8.0 - time * 3.0) * 0.08 * u_turbulence;
                wobble += sin(p.y * 4.0 - time * 2.0) * 0.12 * u_turbulence;
                
                // Vorticity effect
                float vortEffect = sin(p.y * 6.0 + time * 2.0) * u_vorticity * 0.1;
                
                float totalDeform = wobble + vortEffect;
                
                // Flame shape with taper
                float flame = 1.0 - normalizedHeight;
                flame *= smoothstep(0.0, 0.2, normalizedHeight);
                
                // Width based on source size and diffusion
                float taperStrength = 0.3 + u_flameTaper * 0.7;
                float width = 1.0 - abs(p.x + totalDeform) / (baseSize * (0.5 + u_diffusion * 0.5) + normalizedHeight * (1.0 - taperStrength) * 0.5);
                flame *= smoothstep(0.0, 0.4, width);
                
                // Add stylized layers
                float layer1 = step(0.3, flame);
                float layer2 = step(0.5, flame);
                float layer3 = step(0.7, flame);
                
                // Combine layers with distinct edges
                flame = layer1 * 0.3 + layer2 * 0.3 + layer3 * 0.4;
                
                // Height cutoff
                flame *= smoothstep(effectiveHeight * 2.5, effectiveHeight * 1.5, p.y);
                flame *= smoothstep(-0.1, 0.0, p.y);
                
                // Oxygen level affects completeness
                flame *= 0.5 + u_oxygenLevel * 0.5;
                
                return flame;
            }
            
            // Anime color palette
            vec3 animeFireColor(float value, float temp, float sat) {
                vec3 color;
                
                // Core temperature affects base colors
                float coreHeat = 0.8 + u_coreTemperature * 0.4;
                
                // Distinct color bands typical of anime
                if (value < 0.25) {
                    color = vec3(0.4, 0.0, 0.1); // Dark red
                } else if (value < 0.5) {
                    color = vec3(0.9, 0.1, 0.0); // Bright red
                } else if (value < 0.75) {
                    color = vec3(1.0, 0.5, 0.0); // Orange
                } else {
                    color = vec3(1.0, 1.0, 0.3); // Bright yellow
                }
                
                // Temperature shift
                color = mix(color, vec3(1.0, 1.0, 1.0), temp * coreHeat * 0.3);
                
                // Saturation
                float gray = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(vec3(gray), color, sat);
                
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
                
                // Get anime-style color
                vec3 fireColor = animeFireColor(flame, u_temperature, u_saturation);
                
                // Sharp edges for anime style
                float alpha = step(0.1, flame) * (0.7 + u_intensity * 0.3);
                
                // Add highlight
                float highlight = step(0.75, flame) * 0.4;
                fireColor += vec3(highlight);
                
                // Outline effect
                float outline = smoothstep(0.08, 0.12, flame) - smoothstep(0.12, 0.16, flame);
                fireColor = mix(fireColor, vec3(0.0), outline * 0.5);
                
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
