export function formatDate(d) { return d ? new Date(d).toLocaleDateString() : ""; }
export function formatDateTime(d) { return d ? new Date(d).toLocaleString() : ""; }
export function generateRegistrationId() { return "REG-" + Math.random().toString(36).substring(2,10).toUpperCase(); }
