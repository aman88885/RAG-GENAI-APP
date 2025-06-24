import React, { useState, useRef } from 'react';
import { FileText, User, Upload, File, X, CheckCircle, Loader } from 'lucide-react';

const Dashboard = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
        handleFileUpload(file);
      } else {
        alert('Please upload a PDF file only.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
        handleFileUpload(file);
      } else {
        alert('Please upload a PDF file only.');
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

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

    try {
      // Here you would implement the actual file upload to your backend
      // const formData = new FormData();
      // formData.append('pdf', file);
      // const response = await fetch('http://localhost:4000/api/v1/upload', {
      //   method: 'POST',
      //   body: formData,
      // });

      // Simulate upload completion
      setTimeout(() => {
        setUploadProgress(100);
        setIsUploading(false);
        setUploadComplete(true);
        clearInterval(progressInterval);
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      clearInterval(progressInterval);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-black">ChatDoc</span>
            </div>

            {/* Right Side - User Profile */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors duration-200">
                  <User className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {!showUpload ? (
          /* Welcome Section */
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-8">
              Welcome to ChatDoc
            </h1>
            
            <div className="mb-12">
              <button
                onClick={() => setShowUpload(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-3 mx-auto"
              >
                <Upload className="h-6 w-6" />
                <span>Upload Your PDF</span>
              </button>
            </div>

            {/* Optional: Recent Documents or Getting Started Tips */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold text-black mb-4">Getting Started</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Upload className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Upload any PDF document up to 100MB</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Ask questions in natural language</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700">Get instant, source-based answers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Upload Section */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <button
                onClick={() => setShowUpload(false)}
                className="text-blue-600 hover:text-blue-700 transition-colors duration-200 mb-6 inline-flex items-center space-x-2"
              >
                <span>← Back to Dashboard</span>
              </button>
              <h2 className="text-3xl font-bold text-black mb-4">Upload Your PDF</h2>
              <p className="text-gray-600">
                Drop your document below or click to browse and select a file
              </p>
            </div>

            {/* Upload Area */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              {!uploadedFile ? (
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
                      <p className="text-gray-500">
                        Supported file types: PDF (up to 100MB)
                      </p>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold">
                      Browse Files
                    </button>
                  </div>
                </div>
              ) : (
                /* File Preview */
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-red-100 p-3 rounded-lg">
                          <File className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{uploadedFile.name}</h3>
                          <p className="text-sm text-gray-500">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      {!isUploading && !uploadComplete && (
                        <button
                          onClick={removeFile}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {(isUploading || uploadComplete) && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {uploadComplete ? 'Upload Complete' : 'Uploading...'}
                          </span>
                          <span className="text-sm text-gray-500">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              uploadComplete ? 'bg-green-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Status Icons */}
                    {isUploading && (
                      <div className="flex items-center space-x-2 mt-4 text-blue-600">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Processing your document...</span>
                      </div>
                    )}

                    {uploadComplete && (
                      <div className="flex items-center space-x-2 mt-4 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Ready to chat with your document!</span>
                      </div>
                    )}
                  </div>

                  {uploadComplete && (
                    <div className="text-center">
                      <button className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-colors duration-200 font-semibold">
                        Start Asking Questions
                      </button>
                    </div>
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;