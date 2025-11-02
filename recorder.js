// Recording and Export Functionality with GIF.js Integration
class FireRecorder {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.isRecording = false;
        this.frames = [];
        this.recordingStartTime = 0;
        this.maxRecordingTime = options.maxRecordingTime || 3000; // Default 3 seconds
        this.frameRate = options.frameRate || 20; // 20 FPS for reasonable GIF size
        this.frameInterval = 1000 / this.frameRate; // ms between frames
        this.lastFrameTime = 0;
        this.gif = null;
        // Use relative path from the current page location
        this.workerScript = options.workerScript || './gif.worker.js';
    }

    setMaxRecordingTime(milliseconds) {
        this.maxRecordingTime = milliseconds;
    }

    setFrameRate(fps) {
        this.frameRate = fps;
        this.frameInterval = 1000 / fps;
    }

    startRecording() {
        if (this.isRecording) return;
        
        this.isRecording = true;
        this.frames = [];
        this.recordingStartTime = Date.now();
        this.lastFrameTime = this.recordingStartTime;
        
        console.log(`Recording started... (${this.maxRecordingTime/1000}s at ${this.frameRate} FPS)`);
    }

    captureFrame() {
        if (!this.isRecording) return;
        
        const now = Date.now();
        const elapsed = now - this.recordingStartTime;
        
        // Check if recording time exceeded
        if (elapsed > this.maxRecordingTime) {
            this.stopRecording();
            return;
        }

        // Only capture frames at the specified frame rate
        if (now - this.lastFrameTime >= this.frameInterval) {
            try {
                // Create a copy of the canvas to avoid issues
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = this.canvas.width;
                tempCanvas.height = this.canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(this.canvas, 0, 0);
                
                this.frames.push({
                    canvas: tempCanvas,
                    delay: this.frameInterval
                });
                
                this.lastFrameTime = now;
                
                // Update UI to show progress
                const progress = Math.round((elapsed / this.maxRecordingTime) * 100);
                console.log(`Recording: ${progress}% (${this.frames.length} frames)`);
            } catch (e) {
                console.error('Failed to capture frame:', e);
            }
        }
    }

    async stopRecording() {
        if (!this.isRecording) return;
        
        this.isRecording = false;
        console.log(`Recording stopped. Captured ${this.frames.length} frames.`);
        
        if (this.frames.length > 0) {
            await this.generateGIF();
        } else {
            alert('No frames captured. Recording was too short.');
        }
    }

    async generateGIF() {
        // Check if GIF.js is available
        if (typeof GIF === 'undefined') {
            console.error('GIF.js library not loaded');
            alert('GIF encoding library not available. Please check your internet connection and reload the page.');
            return;
        }

        console.log('Generating GIF with worker script:', this.workerScript);
        
        try {
            // Create GIF encoder with optimized settings
            this.gif = new GIF({
                workers: 2,
                quality: 10, // Lower is better quality but slower
                width: this.canvas.width,
                height: this.canvas.height,
                workerScript: this.workerScript,
                repeat: 0, // 0 = loop forever
                transparent: null,
                background: '#000000'
            });

            // Add error handler
            this.gif.on('error', (error) => {
                console.error('GIF generation error:', error);
                alert(`GIF generation error: ${error.message || 'Unknown error'}`);
            });

            // Add all captured frames
            console.log(`Adding ${this.frames.length} frames to GIF...`);
            for (let i = 0; i < this.frames.length; i++) {
                this.gif.addFrame(this.frames[i].canvas, {
                    delay: this.frameInterval,
                    copy: true
                });
            }

            // Set up completion handler
            this.gif.on('finished', (blob) => {
                const frameCount = this.frames.length;
                console.log('GIF generation complete!');
                this.downloadBlob(blob, 'fire-animation.gif');
                
                // Clean up
                this.frames = [];
                this.gif = null;
                
                alert(`GIF exported successfully! (${frameCount} frames)`);
            });

            // Set up progress handler
            this.gif.on('progress', (progress) => {
                const percent = Math.round(progress * 100);
                console.log(`GIF encoding: ${percent}%`);
                // Update button text with progress
                const btn = document.getElementById('recordBtn');
                if (btn && percent < 100) {
                    btn.textContent = `Encoding: ${percent}%`;
                }
            });

            // Start rendering
            console.log('Starting GIF render...');
            this.gif.render();
            
        } catch (e) {
            console.error('GIF generation failed:', e);
            console.error('Error stack:', e.stack);
            alert(`GIF generation failed: ${e.message}\nPlease try again or reduce recording time.`);
            
            // Reset button
            const btn = document.getElementById('recordBtn');
            if (btn) {
                btn.textContent = 'Record GIF';
                btn.classList.remove('secondary');
            }
        }
    }

    exportPNG() {
        try {
            const dataURL = this.canvas.toDataURL('image/png');
            this.downloadDataURL(dataURL, 'fire-snapshot.png');
            console.log('PNG exported successfully');
        } catch (e) {
            console.error('Failed to export PNG:', e);
            alert('Failed to export PNG. Please try again.');
        }
    }

    downloadDataURL(dataURL, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    // Cancel recording without generating GIF
    cancelRecording() {
        if (!this.isRecording) return;
        
        this.isRecording = false;
        this.frames = [];
        console.log('Recording cancelled');
    }
}
