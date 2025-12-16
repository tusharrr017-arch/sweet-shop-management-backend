const getApiUrl = (): string => {
  if (import.meta.env.VITE_PUBLIC_API_URL) {
    return import.meta.env.VITE_PUBLIC_API_URL;
  }
  
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const reactAppUrl = (import.meta.env as any).REACT_APP_PUBLIC_API_URL;
  if (reactAppUrl) {
    return reactAppUrl;
  }
  
  if (import.meta.env.PROD) {
    return '';
  }
  
  return '';
};

export const API_BASE_URL = getApiUrl();

export const apiUrl = (path: string): string => {
  const baseUrl = API_BASE_URL || '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

export const getApiConfig = () => ({
  baseURL: API_BASE_URL || undefined,
  timeout: 10000,
});

