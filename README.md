# Fire Simulation Tool

A professional-grade fire simulation tool for audiovisual production, featuring realistic deforming flame shapes powered by advanced WebGL shaders and optimized particle systems. Built for real-time performance with an intuitive, simplified interface.

## Demo

### Realistic Fire Shader with Shape-Based Deformation
![Realistic Fire Demo](demos/fire-realistic-demo.gif)

Realistic shader featuring **deforming flame shapes**, fractal Brownian motion for turbulence, blackbody radiation color mapping, and physically-based rendering with wind response.

### Anime Style Fire Shader
![Anime Fire Demo](demos/fire-anime-demo.gif)

Japanese anime-style shader with distinct color layers, sharp edges, and stylized movement patterns.

## Key Features

### 🔥 Realistic Flame Shape Rendering
- **Interactive Flame Positioning**: Click anywhere on the canvas to reposition the flame source
- **Physics-Based Drag Simulation**: Drag the fire with your mouse for realistic physical deformation
  - Flame tilts and stretches based on drag velocity
  - Dynamic turbulence from rapid movement
  - Height-dependent deformation (more flex at top, stability at base)
  - Smooth momentum physics after release
- **Adjustable Source Size**: Control the width of the flame base for different fire types
- **Deforming Flame Bodies**: Primary visual is a shape-based flame that deforms naturally with correct teardrop geometry
- **Noise-Based Turbulence**: Fractal Brownian motion creates realistic flickering
- **Wind-Responsive**: Flame tilts and bends based on wind direction and strength
- **Temperature Gradient**: Natural color progression from red/orange base to yellow/white tips
- **Particles as Accents**: Embers and sparks enhance the main flame, not replace it

### 🎨 Physically-Based Rendering
- **Blackbody Radiation Colors**: 5-zone temperature mapping (dark red → orange → yellow → white)
- **Dynamic Glow Effects**: Core and outer glow for atmospheric depth
- **Edge Softening**: Natural alpha blending for realistic flame boundaries
- **Multi-Type Particles**: Embers, sparks, and normal particles with distinct behaviors

### ⚡ Professional Workflow Tools
- **8 Production-Ready Presets**: Campfire, Torch, Bonfire, Candle, Explosion, Furnace, Magical, Embers
- **Keyboard Shortcuts**: Fast workflow with R (reset), S (shader toggle), P (export), Space (pause), 1-4 (presets)
- **Real-Time Performance Monitoring**: Live FPS display
- **Instant Parameter Preview**: All changes update in real-time

### 🎛️ Simplified Parameter Control

**Interactive Flame Source:**
- **Click on Canvas**: Click anywhere on the canvas to reposition the flame source
- **Source Size** (10-100): Width of the flame source base

**Fire Dynamics:**
- **Intensity** (0-100): Overall brightness and opacity
- **Height** (0-100): Vertical flame extent
- **Turbulence** (0-100): Chaos and flickering intensity
- **Speed** (0-200): Animation playback speed

**Color Settings:**
- **Temperature** (0-100): Color palette shift (cool red → hot white)
- **Saturation** (0-100): Color intensity vs grayscale

**Environmental Effects:**
- **Wind Strength** (0-100): External wind force that tilts the flame
- **Wind Direction** (0-100): Wind angle (maps to 0-360°)

**Particle System (Accent Effects):**
- **Particle Count** (0-300): Number of active particles (reduced default: 80)
- **Particle Size** (1-10): Individual particle size multiplier
- **Particle Lifetime** (0.2-3.0s): Average lifetime with type-specific variation
  - Sparks: ~0.2-0.5s (fast, bright)
  - Embers: ~1.0-2.0s (slow-fading)
  - Normal particles: Based on lifetime setting

### 📤 Export Capabilities
- PNG snapshot export (current resolution)
- **Animated GIF recording** (3 seconds at 20 FPS, integrated gif.js encoder)
- Composite rendering (shader + particles)

## Technical Implementation

### Shader Architecture

#### Realistic Fire Shader
The realistic shader creates **shape-based deforming flames**:

