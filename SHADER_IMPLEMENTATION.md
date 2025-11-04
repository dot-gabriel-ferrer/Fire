# Shader Implementation Guide

## Overview

This document provides technical details about the four shader implementations in the Fire Simulation Tool, designed for professional anime and film production.

## Shader Comparison Matrix

| Feature | Realistic | Ghibli 80s | Modern Cartoon | Anime (Original) |
|---------|-----------|------------|----------------|------------------|
| **Physics Simulation** | Full Navier-Stokes | Full Navier-Stokes | Simplified | Medium |
| **FBM Octaves** | 4 | 3 | 1 | 2 |
| **Color Bands** | Smooth gradient | 5 (soft transitions) | 3 (hard edges) | 4-5 (hard edges) |
| **Outline Style** | None | Soft edge darkening | Strong black | Medium |
| **Posterization** | None | Subtle (40% blend) | Full (3 levels) | Sharp (step) |
| **Performance** | Medium | Medium-Low | High | Medium-High |
| **Best For** | VFX, realism | Studio Ghibli style | TV animation, games | Traditional anime |

## Technical Implementation Details

### 1. Realistic Shader

**Purpose:** Photorealistic fire simulation for VFX and scientific visualization.

**Physics Constants:**
```glsl
const float DRAG_HORIZONTAL_SCALE = 0.8;
const float DRAG_VERTICAL_SCALE = 0.5;
const float DRAG_TURBULENCE_SCALE = 1.2;
const float VELOCITY_ADVECTION_STRENGTH = 0.6;
const float VORTICITY_STRENGTH = 0.4;
const float PRESSURE_GRADIENT_SCALE = 0.3;
```

**Color Mapping (Blackbody Radiation):**
- Zone 1 (0-20%): Dark red embers (0.2, 0.0, 0.0)
- Zone 2 (20-40%): Red to orange-red (0.6, 0.1, 0.0) → (1.0, 0.25, 0.0)
- Zone 3 (40-60%): Orange (1.0, 0.25, 0.0) → (1.0, 0.5, 0.0)
- Zone 4 (60-80%): Orange to yellow (1.0, 0.5, 0.0) → (1.0, 0.85, 0.2)
- Zone 5 (80-100%): Yellow to white (1.0, 0.85, 0.2) → (1.0, 1.0, 0.9)

**Fluid Dynamics:**
- Velocity field computation with orthogonal noise components
- Vorticity for rotational flow (swirls)
- Pressure-driven expansion at flame base
- Multi-scale turbulence (2 noise frequencies)
- Drag-induced deformation with quadratic mass distribution

**Performance:** ~5-15 FPS (software WebGL fallback)

### 2. Studio Ghibli 80s Shader

**Purpose:** Hand-painted aesthetic for professional anime production, inspired by Studio Ghibli films.

**Research Foundation:**
Based on analysis of Studio Ghibli fire animation techniques:
- Traditional hand-painted cels
- Flat color regions with distinct separation
- Soft layered ramps (not hard edges)
- Warm, inviting color palette
- Subtle brush strokes and animated textures
- Characteristic soft glow

**Physics:** Identical to Realistic Shader
- Same constants, same fluid dynamics simulation
- Full Navier-Stokes implementation
- Complete drag physics support

**NPR Techniques:**

1. **Layered Ramp Shading:**
```glsl
// Soft transitions between zones using smoothstep
if (temp < 0.15) {
    color = vec3(0.35, 0.05, 0.15);  // Deep ember
} else if (temp < 0.3) {
    float t = smoothstep(0.0, 1.0, (temp - 0.15) / 0.15);
    color = mix(vec3(0.65, 0.08, 0.10), vec3(0.95, 0.20, 0.05), t);
}
// ... more zones
```

2. **Cel-Shaded Posterization:**
```glsl
float posterized = floor(flame * 5.0) / 5.0;  // 5 discrete levels
float bandedFlame = mix(flame, posterized, 0.4);  // 40% blend for soft look
```

3. **Hand-Painted Texture:**
```glsl
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for(int i = 0; i < 3; i++) {  // 3 octaves for painterly feel
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
```

4. **Soft Outline:**
```glsl
float outlineEdge = smoothstep(0.05, 0.08, flame) - smoothstep(0.08, 0.12, flame);
color = mix(color, color * 0.7, outlineEdge * 0.3);  // Subtle darkening
```

5. **Warm Glow:**
```glsl
float glow = pow(bandedFlame, 0.35) * 0.7;
color += vec3(glow * 0.5, glow * 0.4, glow * 0.2);  // RGB weighted warm glow
```

**Color Palette:**
- Zone 1 (0-15%): Deep ember red with purple tint (0.35, 0.05, 0.15)
- Zone 2 (15-30%): Dark to bright red (0.65, 0.08, 0.10) → (0.95, 0.20, 0.05)
- Zone 3 (30-50%): Bright red to orange (0.95, 0.20, 0.05) → (1.0, 0.40, 0.05)
- Zone 4 (50-70%): Orange to golden yellow (1.0, 0.40, 0.05) → (1.0, 0.75, 0.15)
- Zone 5 (70-100%): Golden yellow to warm white (1.0, 0.75, 0.15) → (1.0, 0.95, 0.75)

