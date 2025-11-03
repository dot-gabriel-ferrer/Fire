# Technical Documentation

## Architecture Overview

The Fire Simulation Tool is built using a modular architecture with clear separation of concerns:

```
Fire Simulation Tool
├── WebGL Rendering Layer (shaders.js)
├── Particle System (particles.js)
├── Recording/Export (recorder.js)
├── Application Logic (main.js)
└── User Interface (index.html, styles.css)
```

## Core Components

### 1. Shader Manager (shaders.js)

Manages WebGL shader compilation, program linking, and uniform updates.

**Key Classes:**
- `ShaderManager`: Main shader management system

**Shader Types:**
- Realistic shader: Implements fluid dynamics using Perlin noise
- Anime shader: Implements cell-shading with discrete color bands

**Technical Details:**

The realistic shader uses:
- 3D Simplex noise (Perlin noise variant)
- Fractal Brownian Motion with 6 octaves
- Temperature-based color mapping
- Smooth falloff for natural flame shape
- **Physics-based drag deformation**:
  - Real-time drag velocity uniforms (`u_dragVelocityX`, `u_dragVelocityY`)
  - Quadratic height scaling for realistic mass distribution
  - Horizontal displacement from drag (like wind effect)
  - Vertical compression/stretching based on drag direction
  - Dynamic turbulence generation proportional to drag magnitude

The anime shader uses:
- Simplified 2D hash-based noise
- Step functions for discrete color layers
- Sinusoidal motion for stylized movement
- Edge detection for outlines
- **Drag physics support** for consistent behavior across shader styles

### 2. Particle System (particles.js)

Physics-based particle emitter and renderer.

**Key Classes:**
- `ParticleSystem`: Manages particle lifecycle

**Particle Properties:**
- Position (x, y)
- Velocity (vx, vy)
- Life (0.0 to 1.0)
- Size, hue, saturation, brightness

**Update Loop:**
```
For each frame:
  1. Emit new particles at base
  2. Update positions based on velocity
  3. Apply physics (gravity, turbulence)
  4. Decay particle life
  5. Remove dead particles
  6. Render with radial gradients
```

### 3. Recorder (recorder.js)

Handles frame capture and export functionality.

**Export Formats:**
- PNG: Immediate canvas snapshot
- GIF: Frame sequence capture (requires external library for encoding)

**Implementation Notes:**
- Uses canvas.toDataURL() for frame capture
- Maximum recording duration: 5 seconds
- Frame rate: 30 FPS target

### 4. Main Application (main.js)

Application initialization and main render loop.

**Initialization Sequence:**
```
1. Setup canvases (WebGL and 2D)
2. Initialize WebGL context
3. Compile shaders
4. Create particle system
5. Setup UI event handlers
6. Start animation loop
```

**Render Loop:**
```
requestAnimationFrame:
  1. Calculate delta time
  2. Update time uniform
  3. Clear particle canvas
  4. Update particle physics
  5. Render particles
  6. Render WebGL fire
  7. Composite for recording (if active)
  8. Capture frame (if recording)
```

## WebGL Implementation

### Vertex Shader

Simple full-screen quad covering the viewport:

```glsl
attribute vec2 a_position;
varying vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_position * 0.5 + 0.5;
}
```

### Fragment Shader (Realistic)

Key algorithms:
1. **Simplex Noise**: Generates organic 3D noise field
2. **FBM**: Combines multiple noise octaves for detail
3. **Flame Shaping**: Mathematical flame profile
4. **Color Mapping**: Temperature to RGB conversion

### Fragment Shader (Anime)

Key algorithms:
1. **Hash Noise**: Simple 2D noise function
2. **Step Functions**: Creates discrete color bands
3. **Outline Detection**: Edge enhancement
4. **Stylized Motion**: Sine wave displacement

## Performance Considerations

### Optimization Strategies

1. **Shader Optimization**
   - Minimize texture lookups
   - Use built-in functions where possible
   - Precalculate constants

2. **Particle System**
   - Object pooling for particle reuse
   - Efficient array operations
   - Canvas-based rendering for 2D particles

3. **Render Loop**
   - Delta time for frame-rate independence
   - Conditional rendering (only when visible)
   - Request animation frame for 60 FPS

### Performance Metrics

Target performance:
- 60 FPS at 1920x1080 with 2000 particles
- 30 FPS minimum on integrated graphics

