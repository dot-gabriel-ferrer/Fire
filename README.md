# Fire Simulation Tool

A professional-grade fire simulation tool for audiovisual production, featuring multiple artistic styles powered by advanced WebGL shaders and optimized particle systems. Built for real-time performance with an intuitive interface suitable for professional anime and film production.

**Live Demo:** [https://dot-gabriel-ferrer.github.io/Fire/](https://dot-gabriel-ferrer.github.io/Fire/)

## Shader Styles

This tool features four distinct rendering styles, each designed for different artistic needs:

### 1. Realistic Fire Shader
![Realistic Fire Demo](demos/fire-realistic-demo.gif)

Physics-based shader featuring **deforming flame shapes**, fractal Brownian motion for turbulence, blackbody radiation color mapping, and full fluid dynamics simulation.

**Best for:**
- Photorealistic VFX
- Scientific visualization
- Live-action compositing
- Natural fire effects

**Technical Features:**
- Navier-Stokes inspired fluid dynamics
- Blackbody radiation color palette (5 temperature zones)
- Advanced vorticity and buoyancy simulation
- Pressure-driven diffusion
- Full drag physics with momentum

### 2. Studio Ghibli Inspired (80s Anime Style)
Hand-painted aesthetic inspired by classic Studio Ghibli animation techniques. Combines the physics of realistic rendering with the artistic sensibility of traditional cel animation.

**Best for:**
- Professional anime production
- Studio Ghibli style projects
- Theatrical animation
- Nostalgic 1980s anime aesthetic

**Technical Features:**
- Layered ramp shading with soft transitions
- Cel-shaded posterization (5 discrete levels)
- Rich, warm color palette matching Ghibli films
- Hand-painted texture simulation via animated noise
- Soft outline rendering for drawn aesthetic
- Full physics simulation (identical to realistic shader)
- Warm glow effects characteristic of Ghibli fire

**Artistic Approach:**
Based on research into Studio Ghibli animation techniques, this shader implements:
- Flat color regions with distinct separation
- Soft, layered color ramps for painterly transitions
- Subtle edge darkening for hand-drawn feel
- Warm, inviting color scheme
- Maintains all physical accuracy while achieving artistic style

### 3. Modern Cartoon Style
Bold, vibrant flat-shaded style perfect for contemporary cartoon animation and motion graphics.

**Best for:**
- Modern TV animation
- Motion graphics
- Game development
- Simplified stylized effects

**Technical Features:**
- Flat shading with exactly 3 color bands
- Sharp, bold black outlines
- Posterized color levels for clean cartoon look
- High saturation for vibrant appearance
- Simplified physics for performance
- Hard edge alpha cutoffs

**Artistic Approach:**
- Maximum 3 distinct flat colors
- Strong black outlines (cel-shading)
- No gradients or soft transitions
- Optimized for clarity and readability
- Fast rendering for real-time animation

### 4. Anime (Original)
Japanese anime-style shader with distinct color layers, sharp edges, and stylized movement patterns.

**Best for:**
- Traditional Japanese anime style
- Enhanced color separation
- Stylized fire effects

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
- **Keyboard Shortcuts**: Fast workflow with R (reset), S (cycle shaders), P (export), Space (pause), 1-4 (presets)
- **Real-Time Performance Monitoring**: Live FPS display
- **Instant Parameter Preview**: All changes update in real-time
- **Multiple Shader Styles**: Switch between Realistic, Ghibli 80s, Modern Cartoon, and Anime styles

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

The tool features four distinct shader implementations, each optimized for different artistic styles while maintaining physics consistency:

#### 1. Realistic Fire Shader
Full physics-based rendering with advanced fluid dynamics:

- **Navier-Stokes Inspired Physics**: Complete fluid dynamics simulation
- **Teardrop Flame Shape**: Natural flame silhouette with proper mass distribution
- **Fractal Brownian Motion**: 4 octaves for multi-scale turbulence
- **Blackbody Radiation**: 5-zone temperature-to-color mapping
- **Advanced Deformation**: Velocity fields, vorticity, pressure gradients
- **Drag Physics**: Real-time momentum and deformation from user interaction

**Technical Constants:**
- Drag horizontal scale: 0.8 (strong tilting)
- Drag vertical scale: 0.5 (compression/stretching)
- Velocity advection: 0.6
- Vorticity strength: 0.4

#### 2. Studio Ghibli 80s Anime Shader
NPR (Non-Photorealistic Rendering) with full physics underneath:

- **Same Physics as Realistic**: Identical fluid dynamics simulation
- **Layered Ramp Shading**: Soft transitions between color zones
- **Cel-Shaded Posterization**: 5 discrete intensity levels
- **Hand-Painted Texture**: 3-octave FBM for traditional animation feel
- **Warm Color Palette**: Rich reds, oranges, yellows matching Ghibli films
- **Soft Outlines**: Subtle edge darkening for hand-drawn aesthetic
- **Enhanced Glow**: Warm atmospheric glow characteristic of Ghibli fire

**Color Zones:**
1. Deep ember red with purple tint (0-15%)
2. Dark to bright red transition (15-30%)
3. Bright red to orange (30-50%)
4. Orange to golden yellow (50-70%)
5. Golden yellow to warm white (70-100%)

**Design Philosophy:**
Based on Studio Ghibli animation research, combining:
- Traditional cel animation aesthetics
- Modern real-time fluid physics
- Painterly soft edges and warm glows
- Professional production quality

#### 3. Modern Cartoon Shader
Simplified flat-shaded style for contemporary animation:

- **Flat Shading**: Exactly 3 color bands (posterized)
- **Bold Outlines**: Strong black cel-shading edges
- **Simplified Physics**: Reduced complexity for performance
- **High Saturation**: Vibrant, eye-catching colors
- **Sharp Cutoffs**: Clean alpha edges for clarity
- **Minimal Noise**: Simple 2-level noise for basic wobble

**Color Bands:**
1. Dark base: Deep red/orange (0-30%)
2. Mid tone: Bright orange/yellow (30-70%)
3. Highlight: Brilliant yellow/white (70-100%)

**Performance:** Fastest shader due to simplified calculations

#### 4. Anime (Original) Shader
Enhanced anime style with distinct layering:

- **Discrete Color Bands**: 4-5 sharp color transitions
- **Wobble Animation**: Sinusoidal wave displacement
- **Enhanced Vorticity**: Strong swirling effects
- **Stylized Physics**: 2-octave FBM for artistic control
- **Sharp Edges**: Step functions for cel-shading
- **Vibrant Palette**: Saturated anime colors

**Design Philosophy:**
- Focus on visible, clear flame body
- Parameters directly affect appearance
- Performance-optimized for real-time interaction

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
| **S** | Cycle through all shader styles (Realistic → Anime → Ghibli 80s → Cartoon) |
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

**4.0.0** - Studio Ghibli and Modern Cartoon Shader Integration
- Added Studio Ghibli inspired 80s anime shader with full physics
  - Layered ramp shading with soft cel-shaded transitions
  - Hand-painted texture simulation via animated noise
  - Warm, rich color palette matching Ghibli films
  - Soft outline rendering for traditional animation aesthetic
  - Complete Navier-Stokes fluid dynamics (same as realistic)
- Added Modern Cartoon flat-shaded shader
  - Bold 3-color flat shading for contemporary animation
  - Strong black outlines for cel-shading
  - High saturation vibrant colors
  - Simplified physics for optimal performance
- Enhanced shader cycling with S key (4 styles total)
- Updated UI with 4 shader style buttons
- Comprehensive documentation of NPR techniques
- Added GitHub Pages live demo link
- All shaders support full parameter control and drag physics

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
- **Studio Ghibli Animation**: Research into traditional cel animation and hand-painted aesthetics
- **NPR Techniques**: Non-photorealistic rendering methods for anime and cartoon styles
- **Cel Shading Research**: Color ramp techniques, posterization, and outline rendering