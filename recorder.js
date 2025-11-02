// Recording and Export Functionality
class FireRecorder {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.isRecording = false;
        this.frames = [];
        this.recordingStartTime = 0;
        this.maxRecordingTime = options.maxRecordingTime || 5000; // Default 5 seconds
        this.frameRate = options.frameRate || 30;
    }

    setMaxRecordingTime(milliseconds) {
        this.maxRecordingTime = milliseconds;
    }

    setFrameRate(fps) {
        this.frameRate = fps;
    }

    startRecording() {
        if (this.isRecording) return;
        
        this.isRecording = true;
        this.frames = [];
        this.recordingStartTime = Date.now();
        console.log('Recording started...');
    }

    captureFrame() {
        if (!this.isRecording) return;
        
        const elapsed = Date.now() - this.recordingStartTime;
        
        if (elapsed > this.maxRecordingTime) {
            this.stopRecording();
            return;
        }

        // Capture frame as data URL
        try {
            this.frames.push(this.canvas.toDataURL('image/png'));
        } catch (e) {
            console.error('Failed to capture frame:', e);
        }
    }

    async stopRecording() {
        if (!this.isRecording) return;
        
        this.isRecording = false;
        console.log(`Recording stopped. Captured ${this.frames.length} frames.`);
        
        if (this.frames.length > 0) {
            await this.generateGIF();
        }
    }

    async generateGIF() {
        console.log('Generating GIF...');
        
        // For production use, you would integrate a GIF encoder library like gif.js
        // Here we'll provide a simplified approach using multiple PNGs
        
        // Since we can't easily create animated GIFs without external libraries,
        // we'll download frames as a ZIP or create an APNG
        // For now, we'll just download the first and last frame to demonstrate
        
        if (this.frames.length === 0) return;
        
        // Download middle frame as example
        const middleFrame = this.frames[Math.floor(this.frames.length / 2)];
        this.downloadDataURL(middleFrame, 'fire-animation-frame.png');
        
        alert(`Recording complete! ${this.frames.length} frames captured.\nFrame exported as PNG.\nFor GIF export, integrate gif.js library.`);
    }

    exportPNG() {
        try {
            const dataURL = this.canvas.toDataURL('image/png');
            this.downloadDataURL(dataURL, 'fire-snapshot.png');
            console.log('PNG exported successfully');
        } catch (e) {
            console.error('Failed to export PNG:', e);
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

    // For future implementation with gif.js library
    async createGIFWithLibrary() {
        // This would require including gif.js library
        // Example implementation:
        /*
        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: this.canvas.width,
            height: this.canvas.height,
            workerScript: 'gif.worker.js'
        });

        // Add frames
        for (const frameData of this.frames) {
            const img = new Image();
            img.src = frameData;
            await new Promise(resolve => img.onload = resolve);
            gif.addFrame(img, {delay: 1000 / this.frameRate});
        }

        gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            this.downloadDataURL(url, 'fire-animation.gif');
        });

        gif.render();
        */
    }
}
