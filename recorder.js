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

        console.log('Generating GIF...');
        
        try {
            // Create GIF encoder with optimized settings
            this.gif = new GIF({
                workers: 2,
                quality: 10, // Lower is better quality but slower
                width: this.canvas.width,
                height: this.canvas.height,
                workerScript: 'gif.worker.js',
                repeat: 0 // 0 = loop forever
            });

            // Add all captured frames
            for (let i = 0; i < this.frames.length; i++) {
                this.gif.addFrame(this.frames[i].canvas, {
                    delay: this.frameInterval,
                    copy: true
                });
            }

            // Set up completion handler
            this.gif.on('finished', (blob) => {
                console.log('GIF generation complete!');
                this.downloadBlob(blob, 'fire-animation.gif');
                
                // Clean up
                this.frames = [];
                this.gif = null;
                
                alert(`GIF exported successfully! (${this.frames.length} frames)`);
            });

            // Set up progress handler
            this.gif.on('progress', (progress) => {
                console.log(`GIF encoding: ${Math.round(progress * 100)}%`);
            });

            // Start rendering
            this.gif.render();
            
        } catch (e) {
            console.error('GIF generation failed:', e);
            alert(`GIF generation failed: ${e.message}\nPlease try again or reduce recording time.`);
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
