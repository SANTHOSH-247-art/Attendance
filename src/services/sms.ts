import { initDB } from './db';
import type { SMSQueueItem } from './db';
// import { APP_CONFIG } from '../conf/config';

export const smsService = {
    processing: false,
    
    // Queue an SMS for offline/later sending
    async queueSMS(studentId: string, studentName: string, parentPhone: string, message: string) {
        const db = await initDB();
        const smsItem: SMSQueueItem = {
            sms_id: crypto.randomUUID(),
            student_id: studentId,
            student_name: studentName,
            parent_phone: parentPhone,
            message: message,
            created_at: Date.now(),
            sent: false
        };
        await db.add('sms_queue', smsItem);
        
        // Try to send immediately if online (but not if already processing)
        if (navigator.onLine && !this.processing) {
            setTimeout(() => {
                this.processPendingSMS();
            }, 1000); // Small delay to allow UI to update
        }
        
        return smsItem;
    },

    // Get count of pending messages
    async getPendingCount() {
        const db = await initDB();
        const all = await db.getAll('sms_queue');
        return all.filter((item: SMSQueueItem) => !item.sent).length;
    },

    // Process the queue: Send pending messages if online
    async processPendingSMS() {
        if (!navigator.onLine) return { processed: 0, errors: 0 };

        const db = await initDB();
        const all = await db.getAll('sms_queue');
        const pending = all.filter((item: SMSQueueItem) => !item.sent);

        if (pending.length === 0) return { processed: 0, errors: 0 };

        // Prevent duplicate processing
        if (this.processing) return { processed: 0, errors: 0 };
        this.processing = true;

        let processed = 0;
        let errors = 0;

        try {
            for (const item of pending) {
                // Check again if already sent (prevents race conditions)
                const freshItem = await db.get('sms_queue', item.sms_id);
                if (freshItem?.sent) continue;

                try {
                    // Point to local Python backend
                    // Ensure server.py is running on port 5000
                    const response = await fetch('http://localhost:5000/send-sms', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: item.parent_phone,
                            message: item.message
                        })
                    });

                    if (response.ok) {
                        // Update as sent
                        item.sent = true;
                        item.sent_at = Date.now();
                        await db.put('sms_queue', item);
                        processed++;
                    } else {
                        const errorData = await response.json();
                        console.error(`Failed to send SMS to ${item.student_name}:`, errorData);
                        errors++;
                    }
                } catch (error) {
                    console.error(`Failed to send SMS to ${item.student_name}: Network error (Is server.py running?)`, error);
                    errors++;
                }
            }
        } finally {
            this.processing = false;
        }

        return { processed, errors };
    }
};