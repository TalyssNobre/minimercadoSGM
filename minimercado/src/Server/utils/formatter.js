export function formatText(text) {
    if (!text || typeof text !== 'string') return text;
    
    const trimmed = text.trim(); 
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}