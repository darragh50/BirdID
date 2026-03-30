// API Configuration
const API_CONFIG = {
    // Production URL (Railway)
    PRODUCTION_URL: 'https://birdid-production.up.railway.app',
    
    // Local development URL
    LOCAL_URL: 'http://192.168.1.16:8000',
    
    // Set to true for production, false for local dev
    USE_PRODUCTION: true,
  };
  
  // Export the active URL
  export const BACKEND_URL = API_CONFIG.USE_PRODUCTION 
    ? API_CONFIG.PRODUCTION_URL 
    : API_CONFIG.LOCAL_URL;
  
  export default API_CONFIG;