export function formatText(text) {
    if (!text || typeof text !== 'string') return text;
    
    const trimmed = text.trim(); 
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export const ensureArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [data];
};

export const safeParseJSON = (data) => {
    if (!data) return null;
    if (typeof data !== 'string') return data; 
    
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error("Erro no safeParseJSON:", error);
        return null;
    }
};