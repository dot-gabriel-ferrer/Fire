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
            
            // Fractal Brownian Motion for turbulence
            float fbm(vec3 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                
                for(int i = 0; i < 6; i++) {
                    value += amplitude * snoise(p * frequency);
                    frequency *= 2.0;
                    amplitude *= 0.5;
                }
                
                return value;
            }
            
            // Fire shape and dynamics
            float fireShape(vec2 uv, float time) {
                vec2 p = uv;
                p.x += fbm(vec3(p * 3.0, time * 0.5)) * 0.15 * u_turbulence;
                
                // Base flame shape
                float flame = 1.0 - p.y;
                flame *= smoothstep(0.0, 0.3, p.y);
                
                // Add turbulent flow
                float turbulence = fbm(vec3(p.x * 4.0, p.y * 2.0 - time * 1.5, time * 0.8));
                turbulence += fbm(vec3(p.x * 8.0, p.y * 4.0 - time * 3.0, time * 1.5)) * 0.5;
                
                flame *= (0.5 + 0.5 * turbulence);
                
                // Width control
                float width = 1.0 - abs(p.x) * (1.0 + p.y * 2.0);
                flame *= smoothstep(0.0, 0.3, width);
                
                // Height adjustment
                flame *= u_height * 1.5;
                
                return flame;
            }
            
            // Temperature-based color mapping
            vec3 temperatureColor(float temp, float saturation) {
                vec3 color;
                
                if (temp < 0.3) {
                    // Dark red to red
                    color = mix(vec3(0.2, 0.0, 0.0), vec3(1.0, 0.0, 0.0), temp / 0.3);
                } else if (temp < 0.6) {
                    // Red to orange
                    color = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 0.5, 0.0), (temp - 0.3) / 0.3);
                } else if (temp < 0.8) {
                    // Orange to yellow
                    color = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.0), (temp - 0.6) / 0.2);
                } else {
                    // Yellow to white
                    color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 1.0), (temp - 0.8) / 0.2);
                }
                
                // Apply saturation
                float gray = dot(color, vec3(0.299, 0.587, 0.114));
                color = mix(vec3(gray), color, saturation);
                
                return color;
            }
            
            void main() {
                vec2 uv = v_texCoord;
                uv.y = 1.0 - uv.y;
                uv = uv * 2.0 - 1.0;
                
                float flame = fireShape(uv, u_time);
                
                // Add temperature variation
                float temp = flame + u_temperature * 0.3 - 0.15;
                temp = clamp(temp, 0.0, 1.0);
                
                // Get fire color
                vec3 fireColor = temperatureColor(temp * 1.2, u_saturation);
                
                // Apply intensity and create glow
                float alpha = pow(flame * u_intensity, 1.5);
                alpha = clamp(alpha, 0.0, 1.0);
                
                // Add inner glow
                float glow = pow(flame, 0.5) * 0.5;
                fireColor += vec3(glow * 0.3);
                
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
                uv.y = 1.0 - uv.y;
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
