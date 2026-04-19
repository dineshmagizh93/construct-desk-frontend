import { apiClient } from './client';
import { Document, DocumentType } from '@/types/document';
import { PaginatedResponse, PaginationParams } from './pagination';

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

export interface DocumentListParams extends PaginationParams {
  projectId?: string;
  type?: DocumentType;
  search?: string;
  startDate?: string;
  endDate?: string;
}

const normalizeDocumentList = (data: any): any[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
};

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
  async getPage(params: DocumentListParams = {}): Promise<PaginatedResponse<Document>> {
    const searchParams = new URLSearchParams();
    if (params.projectId) searchParams.set('projectId', params.projectId);
    if (params.type) searchParams.set('type', params.type);
    if (params.search) searchParams.set('search', params.search);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    const data = await apiClient.get<PaginatedResponse<any>>(`/documents${query ? `?${query}` : ''}`);

    return {
      ...data,
      items: data.items.map(transformDocument),
    };
  },

  async getAll(projectId?: string): Promise<Document[]> {
    const endpoint = projectId ? `/documents?projectId=${projectId}` : '/documents';
    const data = await apiClient.get<any>(endpoint);
    return normalizeDocumentList(data).map(transformDocument);
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


