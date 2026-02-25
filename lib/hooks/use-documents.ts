"use client"

import { useState, useEffect, useCallback } from "react"
import { Document } from "@/types/document"
import { documentsApi, CreateDocumentDto, UpdateDocumentDto } from "@/lib/api/documents"
import { ApiError } from "@/lib/api/client"

// Simple cache to prevent unnecessary refetches
let documentsCache: { data: Document[]; timestamp: number; projectId?: string } | null = null
const CACHE_DURATION = 30000 // 30 seconds

export function useDocuments() {
  // Initialize with cache if available to prevent loading state
  const [documents, setDocuments] = useState<Document[]>(() => {
    const now = Date.now()
    if (documentsCache && (now - documentsCache.timestamp) < CACHE_DURATION) {
      return documentsCache.data
    }
    return []
  })
  const [loading, setLoading] = useState(() => {
    // Only show loading if no cache available
    const now = Date.now()
    return !(documentsCache && (now - documentsCache.timestamp) < CACHE_DURATION)
  })
  const [error, setError] = useState<string | null>(null)

  const loadDocuments = useCallback(async (projectId?: string, force = false) => {
    // Use cache if available and not stale
    const now = Date.now()
    if (!force && documentsCache && (now - documentsCache.timestamp) < CACHE_DURATION && documentsCache.projectId === projectId) {
      setDocuments(documentsCache.data)
      setLoading(false)
      return
    }

    try {
      // Only set loading if we don't have cached data
      if (!documentsCache || force || documentsCache.projectId !== projectId) {
        setLoading(true)
      }
      setError(null)
      const data = await documentsApi.getAll(projectId)
      setDocuments(data)
      // Update cache
      documentsCache = { data, timestamp: now, projectId }
    } catch (err) {
      const apiError = err as ApiError
      let errorMessage = apiError.message as string || "Failed to load documents"
      
      if (apiError.statusCode === 401) {
        errorMessage = "Authentication required. Please login first."
      } else if (apiError.statusCode === 404) {
        errorMessage = "Documents API not found. Please ensure the backend server is running."
      } else if (apiError.statusCode === 0) {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      setError(errorMessage)
      console.error("Error loading documents:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Only load if no cached data
  useEffect(() => {
    const now = Date.now()
    if (!documentsCache || (now - documentsCache.timestamp) >= CACHE_DURATION) {
      loadDocuments()
    }
  }, [loadDocuments])

  const loadDocumentsByProject = useCallback(async (projectId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await documentsApi.getAll(projectId)
      return data
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message as string || "Failed to load documents")
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createDocument = useCallback(async (document: CreateDocumentDto) => {
    try {
      setError(null)
      const newDocument = await documentsApi.create(document)
      setDocuments((prev) => [...prev, newDocument])
      // Update cache
      if (documentsCache) {
        documentsCache.data = [...documentsCache.data, newDocument]
        documentsCache.timestamp = Date.now()
      }
      return newDocument
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to create document"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateDocument = useCallback(async (id: string, updates: UpdateDocumentDto) => {
    try {
      setError(null)
      const updated = await documentsApi.update(id, updates)
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)))
      // Update cache
      if (documentsCache) {
        documentsCache.data = documentsCache.data.map((d) => (d.id === id ? updated : d))
        documentsCache.timestamp = Date.now()
      }
      return updated
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to update document"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deleteDocument = useCallback(async (id: string) => {
    try {
      setError(null)
      await documentsApi.delete(id)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
      // Update cache
      if (documentsCache) {
        documentsCache.data = documentsCache.data.filter((d) => d.id !== id)
        documentsCache.timestamp = Date.now()
      }
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = apiError.message as string || "Failed to delete document"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    documents,
    loading,
    error,
    loadDocuments,
    loadDocumentsByProject,
    createDocument,
    updateDocument,
    deleteDocument,
  }
}

