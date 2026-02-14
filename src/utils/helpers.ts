export const formatDate = (date: Date | number | string): string => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date); // Fallback for invalid dates
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(d);
    } catch (e) {
        return String(date);
    }
};

export const formatTime = (date: Date | number | string): string => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date).split('T')[1]?.split('.')[0] || String(date); // Fallback
        return new Intl.DateTimeFormat('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(d);
    } catch (e) {
        return String(date);
    }
};

export const generateId = (): string => {
    return crypto.randomUUID();
};
