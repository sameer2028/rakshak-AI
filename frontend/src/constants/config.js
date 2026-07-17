// API base URL - points to FastAPI backend
const envUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = envUrl 
  ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) 
  : 'http://localhost:8000/api';

// App metadata
export const APP_NAME = 'Rakshak AI';
export const APP_FULL_NAME = 'Rakshak AI Intelligence Grid';
export const APP_TAGLINE = 'AI Powered Digital Public Safety Intelligence Platform';
