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
            
            const float TWO_PI = 6.283185307;
            
            // Flame positioning constants - align with particle spawn at canvas.height * 0.95
            // Derivation: particles spawn at 95% down (y=0.95 in texture coords)
            // After transform: (0.95 - 0.5) * 2 = 0.9, then -0.9 after flip
            // We offset by 0.8 to position flame base in flame coordinate space
            const float FLAME_BASE_OFFSET = 0.8;     // Base vertical offset for flame positioning
            const float FLAME_HEIGHT_FACTOR = 0.15;  // Height parameter influence on positioning
            
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
            
            // Realistic flame shape using deforming approach
            float flameShape(vec2 p, float time) {
                // Apply wind deformation
                float windAngle = u_windDirection * TWO_PI;
                vec2 windDir = vec2(cos(windAngle), sin(windAngle));
                p.x -= windDir.x * u_windStrength * (1.0 - p.y * 0.5) * 0.5;
                
                // Base flame teardrop shape - wider base
                float baseWidth = 0.4 + u_height * 0.3;
                float tipWidth = 0.08;
                float width = mix(baseWidth, tipWidth, pow(p.y, 0.5));
                
                // Apply turbulence-based deformation
                float turbNoise = fbm(vec2(p.x * 2.5 + time * 0.6, p.y * 3.0 - time * 1.2));
                
                // Deform the flame horizontally (flickering)
                float deform = (turbNoise - 0.5) * u_turbulence * 0.5;
                
                // Calculate distance from center line with deformation
                float distFromCenter = abs(p.x + deform) / width;
                
                // Base shape (smooth teardrop) - more forgiving
                float shape = 1.0 - distFromCenter;
                shape = smoothstep(0.0, 0.4, shape);
                
                // Vertical flickering (flame dancing)
                float verticalFlicker = sin(time * 2.5 + p.x * 4.0) * 0.04 * u_turbulence;
                float heightMod = p.y - verticalFlicker;
                
                // Height cutoff with soft edge - adjusted for better visibility
                shape *= smoothstep(u_height * 1.5, 0.0, heightMod);
                shape *= smoothstep(-0.15, 0.05, heightMod);
                
                // Add subtle detail for realism
                float detail = fbm(vec2(p.x * 6.0, p.y * 8.0 - time * 2.0));
                shape *= 0.8 + detail * 0.2;
                
                return clamp(shape * 1.2, 0.0, 1.0);
            }
            
            // Realistic fire color based on temperature physics
            vec3 flameColor(float intensity, float height) {
                // Temperature gradient: hotter at bottom, cooler at top
                float temp = intensity * (1.0 - height * 0.6);
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
                vec2 uv = v_texCoord;
                // Center and scale coordinates
                uv = (uv - 0.5) * 2.0;
                uv.y = -uv.y; // Flip Y so flame goes up
                
                // Apply zoom (scale)
                uv /= u_zoom;
                
                // Apply camera offset
                uv.x -= u_cameraX;
                uv.y -= u_cameraY;
                
                // Adjust for flame positioning to align flame base with particle spawn point
                // Particles spawn at canvas.height * 0.95 (5% from bottom)
                // After coordinate transformations, this maps to approximately y = 0.8 in flame space
                // The offset ensures flame originates where particles are emitted
                uv.y += FLAME_BASE_OFFSET - u_height * FLAME_HEIGHT_FACTOR;
                
                float flame = flameShape(uv, u_time);
                
                // Calculate color based on position and intensity
                float heightFactor = clamp((1.0 - uv.y) * 0.5, 0.0, 1.0);
                vec3 color = flameColor(flame, uv.y);
                
                // Enhance brightness
                float brightness = pow(flame, 0.6);
                color *= 1.0 + brightness * 0.5;
                
                // Add glow effect
                float glow = pow(flame, 0.4) * 0.6;
                color += vec3(glow * 0.4);
                
                // Inner core brightness (hottest part at base)
                float coreBrightness = pow(flame, 0.25) * (1.0 - clamp(uv.y, 0.0, 1.0) * 0.6);
                color += vec3(coreBrightness * 0.5);
                
                // Calculate final alpha - ensure persistent visibility
                // Apply intensity scaling more aggressively to maintain flame presence
                float baseAlpha = flame * (0.7 + u_intensity * 0.6);
                
                // Soft edges with less aggressive smoothstep
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
            
            // Flame positioning constants - shared with realistic shader
            // Derivation: particles spawn at 95% down (y=0.95 in texture coords)
            // After transform: (0.95 - 0.5) * 2 = 0.9, then -0.9 after flip
            // We offset by 0.8 to position flame base in flame coordinate space
            const float FLAME_BASE_OFFSET = 0.8;     // Base vertical offset for flame positioning
            const float FLAME_HEIGHT_FACTOR = 0.15;  // Height parameter influence on positioning
            
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
            float animeFlame(vec2 uv, float time) {
                vec2 p = uv;
                
                // Add stylized wobble
                p.x += sin(p.y * 8.0 - time * 3.0) * 0.08 * u_turbulence;
                p.x += sin(p.y * 4.0 - time * 2.0) * 0.12 * u_turbulence;
                
                // Flame shape
                float flame = 1.0 - p.y;
                flame *= smoothstep(0.0, 0.2, p.y);
                
                // Width
                float width = 1.0 - abs(p.x) * (1.5 + p.y * 1.5);
                flame *= smoothstep(0.0, 0.4, width);
                
                // Add stylized layers
                float layer1 = step(0.3, flame);
                float layer2 = step(0.5, flame);
                float layer3 = step(0.7, flame);
                
                // Combine layers with distinct edges
                flame = layer1 * 0.3 + layer2 * 0.3 + layer3 * 0.4;
                
                // Height
                flame *= u_height * 1.8;
                
                return flame;
            }
            
            // Anime color palette
            vec3 animeFireColor(float value, float temp, float sat) {
                vec3 color;
                
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
                color = mix(color, vec3(1.0, 1.0, 1.0), temp * 0.3);
                
                // Saturation
                float gray = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(vec3(gray), color, sat);
                
                return color;
            }
            
            void main() {
                vec2 uv = v_texCoord;
                uv = uv * 2.0 - 1.0;
                // Flip Y to make flame go up and align with particles at bottom
                uv.y = -uv.y;
                
                // Apply zoom (scale)
                uv /= u_zoom;
                
                // Apply camera offset
                uv.x -= u_cameraX;
                uv.y -= u_cameraY;
                
                // Use same positioning logic as realistic shader for consistency
                uv.y += FLAME_BASE_OFFSET - u_height * FLAME_HEIGHT_FACTOR;
                
                float flame = animeFlame(uv, u_time);
                
                // Get anime-style color
                vec3 fireColor = animeFireColor(flame, u_temperature, u_saturation);
                
                // Sharp edges for anime style - ensure persistent visibility
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
