import { existsSync, mkdirSync, createWriteStream, unlink } from 'fs';
import { get } from 'https';
import { join } from 'path';

const MODELS_DIR = join(process.cwd(), 'public', 'models');
const REPO_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const FILES = [
    'ssd_mobilenet_v1_model-weights_manifest.json',
    'ssd_mobilenet_v1_model-shard1',
    'ssd_mobilenet_v1_model-shard2',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1'
];

if (!existsSync(MODELS_DIR)) {
    mkdirSync(MODELS_DIR, { recursive: true });
}

console.log(`Downloading models to ${MODELS_DIR}...`);

const downloadFile = (filename) => {
    return new Promise((resolve, reject) => {
        const file = createWriteStream(join(MODELS_DIR, filename));
        get(`${REPO_URL}/${filename}`, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            unlink(join(MODELS_DIR, filename), () => { });
            reject(err);
        });
    });
};

(async () => {
    for (const file of FILES) {
        try {
            await downloadFile(file);
        } catch (e) {
            console.error(e);
        }
    }
    console.log('All models downloaded.');
})();
