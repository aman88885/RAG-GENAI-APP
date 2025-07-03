import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, File, X, CheckCircle, Loader, AlertCircle, MessageCircle, Clock, RefreshCw, Download, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/UserProfile';

interface UploadedPDF {
  id: string;
  uuid: string;
  name: string;
  size: number;
  size_mb: string;
  page_count: number;
  total_chunks: number;
  successful_chunks: string | number;
  indexing_status: 'completed' | 'failed' | 'processing';
  indexed_at?: string;
  uploaded_at?: string;
  cloudinary_url?: string;
  storage_type?: string;
}

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadedPDF | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previousDocuments, setPreviousDocuments] = useState<UploadedPDF[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Load previous documents on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadPreviousDocuments();
    }
  }, [isAuthenticated]);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const loadPreviousDocuments = async () => {
    setLoadingDocs(true);
    try {
      const token = localStorage.getItem('chatdoc_token') || localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:4000/api/v1/pdf/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.pdfs) {
          setPreviousDocuments(data.pdfs);
        }
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Reset previous states
    setUploadResult(null);
    setUploadError(null);
    setUploadProgress(0);
    setIsProcessing(false);

    if (file.type !== 'application/pdf') {
      showToast('Please upload a PDF file only.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showToast('File size must be less than 10MB.', 'error');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    // Step 1: Start Upload
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setIsProcessing(false);

    try {
      const token = localStorage.getItem('chatdoc_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formData = new FormData();
      formData.append('pdf', selectedFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Step 1: Upload PDF to Cloudinary + Embedding
      const response = await fetch('http://localhost:4000/api/v1/pdf/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.pdf) {
          // Step 2: Start Processing Phase
          setIsProcessing(true);
          setUploadResult(data.pdf);
          
          // Check indexing status
          if (data.pdf.indexing_status === 'completed') {
            // Step 3: Success - Ready for Chat
            showToast('PDF uploaded to Cloudinary and embedded successfully!', 'success');
            
            // Auto-redirect to chat after 2-3 seconds
            setTimeout(() => {
              navigate(`/chat/${data.pdf.uuid}`);
            }, 2500);
          } else if (data.pdf.indexing_status === 'failed') {
            setUploadError('Failed to index PDF. Please try again.');
            showToast('Failed to index PDF. Please try again.', 'error');
            setIsProcessing(false);
          } else {
            // Still processing - show processing UI
            showToast('PDF uploaded to Cloudinary. Processing embeddings...', 'success');
            
            // Poll for completion (optional - you can implement this if needed)
            // For now, we'll show the processing state
          }
          
          // Refresh the documents list
          loadPreviousDocuments();
        } else {
          throw new Error(data.message || 'Upload failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      showToast('Upload failed. Please try again.', 'error');
      setIsProcessing(false);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadError(null);
    setUploadProgress(0);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const retryUpload = () => {
    setUploadError(null);
    setUploadResult(null);
    setIsProcessing(false);
    handleFileUpload();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadPDF = (cloudinaryUrl: string, fileName: string) => {
    // Open Cloudinary URL in new tab for download
    const link = document.createElement('a');
    link.href = cloudinaryUrl;
    link.target = '_blank';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Indexed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </span>
        );
      default:
        return null;
    }
  };

  const getStorageBadge = (storageType: string) => {
    if (storageType === 'cloudinary') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          ☁️ Cloudinary
        </span>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-black">ChatDoc</span>
            </div>
            <div className="flex items-center space-x-4">
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Welcome to ChatDoc{user ? `, ${user.fullName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-xl text-gray-600">
            Upload your PDF documents to Cloudinary and start intelligent conversations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Upload Section */}
          <div className="space-y-8">
            {/* Upload Guidelines */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
                <Upload className="h-6 w-6 mr-3 text-blue-600" />
                Upload Guidelines
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Only .pdf files are supported</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Maximum file size: 10MB</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Avoid scanned/image-only PDFs</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Content should be text-readable for accurate AI responses</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Files are securely stored in Cloudinary cloud storage</span>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-6">Upload PDF to Cloudinary</h2>
              
              {!selectedFile ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={openFileDialog}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-gray-700 mb-2">
                        Drag & drop or choose file to upload
                      </p>
                      <p className="text-gray-500 mb-2">
                        Supported: PDF files up to 10MB
                      </p>
                      <p className="text-sm text-blue-600 font-medium">
                        ☁️ Securely stored in Cloudinary
                      </p>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold">
                      Browse Files
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File Preview */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-red-100 p-3 rounded-lg">
                          <File className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{selectedFile.name}</h3>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      {!isUploading && !uploadResult && !isProcessing && (
                        <button
                          onClick={resetUpload}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {(isUploading || uploadResult || isProcessing) && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {isUploading ? 'Uploading to Cloudinary...' : 
                             isProcessing ? 'Processing Embeddings...' : 
                             'Upload Complete'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {isUploading ? `${uploadProgress}%` : 
                             isProcessing ? 'Processing...' : 
                             '100%'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isProcessing ? 'bg-yellow-500 animate-pulse' :
                              uploadResult ? 'bg-green-500' : 'bg-blue-600'
                            }`}
                            style={{ 
                              width: isProcessing ? '100%' : `${uploadProgress}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Status Messages */}
                    {isUploading && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Uploading your PDF to Cloudinary...</span>
                      </div>
                    )}

                    {isProcessing && (
                      <div className="flex items-center space-x-2 text-yellow-600">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Analyzing and storing your document in vector database...</span>
                      </div>
                    )}

                    {uploadResult && uploadResult.indexing_status === 'completed' && !isProcessing && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Your PDF has been successfully uploaded and embedded!</span>
                        </div>
                        
                        {/* Cloudinary Info */}
                        {uploadResult.cloudinary_url && (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-blue-700 font-medium">☁️ Stored in Cloudinary</span>
                                {getStorageBadge(uploadResult.storage_type || 'cloudinary')}
                              </div>
                              <button
                                onClick={() => handleDownloadPDF(uploadResult.cloudinary_url!, uploadResult.name)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download PDF</span>
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-3">
                          {uploadResult.cloudinary_url && (
                            <button
                              onClick={() => handleDownloadPDF(uploadResult.cloudinary_url!, uploadResult.name)}
                              className="flex-1 bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download PDF</span>
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/chat/${uploadResult.uuid}`)}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold flex items-center justify-center space-x-2"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>Chat Now</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{uploadError}</span>
                        </div>
                        <button
                          onClick={retryUpload}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Try Again</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  {!isUploading && !uploadResult && !uploadError && !isProcessing && (
                    <button
                      onClick={handleFileUpload}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold"
                    >
                      Upload to Cloudinary
                    </button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Right Column - Previous Documents */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-blue-600" />
                  Your Documents
                </h2>
                <button
                  onClick={loadPreviousDocuments}
                  className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>

              {loadingDocs ? (
                <div className="text-center py-8">
                  <Loader className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-500">Loading documents...</p>
                </div>
              ) : previousDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No documents uploaded yet</p>
                  <p className="text-sm text-gray-400">Upload your first PDF to get started</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {previousDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate mb-1">
                            {doc.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <span>{doc.size_mb} MB</span>
                            <span>{doc.page_count} pages</span>
                            <span>{doc.successful_chunks}/{doc.total_chunks} chunks</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusBadge(doc.indexing_status)}
                            {doc.storage_type && getStorageBadge(doc.storage_type)}
                            {doc.indexed_at && (
                              <span className="text-xs text-gray-400">
                                {new Date(doc.indexed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          {/* Cloudinary Download Link */}
                          {doc.cloudinary_url && (
                            <div className="flex items-center space-x-2 mt-2">
                              <button
                                onClick={() => handleDownloadPDF(doc.cloudinary_url!, doc.name)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>View in Cloudinary</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex flex-col space-y-2">
                          {doc.indexing_status === 'completed' ? (
                            <>
                              <button
                                onClick={() => navigate(`/chat/${doc.uuid}`)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center space-x-2"
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span>Chat</span>
                              </button>
                              {doc.cloudinary_url && (
                                <button
                                  onClick={() => handleDownloadPDF(doc.cloudinary_url!, doc.name)}
                                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium flex items-center space-x-2"
                                >
                                  <Download className="h-4 w-4" />
                                  <span>Download</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              disabled
                              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed font-medium"
                            >
                              Unavailable
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;