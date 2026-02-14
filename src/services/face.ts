import * as faceapi from 'face-api.js';

// Configuration
const MODELS_URL = '/models';

export const faceService = {
    async loadModels() {
        try {
            await Promise.all([
                faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
                faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL) // Backup/Faster
            ]);
            console.log("Face API Models Loaded");
            return true;
        } catch (error) {
            console.error("Failed to load face models:", error);
            // Log specific model that failed if possible or just the error object structure
            if (error instanceof Error) {
                console.error("Error details:", error.message, error.stack);
            }
            return false;
        }
    },

    async getFaceDescriptor(imageElement: HTMLImageElement | HTMLVideoElement): Promise<Float32Array | null> {
        // Using TinyFaceDetector for better offline performance and reliability
        const detection = await faceapi.detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            return null;
        }

        return detection.descriptor;
    },

    calculateDistance(descriptor1: number[] | Float32Array, descriptor2: number[] | Float32Array): number {
        return faceapi.euclideanDistance(descriptor1, descriptor2);
    },

    // Helper to convert Float32Array to regular array for storage
    descriptorToJSON(descriptor: Float32Array): number[] {
        return Array.from(descriptor);
    },

    // Helper to convert back
    jsonToDescriptor(json: number[]): Float32Array {
        return new Float32Array(json);
    }
};
