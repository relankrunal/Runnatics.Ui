export function formatString(template: string, ...args: any[]): string {
    // Example implementation: Trim whitespace and convert to lowercase
    return template.replace(/{(\d+)}/g, (match, index) => {
        return typeof args[index] !== 'undefined' ? args[index] : match;
    }).trim().toLowerCase();
}