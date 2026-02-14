import { dbService } from './db';
import type { SyncQueueItem } from './db';

// Mock API endpoint
const API_URL = 'https://api.shikshasetu.mock/sync';
console.log(`Sync Service Initialized. Endpoint: ${API_URL}`);

export const syncService = {
    async attemptSync() {
        if (!navigator.onLine) {
            console.log('Offline: Skipping sync');
            return;
        }

        try {
            const unsyncedItems = await dbService.getUnsyncedRecords();
            if (unsyncedItems.length === 0) {
                console.log('No items to sync');
                return;
            }

            console.log(`Attempting to sync ${unsyncedItems.length} items...`);

            for (const item of unsyncedItems) {
                await syncItem(item);
            }

            console.log('Sync complete');
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }
};

async function syncItem(item: SyncQueueItem) {
    try {
        // get the actual record data
        // optimization: dbService could return joined data, but for now we fetch it if needed
        // or just send the item.record_id. 
        // The requirement says "Prepare them for future API upload".
        // We will simulate a POST request.

        console.log(`Syncing record: ${item.record_id}`);

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock success
        await dbService.updateSyncStatus(item.queue_id, true);
        console.log(`Synced: ${item.record_id}`);

    } catch (error) {
        console.error(`Failed to sync item ${item.queue_id}`, error);
    }
}

// Auto-sync setup
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('Back online, attempting sync...');
        syncService.attemptSync();
    });

    // Periodically attempt sync if online
    setInterval(() => {
        syncService.attemptSync();
    }, 60 * 1000); // Check every minute
}
