# Fire Simulation Tool - Usage Examples

## Quick Start

1. Open `index.html` in a WebGL-compatible browser
2. The fire simulation starts automatically with realistic fire shader
3. Use the controls panel on the right to adjust parameters in real-time
4. Export your creation as PNG or record as GIF animation

## Practical Usage Scenarios

### Small Campfire

Perfect for cozy, intimate scenes:

1. Select "Realistic" shader style
2. Set **Intensity**: 60
3. Set **Height**: 40
4. Set **Turbulence**: 30
5. Set **Temperature**: 35 (warmer orange tones)
6. Set **Particle Count**: 300
7. Set **Particle Size**: 4

**Result**: A calm, contained fire with gentle flickering.

### Large Bonfire

For dramatic outdoor scenes:

1. Select "Realistic" shader style
2. Set **Intensity**: 85
3. Set **Height**: 75
4. Set **Turbulence**: 65
5. Set **Temperature**: 55 (bright yellow-orange)
6. Set **Particle Count**: 800
7. Set **Particle Size**: 5

**Result**: A tall, energetic fire with lots of movement and embers.

### Magical/Fantasy Fire

Stylized fire for games or animation:

1. Select "Anime Style" shader
2. Set **Intensity**: 90
3. Set **Height**: 70
4. Set **Turbulence**: 40
5. Set **Temperature**: 60
6. Set **Saturation**: 95
7. Set **Particle Count**: 500
8. Set **Particle Size**: 3

**Result**: Vibrant, stylized fire with distinct color bands.

### Dying Embers

Low-intensity fire for end scenes:

1. Select "Realistic" shader style
2. Set **Intensity**: 35
3. Set **Height**: 25
4. Set **Turbulence**: 20
5. Set **Temperature**: 25 (deep red)
6. Set **Particle Count**: 150
7. Set **Particle Size**: 3

**Result**: Subtle, glowing embers with minimal flame.

### Industrial Furnace

Hot, intense fire:

1. Select "Realistic" shader style
2. Set **Intensity**: 95
3. Set **Height**: 80
4. Set **Turbulence**: 55
5. Set **Temperature**: 75 (white-hot)
6. Set **Particle Count**: 600
7. Set **Particle Size**: 4

**Result**: Extremely hot, bright fire with high-temperature colors.

### Smoke Effect

For smoke without flames:

1. Select "Realistic" shader style
2. Set **Intensity**: 20 (very low for subtle background)
3. Set **Height**: 50
4. Set **Turbulence**: 40
5. Select **Smoke** particle type
6. Set **Particle Count**: 600
7. Set **Particle Size**: 6

**Result**: Realistic smoke effect with gray particles that rise and dissipate.

## Exporting Your Fire

### PNG Export (Still Images)
1. Adjust all parameters to your desired look
2. Click "Export PNG" button
3. Image is saved at current canvas resolution
4. **Tip**: Maximize your browser window before exporting for higher resolution

### GIF Recording (Animations)
1. Set up your fire parameters
2. Click "Record GIF" to start capture
3. Recording automatically stops after 5 seconds
4. Frames are captured for animation export
5. **Tip**: Reduce particle count slightly for smoother GIF playback

## Parameter Guide

### Fire Parameters

**Intensity (0-100)**
- Controls brightness and opacity of fire
- Lower values: Subtle, smoky fire
- Higher values: Bright, intense flames

**Height (0-100)**
- Controls vertical extent of flames
- Lower values: Short, wide fire
- Higher values: Tall, narrow flames

**Turbulence (0-100)**
- Controls chaos in flame movement
- Lower values: Smooth, flowing fire
- Higher values: Chaotic, energetic flames

**Animation Speed (0-200)**
- Controls playback speed
- 100 = Normal speed
- Lower values: Slow motion effect
- Higher values: Fast, energetic fire

### Color Settings

**Temperature (0-100)**
- Simulates fire temperature
- 0-30: Dark red, cool fire
- 30-60: Red-orange, normal fire
- 60-100: Yellow-white, hot fire

**Saturation (0-100)**
- Controls color intensity
- Lower values: Desaturated, smoky
- Higher values: Vivid, pure colors

### Particle System

**Particle Type**
- **Fire/Embers**: Bright, fast-rising particles simulating sparks and embers
- **Smoke**: Gray, slow-rising particles that linger and spread for smoke effects

**Particle Count (0-2000)**
- Number of ember/spark particles
- 0: No particles (shader only)
- 100-300: Subtle ember effect (recommended for campfires)
- 400-800: Moderate particle effects (recommended for bonfires)
- 900-2000: Dense particle effects (use sparingly, impacts performance)

**Particle Size (1-10)**
- Size of individual ember particles
- Lower values: Fine embers
- Higher values: Large, visible particles

## Production Tips

1. **Performance Optimization**
   - Reduce particle count on slower hardware
   - Lower animation speed reduces GPU load
   - Close other browser tabs for best performance

2. **Visual Quality**
   - Match shader style to your project aesthetic
   - Use realistic for photorealistic scenes
   - Use anime for stylized animation

3. **Export Quality**
   - Maximize browser window before export
   - Canvas resolution matches window size
   - Larger window = higher resolution export

4. **Color Grading**
   - Adjust temperature for time of day
   - Lower temperature for campfire scenes
   - Higher temperature for intense flames

## Keyboard Shortcuts

Currently, all controls are mouse-based. Future versions may include keyboard shortcuts for common operations.

## Browser Compatibility

Tested and working on:
- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

**Fire not visible:**
- Check that intensity is above 30
- Ensure height is above 20
- Try resetting to defaults

**Poor performance:**
- Reduce particle count to 1000 or less
- Lower animation speed to 50-70
- Close background applications

**Export fails:**
- Allow file downloads in browser
- Check available disk space
- Try PNG export first

## Advanced Techniques

### Layering Effects

Export multiple variations and composite in video editing software for complex fire effects.

### Animation Presets

For consistent results, note parameter values that work well for your use case.

### Color Matching

Use temperature and saturation to match fire to scene lighting and color palette.
