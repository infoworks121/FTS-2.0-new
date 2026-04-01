import api from './api';

export const uploadApi = {
  /**
   * Upload a single file
   * @param file The file object from input
   * @returns Promise with the file URL
   */
  uploadSingle: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data as { success: boolean; url: string; filename: string };
  },
};