**Saturation Boost:** 1.05x multiplier for Ghibli's rich color style

**Performance:** ~7-12 FPS (similar to realistic due to same physics)

### 3. Modern Cartoon Shader

**Purpose:** Bold, flat-shaded style for contemporary TV animation and games.

**Design Philosophy:**
- Maximum simplicity and clarity
- Exactly 3 flat color bands
- Strong black outlines
- No gradients or soft transitions
- Optimized for real-time performance

**Simplified Physics:**
```glsl
const float DRAG_HORIZONTAL_SCALE = 0.5;  // Reduced from 0.8
const float DRAG_VERTICAL_SCALE = 0.3;    // Reduced from 0.5
// No vorticity computation
// No pressure gradients
// Simple wobble only
```

**Flat Color Bands:**
```glsl
// Posterize to exactly 3 levels
float posterized = floor(flame * 3.0) / 3.0;

// Hard-coded flat colors (no blending)
if (value < 0.3) {
    color = vec3(0.8, 0.15, 0.0);  // Dark base
} else if (value < 0.7) {
    color = vec3(1.0, 0.55, 0.0);  // Mid tone
} else {
    color = vec3(1.0, 0.95, 0.3);  // Highlight
}
```

**Strong Outline:**
```glsl
float outline = smoothstep(0.08, 0.12, flame) - smoothstep(0.12, 0.16, flame);
fireColor = mix(fireColor, vec3(0.0), outline * 0.8);  // 80% black
```

**Sharp Alpha:**
```glsl
float alpha = step(0.1, flame) * (0.8 + u_intensity * 0.2);  // Step function
```

**Saturation Boost:** 1.15x multiplier for vibrant cartoon look

**Performance:** ~15-25 FPS (fastest shader)

### 4. Anime (Original) Shader

**Purpose:** Traditional Japanese anime style with enhanced color separation.

**Physics:** Medium complexity
- 2-octave FBM for stylized turbulence
- Enhanced wobble effects
- Strong vorticity
- Simplified velocity fields

**Color Bands:**
```glsl
// 4-5 discrete sharp bands using step()
if (value < 0.2) {
    color = vec3(0.5, 0.0, 0.15);
} else if (value < 0.4) {
    color = vec3(1.0, 0.15, 0.0);
} else if (value < 0.6) {
    color = vec3(1.0, 0.45, 0.0);
} else if (value < 0.8) {
    color = vec3(1.0, 0.8, 0.1);
} else {
    color = vec3(1.0, 1.0, 0.5);
}
```

**Outline:**
```glsl
float outline = smoothstep(0.06, 0.10, flame) - smoothstep(0.10, 0.14, flame);
fireColor = mix(fireColor, vec3(0.0), outline * 0.6);  // 60% black
```

**Performance:** ~10-20 FPS

## Shader Selection Recommendations

### Use Realistic When:
- Creating VFX for live-action compositing
- Scientific visualization required
- Photorealism is priority
- Film-quality output needed

### Use Ghibli 80s When:
- Producing Studio Ghibli style animation
- Creating nostalgic 1980s anime aesthetic
- Hand-painted look desired
- Theatrical animation quality needed
- Professional anime production

### Use Modern Cartoon When:
- Creating contemporary TV animation
- Game development (performance critical)
- Motion graphics
- Bold, simplified style needed
- Target audience is children

### Use Anime (Original) When:
- Traditional Japanese anime style
- Enhanced color separation desired
- Stylized fire effects
- Classic anime aesthetic

## Performance Optimization Tips

1. **For Best Performance:**
   - Use Modern Cartoon shader
   - Reduce particle count to 50
   - Lower turbulence setting
   - Disable particles entirely

2. **For Best Quality:**
   - Use Realistic or Ghibli 80s shader
   - Increase turbulence for detail
   - Enable particles (80-150 count)
   - Use higher quality presets

3. **Hardware Considerations:**
   - Dedicated GPU recommended for Realistic/Ghibli shaders
   - Integrated graphics: Use Cartoon or Anime shaders
   - Software WebGL: Cartoon shader only

## Parameter Consistency

All shaders respond to the same parameter set:
- **Intensity**: Brightness and opacity
- **Height**: Vertical flame extent
- **Turbulence**: Chaos and flickering
- **Temperature**: Color palette shift
- **Saturation**: Color intensity
- **Wind**: External force
- **Buoyancy**: Upward lift
- **Vorticity**: Rotational chaos
- **Diffusion**: Flame spread
- **Drag Physics**: Interactive deformation

This consistency allows seamless shader switching during production without re-adjusting parameters.

## Future Enhancements

Potential improvements for future versions:
1. Custom color palette editor for each shader
2. Additional NPR styles (watercolor, oil painting)
3. Preset libraries for each shader style
4. Export shader parameters as JSON
5. Frame-by-frame animation control
6. Multiple flame sources
7. Advanced compositing options

## References

- Studio Ghibli Animation Techniques Research
- NPR (Non-Photorealistic Rendering) Literature
- Cel Shading: Color Ramp and Posterization Methods
- Real-time Fluid Dynamics for Games and VFX
- Blackbody Radiation Physics
- Japanese Animation Production Pipeline
