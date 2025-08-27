import React, { useState, useRef, useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  MusicalNoteIcon,
  FolderOpenIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

interface MP3UploaderProps {
  className?: string;
}

const MP3Uploader: React.FC<MP3UploaderProps> = ({ className = '' }) => {
  // Auth context
  const { user, isAuthenticated, refreshUser } = useAuth();
  
  // MP3 Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasValidFile, setHasValidFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('🔄 State changed - selectedFile:', selectedFile?.name, 'hasValidFile:', hasValidFile, 'isUploading:', isUploading);
  }, [selectedFile, hasValidFile, isUploading]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Upload clicked, selectedFile:', selectedFile); // Debug log
    
    // Get the current file from the input as a fallback
    const currentFile = fileInputRef.current?.files?.[0];
    const fileToUpload = selectedFile || currentFile;
    console.log('fileToUpload:', fileToUpload); // Debug log
    if (!fileToUpload) {
      setUploadStatus('Error: Please select a file.');
      return;
    }
    
    // Validate the file type again
    if (fileToUpload.type !== 'audio/mpeg' && !fileToUpload.name.toLowerCase().endsWith('.mp3')) {
      setUploadStatus('Error: Please select a valid MP3 file.');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      setUploadStatus('Error: Please log in to use this feature.');
      return;
    }

    // Check if user has enough credits
    if (user.credits < 1) {
      setUploadStatus('Error: Insufficient credits. You need at least 1 credit to upload.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading to Catbox...');
    setUploadedUrl('');

    try {
      const formData = new FormData();
      formData.append('fileToUpload', fileToUpload);
      formData.append('reqtype', 'fileupload');

      const authHeaders = getAuthHeaders();
      const response = await fetch(buildApiUrl(API_ENDPOINTS.UPLOAD), {
        method: 'POST',
        headers: {
          ...authHeaders,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      if (response.ok) {
        const url = await response.text();
        setUploadedUrl(url);
        setUploadStatus('File uploaded successfully!');
        
        // Refresh user data to update credits
        await refreshUser();
      } else {
        setUploadStatus('Error: Upload failed. Please try again.');
      }
    } catch (error) {
      setUploadStatus('Error: Network error. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== handleFileSelect called ===');
    const file = e.target.files?.[0];
    console.log('File object:', file);
    console.log('File name:', file?.name);
    console.log('File type:', file?.type);
    console.log('File size:', file?.size);
    
    // Clear previous status and URL
    setUploadStatus('');
    setUploadedUrl('');
    
    if (file) {
      const isValidType = file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3');
      console.log('Is valid MP3?', isValidType);
      
      if (isValidType) {
        console.log('✅ Valid MP3 file detected, updating states');
        setSelectedFile(file);
        setHasValidFile(true);
        console.log('States updated - selectedFile and hasValidFile set to true');
      } else {
        console.log('❌ Invalid file type detected');
        setUploadStatus('Error: Please select a valid MP3 file.');
        setSelectedFile(null);
        setHasValidFile(false);
        // Clear the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } else {
      console.log('❌ No file in event');
      setSelectedFile(null);
      setHasValidFile(false);
    }
    console.log('=== handleFileSelect finished ===');
  };

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl ${className}`}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl">
              <CloudArrowUpIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">MP3 File Uploader</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Upload MP3 files directly to Catbox for instant sharing and hosting
            </p>
            {/* Credits Display */}
            {isAuthenticated && user && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-400/30">
                  <SparklesIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">
                    Credits: {user.credits}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isUploading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
          }`}></div>
          <span className="text-sm text-gray-400">
            {isUploading ? 'Uploading' : 'Ready'}
          </span>
        </div>
      </div>
      
      <form onSubmit={handleFileUpload} className="space-y-6" noValidate>
        {/* File Upload Section */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
            <DocumentIcon className="w-4 h-4 text-blue-400" />
            <span>Select MP3 File</span>
          </label>
          <div className="relative">
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept=".mp3,audio/mpeg"
              onChange={handleFileSelect}
              className="sr-only"
            />
            <label
              htmlFor="file-upload"
              className={`group w-full px-6 py-12 border-2 border-dashed rounded-2xl transition-all duration-200 flex flex-col items-center justify-center space-y-4 cursor-pointer ${
                selectedFile 
                  ? 'border-blue-500/50 bg-blue-500/5 text-blue-300' 
                  : 'border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5 text-gray-400 hover:text-blue-300'
              }`}
            >
              <div className={`p-4 rounded-2xl transition-all duration-200 ${
                selectedFile 
                  ? 'bg-blue-500/20' 
                  : 'bg-white/5 group-hover:bg-blue-500/20'
              }`}>
                {selectedFile ? (
                  <MusicalNoteIcon className="w-12 h-12 text-blue-400" />
                ) : (
                  <FolderOpenIcon className="w-12 h-12 text-gray-400 group-hover:text-blue-400 transition-colors" />
                )}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold mb-1">
                  {selectedFile ? selectedFile.name : 'Click to select MP3 file'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedFile 
                    ? `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` 
                    : 'Drag and drop or click to browse your files'
                  }
                </p>
              </div>
            </label>
          </div>
          {selectedFile && (
            <div className="flex items-center space-x-2 text-xs text-green-400">
              <CheckCircleIcon className="w-4 h-4" />
              <span>MP3 file selected and ready for upload</span>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            disabled={isUploading || !hasValidFile}
            className="group relative flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            onClick={handleFileUpload}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Upload to Catbox</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setHasValidFile(false);
              setUploadStatus('');
              setUploadedUrl('');
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="group flex items-center justify-center space-x-3 px-6 py-4 bg-white/5 text-gray-400 rounded-xl font-semibold hover:bg-red-500/10 hover:text-red-400 border border-white/20 hover:border-red-500/30 transition-all duration-200"
          >
            <XMarkIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            <span>Clear</span>
          </button>
        </div>
        
        {uploadStatus && (
          <div className="mt-8">
            <div className={`relative p-6 rounded-2xl border backdrop-blur-sm ${
              uploadStatus.includes('Error') || uploadStatus.includes('Failed') 
                ? 'bg-red-500/10 border-red-500/30 text-red-200'
                : uploadStatus.includes('Success') || uploadStatus.includes('successfully')
                ? 'bg-green-500/10 border-green-500/30 text-green-200'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
            }`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {uploadStatus.includes('Error') || uploadStatus.includes('Failed') ? (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  ) : uploadStatus.includes('Success') || uploadStatus.includes('successfully') ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-relaxed">{uploadStatus}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {uploadedUrl && (
          <div className="mt-8">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-xl font-bold text-green-200">Upload Complete!</h4>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <LinkIcon className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">File URL</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-white/5 rounded-lg p-3 border border-white/10">
                    <a 
                      href={uploadedUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 text-sm font-mono break-all transition-colors"
                    >
                      {uploadedUrl}
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 flex-1"
                >
                  <LinkIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Open File</span>
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(uploadedUrl)}
                  className="group flex items-center justify-center space-x-3 px-6 py-3 bg-white/5 text-gray-300 rounded-xl font-semibold hover:bg-white/10 hover:text-white border border-white/20 transition-all duration-200 flex-1"
                >
                  <DocumentDuplicateIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Copy URL</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
      
      {/* Features Section */}
      <div className="mt-12">
        <div className="text-center mb-8">
          <h4 className="text-2xl font-bold text-white mb-2">Instant File Hosting</h4>
          <p className="text-gray-400">Upload your MP3 files and get shareable links in seconds</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <SparklesIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h5 className="text-lg font-bold text-white">Premium Features</h5>
            </div>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center space-x-3">
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>Direct upload to Catbox hosting service</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>Instant shareable links generation</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>No file size or upload limits</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>Fast and reliable cloud storage</span>
              </li>
            </ul>
          </div>
          
          <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                <ArrowPathIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h5 className="text-lg font-bold text-white">Simple Process</h5>
            </div>
            <ol className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">1</span>
                </div>
                <span>Select your MP3 file from device</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">2</span>
                </div>
                <span>Click "Upload to Catbox" button</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">3</span>
                </div>
                <span>Get instant shareable link</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">4</span>
                </div>
                <span>Share with anyone, anywhere!</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MP3Uploader;