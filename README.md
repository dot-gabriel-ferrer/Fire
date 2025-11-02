# Fire Simulation Tool

A professional-grade fire simulation tool for audiovisual production, featuring realistic fluid dynamics-based fire effects powered by scientific research and industry-standard VFX techniques. Built with advanced WebGL shaders, physically-based particle systems, and optimized for real-time performance.

## Demo

### Realistic Fire Shader with Advanced Physics
![Realistic Fire Demo](demos/fire-realistic-demo.gif)

Realistic shader featuring **Navier-Stokes fluid dynamics**, curl noise for divergence-free flow, fractal Brownian motion, blackbody radiation color mapping, and physically-based combustion simulation.

### Anime Style Fire Shader
![Anime Fire Demo](demos/fire-anime-demo.gif)

Japanese anime-style shader with distinct color layers, sharp edges, and stylized movement patterns.

## Key Features

### 🔥 Advanced Fluid Dynamics Simulation
- **Curl Noise Implementation**: Divergence-free fluid flow for realistic motion
- **Velocity Field Simulation**: Semi-Lagrangian advection with buoyancy
- **Multi-Scale Turbulence**: 8-octave fractal Brownian motion for natural detail
- **Temperature-Based Physics**: Accurate heat transfer and combustion modeling
- **Fuel Consumption Simulation**: Realistic flame height and intensity falloff

### 🎨 Physically Accurate Rendering
- **Blackbody Radiation Colors**: 7-zone temperature mapping from embers to blue-white heat
- **Advanced Glow Effects**: Separate core and outer glow for atmospheric depth
- **Edge Softening**: Natural alpha blending for realistic flame boundaries
- **Multi-Layer Particle System**: Embers, sparks, and smoke particles

### ⚡ Professional Workflow Tools
- **8 Production-Ready Presets**: Campfire, Torch, Bonfire, Candle, Explosion, Furnace, Magical, Embers
- **Keyboard Shortcuts**: Fast workflow with R (reset), S (shader toggle), P (export), Space (pause), 1-4 (presets)
- **Real-Time Performance Monitoring**: Live FPS display
- **Instant Parameter Preview**: All changes update in real-time

### 🎛️ Comprehensive Parameter Control

**Fire Dynamics:**
- Intensity, Height, Turbulence, Animation Speed
- Temperature, Saturation

**Advanced Physics (Industry-Standard):**
- **Buoyancy**: Controls upward force on hot gases
- **Vorticity (Curl)**: Swirling fluid motion strength
- **Dissipation**: Heat and density fade rate
- **Fuel Consumption**: Flame sustainability and falloff

**Environmental Effects:**
- **Wind Strength**: External force magnitude
- **Wind Direction**: 360° wind direction control

**Particle System:**
- Particle Count (0-5000), Particle Size (1-10)
- Automatic ember and spark generation

### 📤 Export Capabilities
- PNG snapshot export (current resolution)
- GIF recording support (frame capture with export capability)
- Composite rendering (shader + particles)

## Technical Implementation

### Shader Architecture

#### Realistic Fire Shader
The realistic shader implements cutting-edge fluid dynamics:

- **Curl Noise**: Generates divergence-free velocity fields for physically accurate fluid flow
- **Velocity Field Advection**: Semi-Lagrangian method for stable fluid motion
- **Multi-Scale FBM**: 3 octaves of turbulence at different frequencies for sub-grid detail
- **Blackbody Radiation**: Physically accurate color temperature mapping (800K-6000K range)
- **Combustion Modeling**: Temperature, fuel density, and dissipation fields

**Based on Scientific Research:**
- Jos Stam - "Real-Time Fluid Dynamics for Games" (1999)
- Fedkiw, Stam & Jensen - "Visual Simulation of Smoke" (2001)
- Industry VFX techniques from Houdini, EmberGen, and Phoenix FD

#### Anime Fire Shader
Stylized rendering optimized for Japanese animation aesthetic:
- Discrete color bands with sharp transitions
- Sinusoidal wave displacement for characteristic motion
- Edge detection and outline effects
- Simplified noise for artistic control

### Enhanced Particle System

The particle system uses advanced techniques for realism:
- **Three Particle Types**:
  - **Normal Particles**: Balanced smoke/heat visualization
  - **Embers**: Large, slow-moving, cooling over time with color shift
  - **Sparks**: Small, fast, bright with motion trail rendering
- **Physics-Based Motion**: Gravity, turbulence, air resistance
- **Temperature Simulation**: Embers cool from orange to deep red
- **Type-Specific Rendering**: Radial gradients, linear trails, and glow effects

### Performance Optimization

- Hardware-accelerated WebGL rendering
- Efficient shader compilation with error handling
- Delta time-based animation for frame-rate independence
- Canvas layer separation (WebGL + 2D particles)
- Object pooling for particle management
- Real-time FPS monitoring

**Target Performance:**
- 60 FPS at 1920x1080 with 3500 particles
- 30 FPS minimum on integrated graphics
- Automatic performance scaling

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
Stylized effect with enhanced saturation and vorticity. Perfect for fantasy scenes.

### 💨 Dying Embers
Low-intensity, cooling embers. Dark red tones for end-of-fire scenarios.

## Advanced Parameter Guide

### Fire Parameters
- **Intensity (0-100)**: Overall brightness and opacity
- **Height (0-100)**: Vertical flame extent
- **Turbulence (0-100)**: Chaos and movement intensity
- **Animation Speed (0-200)**: Playback speed multiplier

### Color Settings
- **Temperature (0-100)**: Color palette shift (cool red → hot white)
- **Saturation (0-100)**: Color intensity vs grayscale

### Advanced Physics
- **Buoyancy (0-100)**: Upward force strength (hot air rises)
- **Vorticity (0-100)**: Swirling motion and curl strength
- **Dissipation (0-100)**: How quickly fire fades at edges
- **Fuel Consumption (0-100)**: Flame sustainability and height falloff

### Environmental Effects
- **Wind Strength (0-100)**: External wind force
- **Wind Direction (0-100)**: Wind angle (maps to 0-360°)

### Particle System
- **Particle Count (0-5000)**: Number of active particles
- **Particle Size (1-10)**: Individual particle size multiplier

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
- Reduce particle count to 1000-1500
- Lower turbulence and vorticity settings
- Decrease particle size
- Close other browser tabs
- Update graphics drivers

**Export not working:**
- Check browser permissions for file downloads
- Ensure sufficient disk space
- Verify canvas is rendering before export

## Version

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
- **Scientific Research**: Jos Stam's fluid dynamics papers, physically-based fire modeling research
- **Industry Techniques**: Houdini Pyro FX, EmberGen, Phoenix FD parameter systems
- **VFX Best Practices**: Professional color grading, particle simulation, and real-time optimization