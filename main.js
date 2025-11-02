// Main Application
class FireSimulation {
    // Default parameter values
    static DEFAULT_PARAMS = {
        intensity: 70,
        height: 60,
        turbulence: 50,
        speed: 100,
        temperature: 50,
        saturation: 80,
        particleCount: 80,  // Reduced from 200 - particles are now accent only
        particleSize: 3,
        particleLifetime: 1.0,
        windStrength: 0,
        windDirection: 0,
        zoom: 100,
        cameraX: 0,
        cameraY: 0
    };

    constructor() {
        this.canvas = document.getElementById('fireCanvas');
        this.particleCanvas = document.getElementById('particleCanvas');
        this.setupCanvas();
        
        // Initialize WebGL
        this.gl = this.canvas.getContext('webgl', { 
            alpha: true, 
            premultipliedAlpha: false,
            antialias: true
        });
        
        if (!this.gl) {
            const errorMsg = 'WebGL is not supported in this browser.\n\n' +
                           'Requirements:\n' +
                           '- Modern browser (Chrome 56+, Firefox 52+, Safari 11+, Edge 79+)\n' +
                           '- Hardware acceleration enabled\n' +
                           '- Updated graphics drivers\n\n' +
                           'Please update your browser or enable hardware acceleration in browser settings.';
            alert(errorMsg);
            return;
        }

        // Initialize systems
        this.shaderManager = new ShaderManager(this.gl);
        this.shaderManager.initializeShaders();
        
        this.particleSystem = new ParticleSystem(this.particleCanvas);
        
        // Initialize preset manager
        this.presetManager = new PresetManager(this);
        
        // Create composite canvas for recording
        this.compositeCanvas = document.createElement('canvas');
        this.compositeCanvas.width = this.canvas.width;
        this.compositeCanvas.height = this.canvas.height;
        
        this.recorder = new FireRecorder(this.compositeCanvas);
        
        // Parameters - convert to 0-1 range
        this.params = {
            intensity: FireSimulation.DEFAULT_PARAMS.intensity / 100,
            height: FireSimulation.DEFAULT_PARAMS.height / 100,
            turbulence: FireSimulation.DEFAULT_PARAMS.turbulence / 100,
            speed: FireSimulation.DEFAULT_PARAMS.speed / 100,
            temperature: FireSimulation.DEFAULT_PARAMS.temperature / 100,
            saturation: FireSimulation.DEFAULT_PARAMS.saturation / 100,
            particleCount: FireSimulation.DEFAULT_PARAMS.particleCount,
            particleSize: FireSimulation.DEFAULT_PARAMS.particleSize,
            particleLifetime: FireSimulation.DEFAULT_PARAMS.particleLifetime,
            windStrength: FireSimulation.DEFAULT_PARAMS.windStrength / 100,
            windDirection: FireSimulation.DEFAULT_PARAMS.windDirection / 100,
            zoom: FireSimulation.DEFAULT_PARAMS.zoom / 100,
            cameraX: FireSimulation.DEFAULT_PARAMS.cameraX / 100,
            cameraY: FireSimulation.DEFAULT_PARAMS.cameraY / 100
        };
        
        // Animation
        this.time = 0;
        this.lastFrameTime = Date.now();
        
        // Performance monitoring
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsUpdate = Date.now();
        
        // Resize handling
        this.resizeTimeout = null;
        
        // Setup WebGL
        this.setupWebGL();
        this.setupControls();
        this.setupKeyboardShortcuts();
        
        // Initialize wind for particle system
        this.particleSystem.setWind(this.params.windStrength, this.params.windDirection);
        
        // Handle window resize
        this.setupResizeHandler();
        
        // Start animation
        this.animate();
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent shortcuts when typing in inputs, textareas, or select elements
            if (e.target.matches('input, textarea, select')) return;
            
            switch(e.key.toLowerCase()) {
                case 'r':
                    // Reset to defaults
                    this.resetToDefaults();
                    break;
                case '1':
                    this.presetManager.applyPreset('campfire');
                    break;
                case '2':
                    this.presetManager.applyPreset('torch');
                    break;
                case '3':
                    this.presetManager.applyPreset('bonfire');
                    break;
                case '4':
                    this.presetManager.applyPreset('candle');
                    break;
                case 's':
                    // Toggle shader
                    if (this.shaderManager.currentShader === 'realistic') {
                        this.setShaderStyle('anime');
                    } else {
                        this.setShaderStyle('realistic');
                    }
                    break;
                case 'p':
                    // Export PNG
                    this.createCompositeFrame();
                    this.recorder.exportPNG();
                    break;
                case ' ':
                    // Pause/resume (toggle speed to 0 or 100)
                    e.preventDefault();
                    const speedSlider = document.getElementById('speed');
                    if (parseInt(speedSlider.value) === 0) {
                        speedSlider.value = '100';
                    } else {
                        speedSlider.value = '0';
                    }
                    speedSlider.dispatchEvent(new Event('input'));
                    break;
            }
        });
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const width = container.clientWidth;
        // Use 16:9 aspect ratio for responsive height
        const height = Math.round(width * 9 / 16);
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.particleCanvas.width = width;
        this.particleCanvas.height = height;
    }

    setupWebGL() {
        const gl = this.gl;
        
        // Create buffer for full-screen quad
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);
        
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        
        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    setupResizeHandler() {
        this.handleResize = () => {
            // Debounce resize events
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.setupCanvas();
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                
                // Update composite canvas size
                this.compositeCanvas.width = this.canvas.width;
                this.compositeCanvas.height = this.canvas.height;
            }, 250);
        };
        
        window.addEventListener('resize', this.handleResize);
    }

    setupControls() {
        // Setup collapsible sections
        document.querySelectorAll('.control-section-header').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.getAttribute('data-section');
                const content = document.getElementById(`${section}-content`);
                const icon = header.querySelector('.toggle-icon');
                
                if (content) {
                    content.classList.toggle('collapsed');
                    icon.classList.toggle('collapsed');
                }
            });
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const presetName = e.target.getAttribute('data-preset');
                this.presetManager.applyPreset(presetName);
                
                // Visual feedback
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Shader selection
        document.getElementById('realisticBtn').addEventListener('click', () => {
            this.setShaderStyle('realistic');
        });
        
        document.getElementById('animeBtn').addEventListener('click', () => {
            this.setShaderStyle('anime');
        });
        
        // Parameter controls
        this.setupSlider('intensity', (value) => this.params.intensity = value / 100);
        this.setupSlider('height', (value) => this.params.height = value / 100);
        this.setupSlider('turbulence', (value) => this.params.turbulence = value / 100);
        this.setupSlider('speed', (value) => this.params.speed = value / 100);
        this.setupSlider('temperature', (value) => this.params.temperature = value / 100);
        this.setupSlider('saturation', (value) => this.params.saturation = value / 100);
        this.setupSlider('particleCount', (value) => {
            this.params.particleCount = value;
            this.particleSystem.setMaxParticles(value);
        });
        this.setupSlider('particleSize', (value) => {
            this.params.particleSize = value;
            this.particleSystem.setParticleSize(value);
        });
        this.setupSlider('particleLifetime', (value) => {
            this.params.particleLifetime = value;
            this.particleSystem.setAverageLifetime(value);
        });
        
        // Environmental controls
        this.setupSlider('windStrength', (value) => {
            this.params.windStrength = value / 100;
            this.particleSystem.setWind(this.params.windStrength, this.params.windDirection);
        });
        this.setupSlider('windDirection', (value) => {
            this.params.windDirection = value / 100;
            this.particleSystem.setWind(this.params.windStrength, this.params.windDirection);
        });
        
        // View controls
        this.setupSlider('zoom', (value) => {
            this.params.zoom = value / 100;
        });
        this.setupSlider('cameraX', (value) => {
            this.params.cameraX = value / 100;
        });
        this.setupSlider('cameraY', (value) => {
            this.params.cameraY = value / 100;
        });
        
        // Export controls
        document.getElementById('recordBtn').addEventListener('click', () => {
            if (!this.recorder.isRecording) {
                this.recorder.startRecording();
                document.getElementById('recordBtn').textContent = 'Stop Recording';
                document.getElementById('recordBtn').classList.add('secondary');
            } else {
                this.recorder.stopRecording();
                document.getElementById('recordBtn').textContent = 'Record GIF';
                document.getElementById('recordBtn').classList.remove('secondary');
            }
        });
        
        document.getElementById('screenshotBtn').addEventListener('click', () => {
            this.createCompositeFrame();
            this.recorder.exportPNG();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetToDefaults();
        });
    }

    setupSlider(id, callback) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            // Display value with appropriate precision
            if (id === 'particleLifetime') {
                valueDisplay.textContent = value.toFixed(1);
            } else {
                valueDisplay.textContent = Math.round(value);
            }
            callback(value);
        });
    }

    setShaderStyle(style) {
        this.shaderManager.currentShader = style;
        
        // Update button states
        document.querySelectorAll('.shader-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (style === 'realistic') {
            document.getElementById('realisticBtn').classList.add('active');
        } else {
            document.getElementById('animeBtn').classList.add('active');
        }
    }

    resetToDefaults() {
        // Reset sliders to default values using static defaults
        for (const [key, value] of Object.entries(FireSimulation.DEFAULT_PARAMS)) {
            const slider = document.getElementById(key);
            if (slider) {
                slider.value = value;
                slider.dispatchEvent(new Event('input'));
            }
        }
    }

    render() {
        const gl = this.gl;
        
        // Clear canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Use current shader
        const program = this.shaderManager.useShader(this.shaderManager.currentShader);
        if (!program) return;
        
        // Set uniforms
        this.shaderManager.setUniforms(program, {
            u_time: this.time,
            u_intensity: this.params.intensity,
            u_height: this.params.height,
            u_turbulence: this.params.turbulence,
            u_temperature: this.params.temperature,
            u_saturation: this.params.saturation,
            u_windStrength: this.params.windStrength,
            u_windDirection: this.params.windDirection,
            u_zoom: this.params.zoom,
            u_cameraX: this.params.cameraX,
            u_cameraY: this.params.cameraY
        });
        
        // Set vertex attributes
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    createCompositeFrame() {
        const ctx = this.compositeCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.compositeCanvas.width, this.compositeCanvas.height);
        
        // Draw WebGL canvas
        ctx.drawImage(this.canvas, 0, 0);
        
        // Draw particle canvas on top
        ctx.drawImage(this.particleCanvas, 0, 0);
    }

    animate() {
        const now = Date.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        
        // Update FPS counter
        this.frameCount++;
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            // Update FPS display if element exists
            const fpsDisplay = document.getElementById('fpsDisplay');
            if (fpsDisplay) {
                fpsDisplay.textContent = `${this.fps} FPS`;
            }
        }
        
        // Update time based on speed
        this.time += deltaTime * this.params.speed;
        
        // Clear particle canvas
        const particleCtx = this.particleCanvas.getContext('2d');
        particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
        
        // Update and render particles
        this.particleSystem.update(deltaTime);
        this.particleSystem.render();
        
        // Render fire
        this.render();
        
        // Create composite frame for recording
        if (this.recorder.isRecording) {
            this.createCompositeFrame();
            this.recorder.captureFrame();
        }
        
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        // Cleanup resize listener to prevent memory leaks
        if (this.handleResize) {
            window.removeEventListener('resize', this.handleResize);
        }
        
        // Clear any pending timeouts
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FireSimulation();
});