- **Teardrop Flame Shape**: Natural flame silhouette that widens at base and tapers at tip
- **Noise-Based Deformation**: Fractal Brownian Motion (4 octaves) for realistic turbulence
- **Wind Integration**: Direct wind effect on flame position and tilt
- **Blackbody Color Mapping**: Physically-based temperature-to-color conversion
- **Optimized Performance**: Simplified from complex fluid simulation to efficient shape deformation

**Design Philosophy:**
- Focus on visible, clear flame body rather than pure particle simulation
- Parameters directly affect appearance (no hidden complex physics)
- Performance-optimized for real-time interaction (13-60 FPS)

#### Anime Fire Shader
Stylized rendering optimized for Japanese animation aesthetic:
- Discrete color bands with sharp transitions
- Sinusoidal wave displacement for characteristic motion
- Edge detection and outline effects
- Simplified noise for artistic control

### Enhanced Particle System

The particle system provides **accent effects** to enhance the main flame:
- **Three Particle Types**:
  - **Normal Particles**: Balanced smoke/heat visualization
  - **Embers**: Large, slow-moving, cooling over time with color shift
  - **Sparks**: Small, fast, bright with motion trail rendering
- **Physics-Based Motion**: Gravity, turbulence, air resistance
- **Wind Response**: Particles affected by wind strength and direction
- **Temperature Simulation**: Embers cool from orange to deep red
- **Type-Specific Rendering**: Radial gradients, linear trails, and glow effects
- **Reduced Count**: Default 80 particles (down from 200) for better performance

### Performance Optimization

- Hardware-accelerated WebGL rendering
- Efficient shader compilation with error handling
- Delta time-based animation for frame-rate independence
- Canvas layer separation (WebGL + 2D particles)
- Simplified shader calculations for better performance
- Real-time FPS monitoring

**Target Performance:**
- 13-60 FPS at 1920x1080 (depends on hardware)
- Works on integrated graphics with software WebGL fallback
- Optimized particle limit (300 max) for consistent performance

## Quick Start

### Installation
1. Clone or download the repository
2. Open `index.html` in a modern web browser with WebGL support
3. The application initializes automatically

### Basic Usage

1. **Choose a Preset**: Click any preset button for instant professional fire
2. **Customize Parameters**: Adjust sliders for fine-tuning
3. **Export**: Click "Export PNG" for current frame or "Record GIF" for animation

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **R** | Reset to default parameters |
| **S** | Toggle between Realistic/Anime shaders |
| **P** | Export current frame as PNG |
| **Space** | Pause/Resume animation |
| **1** | Apply Campfire preset |
| **2** | Apply Torch preset |
| **3** | Apply Bonfire preset |
| **4** | Apply Candle preset |

## Professional Presets

### 🔥 Campfire
Warm, gentle fire for outdoor scenes. Medium turbulence, natural orange tones.

### 🕯️ Torch
Bright, dancing flame with high movement. Perfect for medieval or dungeon scenes.

### 🏕️ Bonfire  
Large, intense fire with strong upward flow. High particle count for impressive visuals.

### 🕯️ Candle
Small, stable flame with minimal turbulence. Subtle and controlled for intimate scenes.

### 💥 Explosion
Violent, explosive fire with maximum turbulence and particle emission. High-energy effect.

### 🔥 Furnace
Hot, industrial fire with intense temperature. Blue-white core for metal-working scenes.

### ✨ Magical Fire
Stylized effect with enhanced saturation and turbulence. Perfect for fantasy scenes.

### 💨 Dying Embers
Low-intensity, cooling embers. Dark red tones for end-of-fire scenarios.

## Parameter Guide

