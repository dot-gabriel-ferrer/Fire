// Fire Simulation Presets
class PresetManager {
    static PRESETS = {
        campfire: {
            name: "Campfire",
            description: "Warm, natural campfire with dancing flames",
            params: {
                intensity: 70,
                height: 55,
                turbulence: 45,
                speed: 90,
                temperature: 48,
                saturation: 85,
                particleCount: 100,
                particleSize: 3,
                particleLifetime: 1.2,
                windStrength: 8,
                windDirection: 50
            }
        },
        torch: {
            name: "Torch",
            description: "Tall, flickering torch flame",
            params: {
                intensity: 75,
                height: 70,
                turbulence: 65,
                speed: 120,
                temperature: 55,
                saturation: 88,
                particleCount: 70,
                particleSize: 2.5,
                particleLifetime: 0.9,
                windStrength: 12,
                windDirection: 50
            }
        },
        bonfire: {
            name: "Bonfire",
            description: "Large, intense bonfire with strong upward flow",
            params: {
                intensity: 85,
                height: 80,
                turbulence: 70,
                speed: 100,
                temperature: 60,
                saturation: 82,
                particleCount: 150,
                particleSize: 4,
                particleLifetime: 1.5,
                windStrength: 15,
                windDirection: 50
            }
        },
        candle: {
            name: "Candle",
            description: "Small, stable candle flame",
            params: {
                intensity: 60,
                height: 30,
                turbulence: 10,
                speed: 50,
                temperature: 50,
                saturation: 82,
                particleCount: 20,
                particleSize: 1.5,
                particleLifetime: 1.8,
                windStrength: 0,
                windDirection: 50
            }
        },
        explosion: {
            name: "Explosion",
            description: "Violent, explosive fire",
            params: {
                intensity: 95,
                height: 90,
                turbulence: 90,
                speed: 180,
                temperature: 75,
                saturation: 85,
                particleCount: 200,
                particleSize: 5,
                particleLifetime: 0.6,
                windStrength: 30,
                windDirection: 50
            }
        },
        furnace: {
            name: "Furnace",
            description: "Hot, industrial furnace",
            params: {
                intensity: 90,
                height: 65,
                turbulence: 40,
                speed: 90,
                temperature: 80,
                saturation: 70,
                particleCount: 120,
                particleSize: 3,
                particleLifetime: 1.1,
                windStrength: 0,
                windDirection: 50
            }
        },
        magical: {
            name: "Magical Fire",
            description: "Stylized magical flame",
            params: {
                intensity: 80,
                height: 65,
                turbulence: 75,
                speed: 140,
                temperature: 65,
                saturation: 98,
                particleCount: 130,
                particleSize: 3,
                particleLifetime: 1.3,
                windStrength: 22,
                windDirection: 50
            }
        },
        embers: {
            name: "Dying Embers",
            description: "Fading embers and hot coals",
            params: {
                intensity: 40,
                height: 25,
                turbulence: 25,
                speed: 50,
                temperature: 30,
                saturation: 88,
                particleCount: 50,
                particleSize: 4,
                particleLifetime: 2.2,
                windStrength: 5,
                windDirection: 50
            }
        }
    };

    constructor(fireSimulation) {
        this.simulation = fireSimulation;
    }

    applyPreset(presetName) {
        const preset = PresetManager.PRESETS[presetName];
        if (!preset) {
            console.error(`Preset "${presetName}" not found`);
            return;
        }

        // Apply all parameters from preset
        for (const [key, value] of Object.entries(preset.params)) {
            const slider = document.getElementById(key);
            if (slider) {
                slider.value = value;
                slider.dispatchEvent(new Event('input'));
            }
        }

        console.log(`Applied preset: ${preset.name}`);
    }

    getPresetList() {
        return Object.keys(PresetManager.PRESETS).map(key => ({
            id: key,
            name: PresetManager.PRESETS[key].name,
            description: PresetManager.PRESETS[key].description
        }));
    }

    exportCurrentAsPreset() {
        const params = {};
        
        // Collect all current slider values
        const sliders = [
            'intensity', 'height', 'turbulence', 'speed',
            'temperature', 'saturation', 'particleCount', 'particleSize', 'particleLifetime',
            'windStrength', 'windDirection'
        ];

        for (const sliderId of sliders) {
            const slider = document.getElementById(sliderId);
            if (slider) {
                params[sliderId] = parseFloat(slider.value);
            }
        }

        return {
            name: "Custom",
            description: "User-created preset",
            params: params
        };
    }
}
