// The backend now deploys as a separate app/origin from the frontend, so
// every /api/* call needs the backend's URL in front of it. Empty string
// keeps same-origin behavior as a default (e.g. if both ever share a
// domain again); set VITE_API_BASE_URL at build time to point elsewhere.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
