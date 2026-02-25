import { API_BASE_URL, getAuthToken } from '../config';

export interface UploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
}

export const uploadApi = {
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Use API_BASE_URL which already includes /api, so just add /upload/document
    const response = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  async uploadPhotos(files: File[]): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });

    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    // Use API_BASE_URL which already includes /api, so just add /upload/photos
    const response = await fetch(`${API_BASE_URL}/upload/photos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },
};


