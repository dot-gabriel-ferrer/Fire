# Fire Simulation Tool - Usage Examples

## Quick Start

1. Open `index.html` in a WebGL-compatible browser
2. The fire simulation starts automatically
3. Use Quick Presets for instant professional fire effects
4. Fine-tune with parameter controls
5. Export your creation as PNG or GIF

## Using Quick Presets

The fastest way to get professional results is using the preset system:

### 🔥 Campfire (Keyboard: 1)
**Perfect for:** Outdoor scenes, camping scenarios, cozy atmospheres
- Warm orange tones
- Medium turbulence for natural movement
- Moderate particle count
- Gentle upward flow

**Use Cases:** Camping scenes, outdoor gatherings, survival scenarios

### 🕯️ Torch (Keyboard: 2)
**Perfect for:** Medieval scenes, dungeons, atmospheric lighting
- Bright, dancing flame
- High turbulence for dramatic movement
- Strong upward flow
- Intense particle emission

**Use Cases:** Torch-lit corridors, medieval settings, dramatic lighting

### 🏕️ Bonfire (Keyboard: 3)
**Perfect for:** Large fire displays, celebrations, intense scenes
- Very high intensity
- Maximum height
- Strong turbulence
- High particle density

**Use Cases:** Beach parties, large gatherings, intense fire scenes

### 🕯️ Candle (Keyboard: 4)
**Perfect for:** Intimate scenes, small lights, stable flames
- Low turbulence for stability
- Small, controlled flame
- Minimal particle count
- Subtle movement

**Use Cases:** Candlelit dinners, prayer scenes, intimate moments

### 💥 Explosion
**Perfect for:** Action scenes, explosive effects, high-energy moments
- Maximum intensity and turbulence
- Fastest animation speed
- Dense particle emission
- Strong wind effects

**Use Cases:** Explosions, action sequences, dramatic effects

### 🔥 Furnace
**Perfect for:** Industrial scenes, metal-working, intense heat
- Very high temperature (blue-white core)
- Controlled, consistent burn
- Moderate turbulence
- Industrial aesthetic

**Use Cases:** Forges, industrial scenes, metal-working

### ✨ Magical Fire
**Perfect for:** Fantasy scenes, magical effects, stylized visuals
- Maximum saturation
- High vorticity for swirling motion
- Enhanced particle effects
- Vibrant colors

**Use Cases:** Magic spells, fantasy effects, stylized scenes

### 💨 Dying Embers
**Perfect for:** End scenes, cooling fire, subtle effects
- Low intensity
- Deep red tones
- Minimal height
- Slow, fading particles

**Use Cases:** Extinguishing fires, end of campfire, ember effects

## Advanced Customization

### Creating Realistic Fire

1. Select "Realistic" shader style
2. Start with **Bonfire** or **Campfire** preset
3. Adjust **Temperature** (40-60) for natural orange tones
4. Set **Turbulence** (50-70) for organic movement
5. Fine-tune **Buoyancy** (60-75) for proper upward flow
6. Add **Vorticity** (50-60) for swirling motion
7. Adjust **Wind Strength** (0-15) for environmental interaction

**Pro Tip:** Keep saturation between 75-90 for realistic colors

### Creating Stylized/Anime Fire

1. Select "Anime Style" shader
2. Start with **Magical Fire** preset
3. Set **Saturation** to 90-100 for vibrant colors
4. Increase **Turbulence** (60-80) for dramatic movement
5. Adjust **Temperature** for desired color palette
6. Lower **Dissipation** (20-30) for sharper edges

**Pro Tip:** Anime style looks best with high saturation and temperature

### Simulating Different Fire Types

#### Candle Flame
```
Intensity: 50
Height: 35
Turbulence: 20
Buoyancy: 60
Vorticity: 30
Temperature: 45
Particle Count: 800
```

#### Torch Flame
```
Intensity: 75
Height: 70
Turbulence: 60
Buoyancy: 70
Vorticity: 65
Temperature: 55
Particle Count: 2500
```

#### Explosion/Fireball
```
Intensity: 95
Height: 90
Turbulence: 90
Buoyancy: 85
Vorticity: 85
Speed: 180
Temperature: 75
Particle Count: 5000
```

#### Magical/Fantasy Fire
```
Intensity: 80
Height: 65
Turbulence: 75
Buoyancy: 80
Vorticity: 80
Temperature: 65
Saturation: 100
Particle Count: 4000
```

