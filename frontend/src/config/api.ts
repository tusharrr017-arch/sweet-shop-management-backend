// API Configuration
// For Vite projects, use VITE_PUBLIC_API_URL or VITE_API_URL
// For Create React App, use REACT_APP_PUBLIC_API_URL
const getApiUrl = (): string => {
  // Check for Vite environment variables (Vite uses VITE_ prefix)
  if (import.meta.env.VITE_PUBLIC_API_URL) {
    return import.meta.env.VITE_PUBLIC_API_URL;
  }
  
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback to React App convention (for compatibility)
  // Note: This won't work in Vite, but kept for reference
  const reactAppUrl = (import.meta.env as any).REACT_APP_PUBLIC_API_URL;
  if (reactAppUrl) {
    return reactAppUrl;
  }
  
  // Default to empty string (relative URLs) for development
  // When empty, axios will use relative URLs which works with Vite proxy
  return '';
};

export const API_BASE_URL = getApiUrl();

// Helper function to build full API URLs
export const apiUrl = (path: string): string => {
  const baseUrl = API_BASE_URL || '';
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

// Axios instance configuration
export const getApiConfig = () => ({
  baseURL: API_BASE_URL || undefined,
  timeout: 10000,
});