## Extension Points

### Adding New Shaders

1. Add shader source in `ShaderManager.getXXXFragmentShader()`
2. Register in `initializeShaders()`
3. Add UI control for selection
4. Update shader switching logic

### Adding Export Formats

1. Extend `FireRecorder` class
2. Implement format-specific encoding
3. Add UI button
4. Handle download

### Custom Parameters

1. Add to `params` object in `FireSimulation`
2. Create UI control in HTML
3. Setup event handler in `setupControls()`
4. Pass to shader as uniform

## API Reference

### ShaderManager

```javascript
constructor(gl: WebGLRenderingContext)
compileShader(source: string, type: GLenum): WebGLShader
createProgram(vertexSource: string, fragmentSource: string): WebGLProgram
initializeShaders(): void
useShader(shaderName: string): WebGLProgram
setUniforms(program: WebGLProgram, uniforms: Object): void
```

### ParticleSystem

```javascript
constructor(canvas: HTMLCanvasElement)
createParticle(): Particle
update(deltaTime: number): void
render(): void
setMaxParticles(count: number): void
setParticleSize(size: number): void
clear(): void
```

### FireRecorder

```javascript
constructor(canvas: HTMLCanvasElement)
startRecording(): void
captureFrame(): void
stopRecording(): void
exportPNG(): void
downloadDataURL(dataURL: string, filename: string): void
```

### FireSimulation

```javascript
constructor()
setupCanvas(): void
setupWebGL(): void
setupControls(): void
render(): void
animate(): void
setShaderStyle(style: string): void
resetToDefaults(): void
applyDragMomentum(velocityX: number, velocityY: number): void  // Physics-based momentum
```

## Shader Uniforms

All shaders accept these uniforms:

```glsl
uniform float u_time;         // Animation time
uniform float u_intensity;    // Fire brightness (0-1)
uniform float u_height;       // Flame height (0-1)
uniform float u_turbulence;   // Chaos level (0-1)
uniform float u_temperature;  // Color temperature (0-1)
uniform float u_saturation;   // Color saturation (0-1)

// Physics-based drag simulation (v3.2.0+)
uniform float u_dragVelocityX; // Horizontal drag velocity
uniform float u_dragVelocityY; // Vertical drag velocity
```

## Physics-Based Drag Simulation

### Implementation Overview

The drag simulation adds realistic physical deformation to the flame based on mouse movement:

**1. Velocity Tracking (main.js)**
```javascript
// Calculate velocity during drag
const dt = (currentTime - lastDragTime) / 1000;
dragVelocityX = (pos.x - lastDragX) / dt;
dragVelocityY = (pos.y - lastDragY) / dt;

// Update shader parameters in real-time
this.params.dragVelocityX = dragVelocityX;
this.params.dragVelocityY = dragVelocityY;
```

**2. Shader Deformation (shaders.js)**
```glsl
// Physics-based deformation
float dragInfluence = normalizedHeight * normalizedHeight; // Quadratic scaling
float dragDeformX = u_dragVelocityX * dragInfluence * 0.15; // Horizontal tilt
float dragDeformY = u_dragVelocityY * dragInfluence * 0.1;  // Vertical stretch

// Dynamic turbulence from movement
float dragMagnitude = length(vec2(u_dragVelocityX, u_dragVelocityY));
float dragTurbulence = dragMagnitude * normalizedHeight * 0.2;
```

**3. Physical Properties**
- **Height-dependent response**: Top of flame (less mass) deforms more than base
- **Realistic wind effect**: Horizontal drag creates natural tilting
- **Compression/stretching**: Vertical drag affects flame height
- **Turbulent chaos**: Fast movement generates additional noise
- **Clean reset**: Velocities return to zero after drag release

## Browser API Usage

- **WebGL**: Hardware-accelerated rendering
- **Canvas 2D**: Particle rendering and compositing
- **RequestAnimationFrame**: Smooth animation
- **Blob API**: File export
- **Download Links**: File saving

## Future Enhancements

Potential improvements:
1. WebGL2 for advanced features
2. Compute shaders for particle physics
3. Multiple fire sources
4. Interactive flame manipulation
5. Video export via MediaRecorder API
6. Preset saving/loading
7. Custom color palettes
8. Smoke simulation
9. Wind direction control
10. Reflection/lighting effects
