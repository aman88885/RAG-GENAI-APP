import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, HardDrive, FileCheck, Cloud, Loader, AlertCircle, ExternalLink } from 'lucide-react';
const apiUrl = import.meta.env.VITE_BACKEND_API;
interface DocumentInfo {
  uuid: string;
  name: string;
  size_mb: string;
  page_count: number;
  indexing_status: string;
  cloudinary_url?: string;
  storage_type?: string;
  created_at: string;
}

interface DocumentInfoCardProps {
  uuid: string;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentInfoCard: React.FC<DocumentInfoCardProps> = ({ uuid, isOpen, onClose }) => {
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && uuid) {
      fetchDocumentInfo();
    }
  }, [isOpen, uuid]);

  const fetchDocumentInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('chatdoc_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${apiUrl}/api/v1/pdf/info/${uuid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.pdf) {
          setDocumentInfo(data.pdf);
        } else {
          throw new Error(data.message || 'Failed to fetch document info');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch document info');
      }
    } catch (error) {
      console.error('Failed to fetch document info:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch document info');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FileCheck className="h-4 w-4 mr-1" />
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-4 w-4 mr-1" />
            Failed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Loader className="h-4 w-4 mr-1 animate-spin" />
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const getStorageBadge = (storageType: string) => {
    if (storageType === 'cloudinary') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <Cloud className="h-4 w-4 mr-1" />
          Cloudinary
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        <HardDrive className="h-4 w-4 mr-1" />
        Local
      </span>
    );
  };

  const handleCloudinaryLink = () => {
    if (documentInfo?.cloudinary_url) {
      window.open(documentInfo.cloudinary_url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Document Information</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading document information...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Information</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchDocumentInfo}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Document Info */}
          {documentInfo && !isLoading && !error && (
            <div className="space-y-6">
              {/* Document Header */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 p-4 rounded-xl">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{documentInfo.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {getStatusBadge(documentInfo.indexing_status)}
                      {documentInfo.storage_type && getStorageBadge(documentInfo.storage_type)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">File Size</span>
                      <span className="text-gray-900 font-semibold">{documentInfo.size_mb} MB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Page Count</span>
                      <span className="text-gray-900 font-semibold">{documentInfo.page_count} pages</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Document ID</span>
                      <span className="text-gray-700 font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                        {documentInfo.uuid.split('-')[0]}...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upload Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Upload Details</h4>
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-600 font-medium block mb-1">Upload Date</span>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-900">{formatDate(documentInfo.created_at)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium block mb-1">Storage Location</span>
                      <div className="flex items-center space-x-2">
                        {documentInfo.storage_type === 'cloudinary' ? (
                          <Cloud className="h-4 w-4 text-blue-500" />
                        ) : (
                          <HardDrive className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-gray-900 capitalize">
                          {documentInfo.storage_type || 'Local'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloudinary Information */}
              {documentInfo.cloudinary_url && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <Cloud className="h-5 w-5 mr-2" />
                    Cloudinary Storage
                  </h4>
                  <div className="space-y-3">
                    <p className="text-blue-700">
                      This document is securely stored in Cloudinary cloud storage and can be accessed directly.
                    </p>
                    <button
                      onClick={handleCloudinaryLink}
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View in Cloudinary</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{documentInfo.size_mb}</div>
                    <div className="text-gray-600">MB Size</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{documentInfo.page_count}</div>
                    <div className="text-gray-600">Pages</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {documentInfo.indexing_status === 'completed' ? '✓' : '⏳'}
                    </div>
                    <div className="text-gray-600">Status</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentInfoCard;