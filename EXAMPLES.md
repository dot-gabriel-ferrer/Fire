# Fire Simulation Tool - Usage Examples

## Quick Start

1. Open `index.html` in a WebGL-compatible browser
2. The fire simulation starts automatically
3. Use the controls panel to adjust parameters in real-time

## Basic Usage Examples

### Creating Realistic Fire

1. Select "Realistic" shader style
2. Adjust intensity to 70-80 for bright flames
3. Set height to 60-80 for tall flames
4. Increase turbulence to 60-70 for chaotic movement
5. Adjust temperature for color variations (lower = redder, higher = whiter)

### Creating Anime Style Fire

1. Select "Anime Style" shader
2. Set intensity to 80-90 for bold colors
3. Adjust turbulence to 30-50 for stylized movement
4. Increase saturation to 90-100 for vibrant colors

### Exporting Your Fire

**PNG Export:**
- Click "Export PNG" button
- Current frame is saved as high-quality PNG
- Use for still images and compositing

**GIF Recording:**
- Click "Record GIF" to start capture
- Animation is recorded for 5 seconds
- Click "Stop Recording" or wait for automatic stop
- Frames are captured and can be exported

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

**Particle Count (0-5000)**
- Number of ember particles
- 0: No particles (shader only)
- 1000-2000: Balanced performance
- 3000-5000: Dense particle effects

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