## Parameter Guide

### Fire Parameters

**Intensity (0-100)**
- 0-30: Subtle, smoky fire
- 30-60: Moderate flame visibility
- 60-80: Bright, visible fire
- 80-100: Intense, maximum brightness

**Height (0-100)**
- 0-30: Low, spreading fire
- 30-60: Medium flame height
- 60-80: Tall flames
- 80-100: Maximum vertical extent

**Turbulence (0-100)**
- 0-20: Stable, calm flame
- 20-50: Natural movement
- 50-75: Chaotic, energetic
- 75-100: Violent, explosive

**Animation Speed (0-200)**
- 0: Paused (use for still frames)
- 50: Slow motion
- 100: Normal speed
- 150-200: Fast, energetic

### Color Settings

**Temperature (0-100)**
- 0-20: Dark red, embers
- 20-40: Red-orange, warm fire
- 40-60: Orange-yellow, hot fire
- 60-80: Yellow-white, very hot
- 80-100: White-blue, extreme heat

**Saturation (0-100)**
- 0-30: Desaturated, smoky, realistic
- 30-60: Natural color intensity
- 60-85: Vibrant, punchy colors
- 85-100: Maximum saturation, stylized

### Advanced Physics Parameters

**Buoyancy (0-100)**
Controls how strongly hot air rises.
- 0-30: Minimal upward force, spreading fire
- 30-60: Natural buoyancy
- 60-80: Strong upward flow
- 80-100: Extreme rising motion

**Vorticity/Curl (0-100)**
Controls swirling, rotating motion.
- 0-30: Minimal swirl, straight flow
- 30-60: Natural turbulent swirl
- 60-80: Strong vortex motion
- 80-100: Extreme rotation

**Dissipation (0-100)**
Controls how quickly fire fades.
- 0-30: Sharp edges, persistent fire
- 30-60: Natural fadeout
- 60-80: Quick dissipation
- 80-100: Very fast fading

**Fuel Consumption (0-100)**
Controls flame sustainability.
- 0-30: Long, sustained flames
- 30-60: Natural consumption
- 60-80: Quick burnout
- 80-100: Rapid fuel depletion

### Environmental Effects

**Wind Strength (0-100)**
- 0: No wind
- 10-30: Gentle breeze
- 30-60: Moderate wind
- 60-100: Strong wind

**Wind Direction (0-100)**
Maps to 0-360° rotation:
- 0: East (right)
- 25: North (up)
- 50: West (left)
- 75: South (down)

### Particle System

**Particle Count (0-5000)**
- 0-500: Minimal particles, best performance
- 500-1500: Balanced quality/performance
- 1500-3000: High quality
- 3000-5000: Maximum detail (may impact FPS)

**Particle Size (1-10)**
- 1-3: Fine, detailed particles
- 3-5: Balanced size
- 5-7: Large, visible particles
- 7-10: Very large embers

## Keyboard Shortcuts

| Shortcut | Action | Use Case |
|----------|--------|----------|
| **R** | Reset to defaults | Quick reset of all parameters |
| **S** | Toggle shader style | Switch between Realistic/Anime |
| **P** | Export PNG | Quick snapshot export |
| **Space** | Pause/Resume | Freeze frame for inspection |
| **1** | Campfire preset | Outdoor/camping scenes |
| **2** | Torch preset | Medieval/dungeon scenes |
| **3** | Bonfire preset | Large fire scenes |
| **4** | Candle preset | Intimate/small flame scenes |

## Production Tips

### 1. Performance Optimization

**For Slower Systems:**
- Reduce particle count to 1000-1500
- Lower particle size to 2-3
- Decrease turbulence and vorticity
- Set animation speed to 80-90

**For Maximum Quality:**
- Set particle count to 3500-5000
- Increase particle size to 4-5
- Maximize turbulence and vorticity
- Ensure 60 FPS for smooth motion

### 2. Visual Quality

**Realistic Appearance:**
- Use Realistic shader
- Keep saturation 70-85
- Use natural temperature values (40-60)
- Add subtle wind (5-15 strength)
- Match reference footage

**Stylized/Fantasy Look:**
- Use either shader depending on style
- Maximize saturation (90-100)
- Adjust temperature for color theme
- Increase vorticity for magical swirl
- High turbulence for energy

