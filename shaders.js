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
            uniform float u_buoyancy;
            uniform float u_vorticity;
            uniform float u_dissipation;
            uniform float u_fuelConsumption;
            uniform float u_windStrength;
            uniform float u_windDirection;
            
            // Noise functions for fluid dynamics simulation
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                
                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
                
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);
                
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                
                i = mod289(i);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                
                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;
                
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);
                
                vec4 x = x_ * ns.x + ns.yyyy;
                vec4 y = y_ * ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                
                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);
                
                vec4 s0 = floor(b0) * 2.0 + 1.0;
                vec4 s1 = floor(b1) * 2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                
                vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
                
                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);
                
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }
            
            // Fractal Brownian Motion for turbulence (configurable octaves for performance)
            float fbm(vec3 p, int octaves) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                
                for(int i = 0; i < 8; i++) {
                    if (i >= octaves) break;
                    value += amplitude * snoise(p * frequency);
                    frequency *= 2.0;
                    amplitude *= 0.5;
                }
                
                return value;
            }
            
            // Simplified curl noise approximation for better performance
            vec3 curlNoise(vec3 p) {
                float eps = 0.15; // Larger epsilon for fewer samples
                
                // Simplified 2D curl (cheaper than full 3D)
                float n1 = snoise(p);
                float n2 = snoise(p + vec3(eps, 0.0, 0.0));
                float n3 = snoise(p + vec3(0.0, eps, 0.0));
                
                return vec3(
                    (n3 - n1) / eps,
                    (n1 - n2) / eps,
                    0.0
                );
            }
            
            // Simulate fluid velocity field with buoyancy
            vec2 velocityField(vec2 uv, float time) {
                vec3 p = vec3(uv * 2.0, time * 0.3);
                vec3 curl = curlNoise(p) * u_vorticity;
                
                // Base upward velocity (buoyancy)
                vec2 velocity = vec2(0.0, u_buoyancy * 2.0);
                
                // Add turbulent flow
                velocity += curl.xy * u_turbulence * 0.5;
                
                // Wind effect
                float windAngle = u_windDirection * 3.14159 * 2.0;
                vec2 windDir = vec2(cos(windAngle), sin(windAngle));
                velocity += windDir * u_windStrength * 0.3;
                
                return velocity;
            }
            
            // Fire shape with fluid dynamics simulation
            float fireShape(vec2 uv, float time) {
                vec2 p = uv;
                
                // Get velocity field
                vec2 velocity = velocityField(p, time);
                
                // Advect position using semi-Lagrangian method
                vec2 advectedPos = p - velocity * 0.05;
                
                // Multi-scale turbulence (use 6 octaves for performance balance)
                float turbulence1 = fbm(vec3(advectedPos * 3.0, time * 0.5), 6);
                float turbulence2 = fbm(vec3(advectedPos * 6.0, time * 0.8), 4);
                float turbulence3 = fbm(vec3(advectedPos * 12.0, time * 1.2), 3);
                
                // Combine turbulence scales
                p.x += (turbulence1 * 0.15 + turbulence2 * 0.08 + turbulence3 * 0.04) * u_turbulence;
                
                // Base flame shape with height falloff
                float flame = 1.0 - p.y;
                flame *= smoothstep(0.0, 0.3, p.y);
                
                // Temperature field (hotter at base, cooler at top)
                float temp = 1.0 - p.y * (1.0 - u_temperature);
                
                // Fuel consumption simulation
                float fuelDensity = exp(-p.y * u_fuelConsumption * 3.0);
                flame *= fuelDensity;
                
                // Dissipation at edges
                float dissipation = exp(-p.y * u_dissipation * 2.0);
                flame *= mix(1.0, dissipation, 0.5);
                
                // Width control with natural tapering
                float width = 1.0 - abs(p.x) * (1.0 + p.y * 1.5);
                width += turbulence1 * 0.15 * u_turbulence;
                flame *= smoothstep(0.0, 0.3, width);
                
                // Height adjustment
                flame *= u_height * 1.5;
                
                // Apply temperature influence
                flame *= mix(0.5, 1.0, temp);
                
                return flame;
            }
            
            // Blackbody radiation color mapping (physically accurate)
            vec3 blackbodyColor(float temp) {
                temp = clamp(temp, 0.0, 1.0);
                
                // Extended temperature range with more realistic colors
                vec3 color;
                
                if (temp < 0.15) {
                    // Very dark red (embers)
                    color = mix(vec3(0.1, 0.0, 0.0), vec3(0.3, 0.05, 0.0), temp / 0.15);
                } else if (temp < 0.35) {
                    // Dark red to red
                    color = mix(vec3(0.3, 0.05, 0.0), vec3(0.8, 0.1, 0.0), (temp - 0.15) / 0.2);
                } else if (temp < 0.5) {
                    // Red to orange-red
                    color = mix(vec3(0.8, 0.1, 0.0), vec3(1.0, 0.3, 0.0), (temp - 0.35) / 0.15);
                } else if (temp < 0.65) {
                    // Orange to yellow-orange
                    color = mix(vec3(1.0, 0.3, 0.0), vec3(1.0, 0.6, 0.1), (temp - 0.5) / 0.15);
                } else if (temp < 0.8) {
                    // Yellow-orange to yellow
                    color = mix(vec3(1.0, 0.6, 0.1), vec3(1.0, 0.9, 0.3), (temp - 0.65) / 0.15);
                } else if (temp < 0.92) {
                    // Yellow to white
                    color = mix(vec3(1.0, 0.9, 0.3), vec3(1.0, 1.0, 0.8), (temp - 0.8) / 0.12);
                } else {
                    // White to blue-white (very hot)
                    color = mix(vec3(1.0, 1.0, 0.8), vec3(0.9, 0.95, 1.0), (temp - 0.92) / 0.08);
                }
                
                return color;
            }
            
            // Temperature-based color mapping with saturation control
            vec3 temperatureColor(float temp, float saturation) {
                vec3 color = blackbodyColor(temp);
                
                // Apply saturation
                float gray = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(vec3(gray), color, saturation);
                
                return color;
            }
            
            void main() {
                vec2 uv = v_texCoord;
                uv = uv * 2.0 - 1.0;
                
                float flame = fireShape(uv, u_time);
                
                // Calculate local temperature with variation
                float localTemp = flame + u_temperature * 0.4 - 0.2;
                
                // Add temperature noise for realistic color variation
                vec3 tempNoiseSample = vec3(uv * 8.0, u_time * 0.6);
                float tempNoise = fbm(tempNoiseSample, 4) * 0.15;
                localTemp += tempNoise;
                localTemp = clamp(localTemp, 0.0, 1.0);
                
                // Get fire color using blackbody radiation
                vec3 fireColor = temperatureColor(localTemp * 1.3, u_saturation);
                
                // Calculate alpha with improved falloff
                float alpha = pow(flame * u_intensity, 1.3);
                alpha = clamp(alpha, 0.0, 1.0);
                
                // Add inner core glow (hottest part)
                float coreGlow = pow(flame, 0.4) * step(0.3, flame);
                fireColor += vec3(coreGlow * 0.4 * u_intensity);
                
                // Outer glow for atmosphere
                float outerGlow = pow(flame, 2.0) * 0.3;
                fireColor += vec3(outerGlow);
                
                // Edge softening for natural look
                float edgeFade = smoothstep(0.0, 0.15, flame);
                alpha *= edgeFade;
                
                gl_FragColor = vec4(fireColor, alpha);
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
                
                float flame = animeFlame(uv, u_time);
                
                // Get anime-style color
                vec3 fireColor = animeFireColor(flame, u_temperature, u_saturation);
                
                // Sharp edges for anime style
                float alpha = step(0.1, flame) * u_intensity;
                
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
