export const APP_CONFIG = {
    SCHOOL_NAME: 'SMAS Academy',
    THEME_COLOR: '#1a237e', // Deep Navy Blue
    FACE_MATCH_THRESHOLD: 0.55,
    SUBJECTS: ['Math', 'Science', 'English', 'History', 'Geography'],
    CLASSES: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    BACKEND_URL: 'https://your-backend-api.com', // Placeholder for now
    TWILIO: {
        ACCOUNT_SID: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
        AUTH_TOKEN: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
        PHONE_NUMBER: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '+14067327347',
        TO_NUMBER: import.meta.env.VITE_TWILIO_TO_NUMBER || '+918778311896' // User provided personal number
    }
};
