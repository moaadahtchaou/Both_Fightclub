import React, { useState, useRef, useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

interface MP3UploaderProps {
  className?: string;
}

const MP3Uploader: React.FC<MP3UploaderProps> = ({ className = '' }) => {
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

    setIsUploading(true);
    setUploadStatus('Uploading to Catbox...');
    setUploadedUrl('');

    try {
      const formData = new FormData();
      formData.append('fileToUpload', fileToUpload);
      formData.append('reqtype', 'fileupload');

      const response = await fetch(buildApiUrl(API_ENDPOINTS.UPLOAD), {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const url = await response.text();
        setUploadedUrl(url);
        setUploadStatus('File uploaded successfully!');
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
    <div className={`card ${className}`}>
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mr-4">
          <span className="text-2xl">📤</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">MP3 File Uploader</h3>
          <p className="text-gray-400">Upload MP3 files to Catbox for easy sharing</p>
        </div>
      </div>
      
      <form onSubmit={handleFileUpload} className="space-y-4" noValidate>
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">
            Select MP3 File
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
              className="w-full flex items-center justify-between pl-4 pr-1 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white cursor-pointer hover:bg-gray-600 transition-all"
            >
              <span className="truncate pr-2">
                {selectedFile ? selectedFile.name : 'No file chosen'}
              </span>
              <span className="px-4 py-2 text-sm font-semibold bg-primary-600 rounded-md hover:bg-primary-700">
                Browse
              </span>
            </label>
          </div>
          {selectedFile && (
            <p className="text-sm text-gray-400 mt-2">
              Size: ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            disabled={isUploading || !hasValidFile}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            onClick={handleFileUpload}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>Upload to Catbox</>
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
            className="btn-secondary px-6"
          >
            Clear
          </button>
        </div>
        
        {uploadStatus && (
          <div className={`p-4 rounded-lg ${
            uploadStatus.includes('Error') 
              ? 'bg-red-900/20 border border-red-700/30 text-red-400'
              : uploadStatus.includes('successfully')
              ? 'bg-green-900/20 border border-green-700/30 text-green-400'
              : 'bg-blue-900/20 border border-blue-700/30 text-blue-400'
          }`}>
            {uploadStatus}
          </div>
        )}
        
        {uploadedUrl && (
          <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
            <p className="text-green-400 font-semibold mb-2">File URL:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={uploadedUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(uploadedUrl)}
                className="px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </form>
      
      <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
        <h4 className="text-sm font-semibold text-primary-400 mb-2">Features:</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            Fast and secure file upload
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            Direct shareable links
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            No file size limits
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            Permanent hosting on Catbox
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MP3Uploader;