### Interactive Controls
- **Click on Canvas**: Click anywhere on the canvas to reposition the flame source. The flame will originate from where you click.
- **Drag on Canvas**: Click and drag the fire to move it with realistic physics. The flame will deform based on drag speed and direction:
  - **Horizontal drag**: Creates tilting/stretching effect (like wind pushing the flame)
  - **Vertical drag**: Compresses or stretches the flame height
  - **Fast movement**: Generates additional turbulence for realistic chaos
  - **Physical simulation**: Deformation is stronger at the top of the flame (where there's less mass to resist)
  - **Momentum**: After releasing the drag, the flame continues to move with physics-based momentum that gradually decays

### Fire Parameters
- **Intensity (0-100)**: Overall brightness and opacity of the flame
- **Height (0-100)**: Vertical extent of the flame
- **Source Size (10-100)**: Width of the flame source base - controls how wide the flame starts
- **Turbulence (0-100)**: Flickering and deformation intensity
- **Animation Speed (0-200)**: Playback speed multiplier

### Color Settings
- **Temperature (0-100)**: Color palette shift (cool red → hot yellow/white)
- **Saturation (0-100)**: Color intensity vs grayscale

### Environmental Effects
- **Wind Strength (0-100)**: External wind force that tilts flame and pushes particles
- **Wind Direction (0-100)**: Wind angle (0-360°)

### Particle System
- **Particle Count (0-300)**: Number of active accent particles (default: 80)
- **Particle Size (1-10)**: Individual particle size multiplier
- **Particle Lifetime (0.2-3.0s)**: Average lifetime of particles
  - Sparks: ~0.2-0.5s (fast, bright)
  - Embers: ~1.0-2.0s (slow-fading)
  - Normal particles: Based on lifetime setting

## Browser Compatibility

Requires WebGL 1.0 support:
- Chrome 56+ (Recommended)
- Firefox 52+
- Safari 11+
- Edge 79+

**Recommended Setup:**
- Dedicated GPU
- 4GB+ RAM
- Chrome or Firefox for best performance

## Production Use

This tool is designed for professional audiovisual production:

- **Real-Time Preview**: Interactive adjustment with instant feedback
- **High-Quality Output**: Export at canvas resolution for production use
- **Reproducible Results**: Save preset parameters for consistent output
- **Fast Iteration**: Keyboard shortcuts and presets for efficient workflow
- **Professional Parameters**: Industry-standard controls (buoyancy, vorticity, etc.)

## Technical Requirements

**Minimum:**
- WebGL 1.0 compatible GPU
- 2GB RAM
- Modern browser with ES6 support

**Recommended:**
- Dedicated GPU (NVIDIA/AMD)
- 4GB+ RAM
- Chrome 90+ or Firefox 88+
- 1920x1080 or higher display

## Troubleshooting

**Fire not rendering:**
- Verify WebGL support: Visit https://get.webgl.org/
- Check browser console for shader compilation errors
- Ensure hardware acceleration is enabled in browser settings

**Poor performance (low FPS):**
- Reduce particle count to 50-100
- Lower turbulence setting
- Decrease particle size
- Close other browser tabs
- Update graphics drivers

**Export not working:**
- Check browser permissions for file downloads
- Ensure sufficient disk space
- Verify canvas is rendering before export

## Version

**3.2.0** - Physics-Based Drag Simulation
- Added realistic physical deformation when dragging the fire
- Drag velocity affects flame shape in real-time (tilting, stretching, compression)
- Horizontal drag creates wind-like effects
- Vertical drag compresses/stretches flame height
- Dynamic turbulence generation from rapid movement
- Quadratic height scaling (more deformation at flame tip, stability at base)
- Proper velocity reset and cleanup after drag release
- Both realistic and anime shaders support drag physics

**3.1.0** - Flame Geometry Fix and Interactive Positioning
- Fixed inverted flame geometry (flame now correctly rises upward with proper teardrop shape)
- Added interactive flame source positioning (click on canvas to reposition)
- Added flame source size control parameter
- Improved coordinate system for more realistic flame behavior
- Particles temporarily disabled to focus on flame shader quality

**3.0.0** - Major Rebuild: Shape-Based Realistic Flames
- Rebuilt shader system with deforming flame shapes
- Simplified parameter system (removed complex physics controls)
- Particles now accent effects, not primary simulation
- Wind affects both flame and particles
- Improved performance and visual clarity
- Reduced default particle count (80 vs 200)

**2.0.0** - Major Update: Professional-Grade Enhancement
- Advanced fluid dynamics simulation
- 8 professional presets
- Keyboard shortcuts
- Performance monitoring
- Enhanced particle system

**1.0.0** - Initial Release
- Basic fire simulation
- Dual shader system
- Basic particle system

## License

This project is available for use in commercial and non-commercial audiovisual productions.

## Acknowledgments

This implementation is based on:
- **Realistic Fire Research**: Noise-based procedural flame generation techniques
- **Blackbody Radiation**: Physically-based temperature-to-color mapping
- **VFX Best Practices**: Real-time shader optimization and particle system design