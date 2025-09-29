// Create a new file: lib/api/apiHelper.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export class ApiHelper {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private static getHeaders(requireAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  static async fetch(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<Response> {
    const { requireAuth = false, headers = {}, ...restOptions } = options;

    const defaultHeaders = this.getHeaders(requireAuth);
    const mergedHeaders = { ...defaultHeaders, ...headers };

    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      hasAuth: Object.prototype.hasOwnProperty.call(mergedHeaders, 'Authorization'),
    });

    const response = await fetch(url, {
      ...restOptions,
      headers: mergedHeaders,
    });

    console.log('API Response:', {
      url,
      status: response.status,
      ok: response.ok,
    });

    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      throw new Error('Session expired. Please login again.');
    }

    return response;
  }

  static async uploadFile(
    endpoint: string,
    file: File,
    fieldName: string = 'image'
  ): Promise<any> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    console.log('File Upload Request:', {
      url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      hasToken: !!token,
    });

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Upload Response:', {
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }

      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || 'Upload failed');
      } catch {
        throw new Error(`Upload failed with status ${response.status}`);
      }
    }

    return response.json();
  }
}

// Now update your useProducts.ts uploadImage function:

const uploadImage = async (file: File): Promise<string> => {
  try {
    const data = await ApiHelper.uploadFile('/api/admin/upload', file, 'image');
    return data.data?.url || data.url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};