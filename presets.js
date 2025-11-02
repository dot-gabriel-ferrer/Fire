// Fire Simulation Presets
class PresetManager {
    static PRESETS = {
        campfire: {
            name: "Campfire",
            description: "Warm, natural campfire with dancing flames",
            params: {
                intensity: 65,
                height: 50,
                turbulence: 40,
                speed: 85,
                temperature: 42,
                saturation: 85,
                particleCount: 250,
                particleSize: 3,
                particleLifetime: 1.2,
                buoyancy: 58,
                vorticity: 48,
                dissipation: 48,
                fuelConsumption: 42,
                windStrength: 8,
                windDirection: 50
            }
        },
        torch: {
            name: "Torch",
            description: "Tall, flickering torch flame",
            params: {
                intensity: 72,
                height: 72,
                turbulence: 62,
                speed: 115,
                temperature: 52,
                saturation: 88,
                particleCount: 180,
                particleSize: 2.5,
                particleLifetime: 0.9,
                buoyancy: 72,
                vorticity: 68,
                dissipation: 38,
                fuelConsumption: 52,
                windStrength: 12,
                windDirection: 50
            }
        },
        bonfire: {
            name: "Bonfire",
            description: "Large, intense bonfire with strong upward flow",
            params: {
                intensity: 80,
                height: 78,
                turbulence: 68,
                speed: 95,
                temperature: 58,
                saturation: 82,
                particleCount: 400,
                particleSize: 4,
                particleLifetime: 1.5,
                buoyancy: 75,
                vorticity: 65,
                dissipation: 32,
                fuelConsumption: 35,
                windStrength: 15,
                windDirection: 50
            }
        },
        candle: {
            name: "Candle",
            description: "Small, stable candle flame - realistic teardrop shape",
            params: {
                intensity: 55,
                height: 28,
                turbulence: 8,
                speed: 45,
                temperature: 48,
                saturation: 82,
                particleCount: 50,
                particleSize: 1.5,
                particleLifetime: 1.8,
                buoyancy: 45,
                vorticity: 12,
                dissipation: 25,
                fuelConsumption: 65,
                windStrength: 0,
                windDirection: 50
            }
        },
        explosion: {
            name: "Explosion",
            description: "Violent, explosive fire with maximum turbulence",
            params: {
                intensity: 92,
                height: 88,
                turbulence: 88,
                speed: 175,
                temperature: 72,
                saturation: 85,
                particleCount: 500,
                particleSize: 5,
                particleLifetime: 0.6,
                buoyancy: 82,
                vorticity: 85,
                dissipation: 22,
                fuelConsumption: 30,
                windStrength: 28,
                windDirection: 50
            }
        },
        furnace: {
            name: "Furnace",
            description: "Hot, industrial furnace with intense blue-white core",
            params: {
                intensity: 88,
                height: 68,
                turbulence: 45,
                speed: 88,
                temperature: 78,
                saturation: 72,
                particleCount: 300,
                particleSize: 3,
                particleLifetime: 1.1,
                buoyancy: 68,
                vorticity: 52,
                dissipation: 28,
                fuelConsumption: 32,
                windStrength: 0,
                windDirection: 50
            }
        },
        magical: {
            name: "Magical Fire",
            description: "Stylized magical flame with enhanced colors",
            params: {
                intensity: 78,
                height: 62,
                turbulence: 72,
                speed: 135,
                temperature: 62,
                saturation: 98,
                particleCount: 350,
                particleSize: 3,
                particleLifetime: 1.3,
                buoyancy: 78,
                vorticity: 78,
                dissipation: 42,
                fuelConsumption: 48,
                windStrength: 22,
                windDirection: 50
            }
        },
        embers: {
            name: "Dying Embers",
            description: "Fading embers and hot coals",
            params: {
                intensity: 38,
                height: 22,
                turbulence: 22,
                speed: 48,
                temperature: 28,
                saturation: 88,
                particleCount: 120,
                particleSize: 4,
                particleLifetime: 2.2,
                buoyancy: 35,
                vorticity: 32,
                dissipation: 58,
                fuelConsumption: 72,
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
            'buoyancy', 'vorticity', 'dissipation', 'fuelConsumption',
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
