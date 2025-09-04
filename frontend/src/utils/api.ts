// Use environment variable or fallback to production URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://journi-backend.onrender.com';

// Debug environment variables
console.log('Environment Variables:', {
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  NODE_ENV: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV
});

// Ensure the URL doesn't end with a slash
const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

console.log('Using API base URL:', cleanBaseUrl);

// Test the backend connection on startup
const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    const response = await fetch(`${cleanBaseUrl}/health`);
    const data = await response.text();
    console.log('Backend connection test response:', { status: response.status, statusText: response.statusText, data });
  } catch (error) {
    console.error('Backend connection test failed:', error);
  }
};

testBackendConnection();

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Generic fetch with auth
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  // Ensure URL is properly formatted
  const fullUrl = `${cleanBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  
  console.log(`Preparing request to: ${fullUrl}`);
  
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  // Set auth header if token exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    console.log('Auth token is present');
  } else {
    console.warn('No auth token found for request');
  }
  
  // Ensure content type is set for non-GET requests with body
  if (options.body && !(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }
  
  // Add CORS mode
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include' as RequestCredentials,
    mode: 'cors' as RequestMode
  };
  
  console.log('Sending request with options:', {
    url: fullUrl,
    method: fetchOptions.method || 'GET',
    headers: Object.fromEntries(headers.entries()),
    hasBody: !!options.body
  });
  
  try {
    const response = await fetch(fullUrl, fetchOptions);
    
    console.log('Received response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url
    });
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear auth token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
    
    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    
    // Handle 404 Not Found
    if (response.status === 404) {
      throw new Error('The requested resource was not found.');
    }
    
    // Handle 500 Internal Server Error
    if (response.status >= 500) {
      const errorText = await response.text();
      console.error('Server error:', errorText);
      throw new Error('An unexpected error occurred on the server.');
    }
    
    // For successful responses, try to parse as JSON
    if (response.status >= 200 && response.status < 300) {
      try {
        const data = await response.json();
        return data;
      } catch (e) {
        // If not JSON, return as text
        return await response.text();
      }
    }
    
    // For other status codes, throw an error with status text
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  } catch (error) {
    console.error('Fetch error:', error);
    
    // Enhance the error with more context if it's not already enhanced
    if (error instanceof Error) {
      if (!('response' in error)) {
        (error as any).response = null;
        (error as any).data = error.message;
        (error as any).status = 0;
      }
    }
    
    throw error;
  }
};

// File upload helper
export const uploadFiles = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });
  
  console.log('Uploading files:', Array.from(files).map(f => f.name));
  
  const response = await fetchWithAuth('/api/files/upload', {
    method: 'POST',
    body: formData,
  });
  
  return response;
};

// Journey API
export const journeyApi = {
  create: async (data: any) => {
    console.log('Creating journey with data:', data);
    try {
      const response = await fetchWithAuth('/api/journey/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating journey:', error);
      throw error;
    }
  },
  
  getStatus: async (jobId: string) => {
    console.log('Getting status for job:', jobId);
    try {
      const response = await fetchWithAuth(`/api/journey/status/${jobId}`);
      return response;
    } catch (error) {
      console.error(`Error getting status for job ${jobId}:`, error);
      throw error;
    }
  },
  
  getJourney: async (journeyId: string) => {
    console.log('Getting journey:', journeyId);
    try {
      const response = await fetchWithAuth(`/api/journey/${journeyId}`);
      return response;
    } catch (error) {
      console.error(`Error getting journey ${journeyId}:`, error);
      throw error;
    }
  }
};

export default fetchWithAuth;