### 3. Export Quality

**For Best Results:**
- Maximize browser window before export
- Canvas resolution = window size
- Pause animation (Space) for perfect timing
- Use PNG for high quality still frames
- Use GIF recording for animations

**Workflow:**
1. Choose preset or create custom parameters
2. Maximize window
3. Let animation settle (2-3 seconds)
4. Press P for PNG or use Record GIF
5. Import into your editing software

### 4. Color Grading

**Time of Day Matching:**
- **Daylight**: Temperature 50-60, Saturation 70-80
- **Sunset**: Temperature 40-50, Saturation 85-95
- **Night**: Temperature 35-45, Saturation 80-90
- **Industrial**: Temperature 65-80, Saturation 60-70

**Matching Scene Lighting:**
- Analyze your scene's color temperature
- Adjust fire temperature to complement
- Use saturation to match scene intensity
- Add wind to match environmental conditions

### 5. Layering and Compositing

**Multiple Fire Elements:**
1. Export background fire with high intensity
2. Export foreground fire with adjusted parameters
3. Export ember layer separately (set fire intensity low, particles high)
4. Composite in video editing software
5. Add glow/blur effects in post

**Integration Tips:**
- Use PNG exports with transparency
- Layer multiple fires for depth
- Add motion blur in post-production
- Color grade to match scene

## Common Scenarios

### Campfire Scene
1. Apply **Campfire** preset (key: 1)
2. Add gentle wind: Wind Strength 5-10
3. Adjust temperature to match lighting: 40-50
4. Export with particles for embers

### Action/Explosion
1. Apply **Explosion** preset
2. Maximize turbulence: 90-100
3. Set speed to 150-180
4. High particle count: 4000-5000
5. Record as GIF for animation

### Magical Effect
1. Apply **Magical Fire** preset
2. Select Realistic or Anime shader
3. Maximize saturation: 100
4. Increase vorticity: 80-90
5. Adjust color with temperature

### Industrial Furnace
1. Apply **Furnace** preset
2. Increase temperature: 75-85 (blue-white)
3. Lower saturation: 65-75
4. Moderate turbulence: 40-50
5. No wind

## Troubleshooting

**Fire looks too smooth/unrealistic:**
- Increase Turbulence (60-80)
- Increase Vorticity (60-75)
- Add multi-scale detail with higher values

**Fire is too intense:**
- Lower Intensity (40-60)
- Decrease particle count
- Reduce temperature

**Not enough movement:**
- Increase Animation Speed (120-150)
- Increase Turbulence (60-80)
- Increase Buoyancy (70-85)

**Performance issues:**
- Lower Particle Count (1000-1500)
- Reduce Particle Size (2-3)
- Close other browser tabs
- Check FPS display (should be 30-60)

**Wrong colors:**
- Adjust Temperature (controls color temperature)
- Adjust Saturation (controls color intensity)
- Try different shader style
- Reference real fire footage

## Advanced Techniques

### Parameter Animation
While the tool doesn't support keyframing, you can:
1. Record screen with OBS or similar
2. Manually adjust parameters during recording
3. Create smooth transitions between presets
4. Export as video for editing

### Creating Custom Presets
1. Adjust all parameters to desired values
2. Note all slider values
3. Keep a text file of your custom presets
4. Quickly recreate by entering values

### Matching Reference Footage
1. Import reference fire video/image
2. Analyze: color temperature, movement speed, size
3. Start with closest preset
4. Match temperature setting to color
5. Match turbulence to movement
6. Adjust height to match proportion
7. Fine-tune with advanced physics parameters

## Best Practices

1. **Start with Presets**: Always begin with the closest preset
2. **Make Small Adjustments**: Change one parameter at a time
3. **Use Keyboard Shortcuts**: Speed up workflow significantly
4. **Monitor FPS**: Keep above 30 FPS for smooth playback
5. **Export at Max Size**: Bigger window = higher resolution export
6. **Reference Real Fire**: Study actual fire for realistic results
7. **Save Your Settings**: Note parameter values for reproducible results

## Resources

- **Real Fire Reference**: Study actual fire videos on YouTube
- **VFX Tutorials**: Learn compositing techniques
- **Color Theory**: Understand fire color temperatures
- **Performance**: Check system specs and optimize accordingly
