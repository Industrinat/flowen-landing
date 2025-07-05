export const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    
    // Staging (future)
    if (hostname === 'staging.flowen.eu') {
      return 'https://staging-api.flowen.eu';
    }
  }
  
  // Production
  return 'https://flowen.eu';
};