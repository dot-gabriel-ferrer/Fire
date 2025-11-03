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
        cameraY: 0,
        flipX: false,
        flipY: false,
        particlesEnabled: true,
        flameSourceX: 50,  // Center of screen (percentage)
        flameSourceY: 20,  // Near bottom of screen in shader coordinates (20% = bottom area)
        flameSourceSize: 30,  // Width of flame source (percentage)
        // Advanced physical parameters
        buoyancy: 50,  // Upward force (0-100)
        vorticity: 50,  // Rotational turbulence strength (0-100)
        diffusion: 50,  // Flame spread rate (0-100)
        baseWidth: 50,  // Base flame width multiplier (0-100)
        flameTaper: 50,  // How quickly flame narrows (0-100)
        coreTemperature: 50,  // Core heat intensity (0-100)
        oxygenLevel: 100  // Combustion completeness (0-100)
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
            cameraY: FireSimulation.DEFAULT_PARAMS.cameraY / 100,
            flipX: FireSimulation.DEFAULT_PARAMS.flipX,
            flipY: FireSimulation.DEFAULT_PARAMS.flipY,
            particlesEnabled: FireSimulation.DEFAULT_PARAMS.particlesEnabled,
            flameSourceX: FireSimulation.DEFAULT_PARAMS.flameSourceX / 100,  // 0-1 range
            flameSourceY: FireSimulation.DEFAULT_PARAMS.flameSourceY / 100,  // 0-1 range
            flameSourceSize: FireSimulation.DEFAULT_PARAMS.flameSourceSize / 100,  // 0-1 range
            // Advanced parameters
            buoyancy: FireSimulation.DEFAULT_PARAMS.buoyancy / 100,
            vorticity: FireSimulation.DEFAULT_PARAMS.vorticity / 100,
            diffusion: FireSimulation.DEFAULT_PARAMS.diffusion / 100,
            baseWidth: FireSimulation.DEFAULT_PARAMS.baseWidth / 100,
            flameTaper: FireSimulation.DEFAULT_PARAMS.flameTaper / 100,
            coreTemperature: FireSimulation.DEFAULT_PARAMS.coreTemperature / 100,
            oxygenLevel: FireSimulation.DEFAULT_PARAMS.oxygenLevel / 100,
            // Physics-based drag parameters (initialized to zero)
            dragVelocityX: 0.0,
            dragVelocityY: 0.0
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
        
        // Start animation on next frame to ensure all initialization is complete
        requestAnimationFrame(() => {
            // Re-setup canvas and viewport to ensure correct initialization
            // This fixes an issue where the canvas size or viewport might not be
            // correctly set on first load
            this.setupCanvas();
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.compositeCanvas.width = this.canvas.width;
            this.compositeCanvas.height = this.canvas.height;
            
            this.animate();
        });
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
        
        // Set viewport to match canvas size
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
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
        this.setupSlider('flameSourceSize', (value) => this.params.flameSourceSize = value / 100);
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
        
        // Advanced simulation parameters
        this.setupSlider('buoyancy', (value) => this.params.buoyancy = value / 100);
        this.setupSlider('vorticity', (value) => this.params.vorticity = value / 100);
        this.setupSlider('diffusion', (value) => this.params.diffusion = value / 100);
        this.setupSlider('baseWidth', (value) => this.params.baseWidth = value / 100);
        this.setupSlider('flameTaper', (value) => this.params.flameTaper = value / 100);
        this.setupSlider('coreTemperature', (value) => this.params.coreTemperature = value / 100);
        this.setupSlider('oxygenLevel', (value) => this.params.oxygenLevel = value / 100);
        
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
        
        // View flip controls
        document.getElementById('flipX').addEventListener('change', (e) => {
            this.params.flipX = e.target.checked;
        });
        document.getElementById('flipY').addEventListener('change', (e) => {
            this.params.flipY = e.target.checked;
        });
        
        // Particles enable/disable control
        document.getElementById('particlesEnabled').addEventListener('change', (e) => {
            this.params.particlesEnabled = e.target.checked;
            this.particleSystem.setEnabled(e.target.checked);
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
        
        // Canvas click and drag handlers for flame source positioning
        let isDragging = false;
        let dragVelocityX = 0;
        let dragVelocityY = 0;
        let lastDragX = 0;
        let lastDragY = 0;
        let lastDragTime = 0;
        
        const updateFlamePosition = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            // Screen Y: 0 at top, 1 at bottom
            // We want flame source Y in texture coordinates: 0 at bottom, 1 at top
            const y = 1.0 - ((e.clientY - rect.top) / rect.height);
            
            // Update flame source position
            this.params.flameSourceX = x;
            this.params.flameSourceY = y;
            
            return { x, y };
        };
        
        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            const pos = updateFlamePosition(e);
            lastDragX = pos.x;
            lastDragY = pos.y;
            lastDragTime = Date.now();
            dragVelocityX = 0;
            dragVelocityY = 0;
            // Reset shader drag velocity
            this.params.dragVelocityX = 0;
            this.params.dragVelocityY = 0;
            this.canvas.style.cursor = 'grabbing';
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) {
                this.canvas.style.cursor = 'grab';
                return;
            }
            
            const currentTime = Date.now();
            // Minimum delta time of 1ms prevents division by zero or extremely small values
            // which could cause numerical instability in velocity calculations
            const MIN_DELTA_TIME = 1; // milliseconds
            const dt = Math.max(currentTime - lastDragTime, MIN_DELTA_TIME) / 1000; // convert to seconds
            const pos = updateFlamePosition(e);
            
            // Calculate velocity for physics-based momentum
            dragVelocityX = (pos.x - lastDragX) / dt;
            dragVelocityY = (pos.y - lastDragY) / dt;
            
            // Update params for real-time shader deformation
            // Scale velocity to appropriate range for visual effect
            this.params.dragVelocityX = dragVelocityX;
            this.params.dragVelocityY = dragVelocityY;
            
            lastDragX = pos.x;
            lastDragY = pos.y;
            lastDragTime = currentTime;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.canvas.style.cursor = 'grab';
                
                // Apply momentum physics
                this.applyDragMomentum(dragVelocityX, dragVelocityY);
                
                // Reset drag velocity for shader (momentum is handled separately)
                this.params.dragVelocityX = 0;
                this.params.dragVelocityY = 0;
            }
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                this.canvas.style.cursor = 'grab';
                
                // Reset drag velocity when mouse leaves canvas
                this.params.dragVelocityX = 0;
                this.params.dragVelocityY = 0;
            }
        });
        
        // Set initial cursor
        this.canvas.style.cursor = 'grab';
    }

    applyDragMomentum(velocityX, velocityY) {
        // Apply physics-based momentum when drag is released
        const friction = 0.92; // Damping factor
        const minVelocity = 0.001; // Stop threshold
        let vx = velocityX;
        let vy = velocityY;
        
        // Track last frame time for accurate physics calculation
        let lastFrameTime = performance.now();
        
        const applyMomentumFrame = () => {
            // Calculate actual delta time for frame-rate independent physics
            const currentTime = performance.now();
            const deltaTime = (currentTime - lastFrameTime) / 1000; // convert to seconds
            lastFrameTime = currentTime;
            
            // Apply friction
            const frictionFactor = Math.pow(friction, deltaTime * 60); // Normalize to 60 FPS baseline
            vx *= frictionFactor;
            vy *= frictionFactor;
            
            // Update position using actual delta time
            this.params.flameSourceX += vx * deltaTime;
            this.params.flameSourceY += vy * deltaTime;
            
            // Clamp to bounds
            this.params.flameSourceX = Math.max(0, Math.min(1, this.params.flameSourceX));
            this.params.flameSourceY = Math.max(0, Math.min(1, this.params.flameSourceY));
            
            // Continue if velocity is significant
            if (Math.abs(vx) > minVelocity || Math.abs(vy) > minVelocity) {
                requestAnimationFrame(applyMomentumFrame);
            }
        };
        
        // Only apply momentum if velocity is significant
        if (Math.abs(velocityX) > minVelocity || Math.abs(velocityY) > minVelocity) {
            requestAnimationFrame(applyMomentumFrame);
        }
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
        
        // Reset checkboxes
        document.getElementById('flipX').checked = FireSimulation.DEFAULT_PARAMS.flipX;
        document.getElementById('flipY').checked = FireSimulation.DEFAULT_PARAMS.flipY;
        this.params.flipX = FireSimulation.DEFAULT_PARAMS.flipX;
        this.params.flipY = FireSimulation.DEFAULT_PARAMS.flipY;
        
        document.getElementById('particlesEnabled').checked = FireSimulation.DEFAULT_PARAMS.particlesEnabled;
        this.params.particlesEnabled = FireSimulation.DEFAULT_PARAMS.particlesEnabled;
        this.particleSystem.setEnabled(FireSimulation.DEFAULT_PARAMS.particlesEnabled);
        
        // Reset flame source position (no sliders for these)
        this.params.flameSourceX = FireSimulation.DEFAULT_PARAMS.flameSourceX / 100;
        this.params.flameSourceY = FireSimulation.DEFAULT_PARAMS.flameSourceY / 100;
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
            u_cameraY: this.params.cameraY,
            u_flipX: this.params.flipX ? 1.0 : 0.0,
            u_flipY: this.params.flipY ? 1.0 : 0.0,
            u_flameSourceX: this.params.flameSourceX,
            u_flameSourceY: this.params.flameSourceY,
            u_flameSourceSize: this.params.flameSourceSize,
            // Advanced parameters
            u_buoyancy: this.params.buoyancy,
            u_vorticity: this.params.vorticity,
            u_diffusion: this.params.diffusion,
            u_baseWidth: this.params.baseWidth,
            u_flameTaper: this.params.flameTaper,
            u_coreTemperature: this.params.coreTemperature,
            u_oxygenLevel: this.params.oxygenLevel,
            // Physics-based drag parameters
            u_dragVelocityX: this.params.dragVelocityX,
            u_dragVelocityY: this.params.dragVelocityY
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
        
        // Wrap time to prevent floating-point precision issues
        // This ensures the flame persists indefinitely without degradation
        // We wrap at a high value (1000) to maintain smooth animation
        if (this.time > 1000.0) {
            this.time = this.time % 1000.0;
        }
        
        // Clear particle canvas
        const particleCtx = this.particleCanvas.getContext('2d');
        particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
        
        // Update particle system with current flame source position
        this.particleSystem.setFlameSource(
            this.params.flameSourceX,
            this.params.flameSourceY,
            this.params.flameSourceSize
        );
        
        // Update particle system with drag velocity for volumetric lighting
        this.particleSystem.setDragVelocity(
            this.params.dragVelocityX,
            this.params.dragVelocityY
        );
        
        // Particles are enabled/disabled based on particlesEnabled parameter
        const particlesEnabled = this.params.particlesEnabled && this.params.particleCount > 0;
        if (particlesEnabled) {
            this.particleSystem.update(deltaTime);
            this.particleSystem.render();
        }
        
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
    // Expose instance globally for debugging and testing purposes
    window.fireSimulation = new FireSimulation();
});
