// Fire Simulation Presets
class PresetManager {
    static PRESETS = {
        campfire: {
            name: "Campfire",
            description: "Warm, gentle campfire",
            params: {
                intensity: 60,
                height: 45,
                turbulence: 35,
                speed: 80,
                temperature: 40,
                saturation: 85,
                particleCount: 1500,
                particleSize: 3,
                buoyancy: 55,
                vorticity: 45,
                dissipation: 50,
                fuelConsumption: 40,
                windStrength: 5,
                windDirection: 50
            }
        },
        torch: {
            name: "Torch",
            description: "Bright, dancing torch flame",
            params: {
                intensity: 75,
                height: 70,
                turbulence: 60,
                speed: 120,
                temperature: 55,
                saturation: 90,
                particleCount: 2500,
                particleSize: 2,
                buoyancy: 70,
                vorticity: 65,
                dissipation: 35,
                fuelConsumption: 50,
                windStrength: 10,
                windDirection: 50
            }
        },
        bonfire: {
            name: "Bonfire",
            description: "Large, intense bonfire",
            params: {
                intensity: 85,
                height: 80,
                turbulence: 70,
                speed: 100,
                temperature: 60,
                saturation: 80,
                particleCount: 3500,
                particleSize: 4,
                buoyancy: 75,
                vorticity: 70,
                dissipation: 30,
                fuelConsumption: 35,
                windStrength: 15,
                windDirection: 50
            }
        },
        candle: {
            name: "Candle",
            description: "Small, stable candle flame",
            params: {
                intensity: 50,
                height: 35,
                turbulence: 20,
                speed: 60,
                temperature: 45,
                saturation: 80,
                particleCount: 800,
                particleSize: 2,
                buoyancy: 60,
                vorticity: 30,
                dissipation: 45,
                fuelConsumption: 55,
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
                particleCount: 5000,
                particleSize: 5,
                buoyancy: 85,
                vorticity: 85,
                dissipation: 20,
                fuelConsumption: 30,
                windStrength: 25,
                windDirection: 50
            }
        },
        furnace: {
            name: "Furnace",
            description: "Hot, industrial furnace fire",
            params: {
                intensity: 90,
                height: 70,
                turbulence: 50,
                speed: 90,
                temperature: 80,
                saturation: 75,
                particleCount: 3000,
                particleSize: 3,
                buoyancy: 70,
                vorticity: 55,
                dissipation: 25,
                fuelConsumption: 30,
                windStrength: 0,
                windDirection: 50
            }
        },
        magical: {
            name: "Magical Fire",
            description: "Stylized, magical flame effect",
            params: {
                intensity: 80,
                height: 65,
                turbulence: 75,
                speed: 140,
                temperature: 65,
                saturation: 100,
                particleCount: 4000,
                particleSize: 3,
                buoyancy: 80,
                vorticity: 80,
                dissipation: 40,
                fuelConsumption: 45,
                windStrength: 20,
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
                temperature: 25,
                saturation: 90,
                particleCount: 1200,
                particleSize: 4,
                buoyancy: 40,
                vorticity: 35,
                dissipation: 60,
                fuelConsumption: 70,
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
            'temperature', 'saturation', 'particleCount', 'particleSize',
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
