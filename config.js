// config.js

const getApiBaseUrl = () => {
  // This code runs in the browser, so `window` is available.
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Use your local backend's URL. Make sure this port matches your local server.
    return 'http://localhost:5000/api';
  }
  // Otherwise, we are on the live site. Using a relative path is best practice
  // as it avoids CORS issues and works seamlessly with Netlify's proxy.
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();