import { apiClient } from './client';
import { Document, DocumentType } from '@/types/document';

export interface CreateDocumentDto {
  projectId: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  notes?: string;
}

export interface UpdateDocumentDto {
  projectId?: string;
  name?: string;
  type?: DocumentType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  notes?: string;
}

// Transform backend response to frontend Document type
const transformDocument = (data: any): Document => {
  return {
    id: data.id,
    projectId: data.projectId,
    projectName: data.project?.name || '',
    name: data.name,
    type: data.type as DocumentType,
    fileUrl: data.fileUrl,
    fileName: data.fileName || undefined,
    fileSize: data.fileSize || undefined,
    notes: data.notes || undefined,
    uploadedBy: data.uploadedBy || undefined,
    uploadedAt: data.uploadedAt || data.createdAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const documentsApi = {
  async getAll(projectId?: string): Promise<Document[]> {
    const endpoint = projectId ? `/documents?projectId=${projectId}` : '/documents';
    const data = await apiClient.get<any[]>(endpoint);
    return data.map(transformDocument);
  },

  async getById(id: string): Promise<Document> {
    const data = await apiClient.get<any>(`/documents/${id}`);
    return transformDocument(data);
  },

  async create(document: CreateDocumentDto): Promise<Document> {
    const data = await apiClient.post<any>('/documents', document);
    return transformDocument(data);
  },

  async bulkCreate(documents: any[]): Promise<{ requested: number; created: number; skipped: number }> {
    return await apiClient.post<any>('/documents/bulk', { documents });
  },

  async update(id: string, document: UpdateDocumentDto): Promise<Document> {
    const data = await apiClient.patch<any>(`/documents/${id}`, document);
    return transformDocument(data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  },
};


