// Utility functions for HTML generation
export function safeHasProperty(obj: any, prop: string): boolean {
  return obj && typeof obj === 'object' && prop in obj;
}

export function safeToString(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'symbol') return value.toString();
  return String(value);
}

// Helper function to safely convert any value to string for HTML attributes, handling symbols
export function safeAttributeValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'symbol') return value.toString();
  return String(value);
}

export function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
} 