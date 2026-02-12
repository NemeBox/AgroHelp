// config.js

const getApiBaseUrl = () => {
  // If the window's hostname is 'localhost' or '127.0.0.1', we are in a local environment
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Use your local backend's URL
    return 'http://localhost:5000/api';
  }
  // Otherwise, we are on the live site, so use the live API URL
  return 'https://frabjous-malabi-24dc80.netlify.app/api';
};

const API_BASE_URL = getApiBaseUrl();