import React, { useState } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

interface AllinoneDownloadUploadProps {
  className?: string;
}

const AllinoneDownloadUpload: React.FC<AllinoneDownloadUploadProps> = ({ className = '' }) => {
  // YouTube Download states
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');

  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  
  // Combined process state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');

  const handleDownloadAndUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setIsProcessing(true);
    setIsDownloading(true);
    setProcessStatus('🚀 Starting complete workflow...');
    setDownloadStatus('');
    setUploadStatus('');
    setUploadedUrl('');

    try {
      // Call the new all-in-one endpoint
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.ALLINONE)}?url=${encodeURIComponent(youtubeUrl)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update status messages
        setDownloadStatus('✅ Download completed successfully!');
        setUploadStatus('✅ File uploaded to Catbox successfully!');
        setUploadedUrl(result.catboxUrl);
        setProcessStatus('🎉 Process completed! Your file is ready to share.');
      } else {
        throw new Error(result.error || 'Process failed');
      }
      
    } catch (error) {
      console.error('Process error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        setProcessStatus('⏱️ Process timed out. Please try again with a shorter video.');
      } else if (errorMessage.includes('upload') || errorMessage.includes('Catbox')) {
        setDownloadStatus('✅ Download completed successfully!');
        setUploadStatus('❌ Error: Upload to Catbox failed. Please try again.');
        setProcessStatus('❌ Upload failed. Please try again.');
      } else if (errorMessage.includes('download') || errorMessage.includes('YouTube')) {
        setDownloadStatus('❌ Error: Unable to download from YouTube. Please check the URL and try again.');
        setProcessStatus('❌ Download failed. Please try again.');
      } else {
        setDownloadStatus('❌ Error: Unable to process the video. Please check the URL and try again.');
        setProcessStatus('❌ Process failed. Please try again.');
      }
    } finally {
      setIsDownloading(false);
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleDownloadOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setIsDownloading(true);
    setDownloadStatus('Processing your request...');

    try {
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.YTMP3)}?url=${encodeURIComponent(youtubeUrl)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const videoTitle = response.headers.get('X-Video-Title') || `youtube-audio-${Date.now()}`;
      const filename = `${videoTitle}.mp3`;
      
      // Create a blob URL and trigger download
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      setDownloadStatus('✅ Download completed successfully!');
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('❌ Error: Unable to process the video. Please check the URL and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const clearAll = () => {
    setYoutubeUrl('');
    setDownloadStatus('');
    setUploadStatus('');
    setUploadedUrl('');
    setProcessStatus('');

  };

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mr-4">
          <span className="text-2xl">🔄</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">All-in-One: Download & Upload</h3>
          <p className="text-gray-400">Download from YouTube and upload directly to Catbox</p>
        </div>
      </div>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTube Video URL
          </label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            required
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={handleDownloadAndUpload}
            disabled={isProcessing || !youtubeUrl.trim()}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isDownloading ? 'Downloading...' : 'Uploading...'}
              </>
            ) : (
              <>🔄 Download & Upload</>
            )}
          </button>
          <button
            type="button"
            onClick={handleDownloadOnly}
            disabled={isDownloading || !youtubeUrl.trim()}
            className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isDownloading && !isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>📥 Download Only</>
            )}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="btn-secondary px-6"
          >
            Clear
          </button>
        </div>
        
        {/* Process Status */}
        {processStatus && (
          <div className={`p-4 rounded-lg ${
            processStatus.includes('❌') 
              ? 'bg-red-900/20 border border-red-700/30 text-red-400'
              : processStatus.includes('🎉')
              ? 'bg-green-900/20 border border-green-700/30 text-green-400'
              : 'bg-blue-900/20 border border-blue-700/30 text-blue-400'
          }`}>
            <div className="font-semibold mb-2">Process Status:</div>
            {processStatus}
          </div>
        )}
        
        {/* Individual Status Messages */}
        <div className="space-y-3">
          {downloadStatus && (
            <div className={`p-3 rounded-lg text-sm ${
              downloadStatus.includes('❌') 
                ? 'bg-red-900/20 border border-red-700/30 text-red-400'
                : downloadStatus.includes('✅')
                ? 'bg-green-900/20 border border-green-700/30 text-green-400'
                : 'bg-blue-900/20 border border-blue-700/30 text-blue-400'
            }`}>
              <strong>Download:</strong> {downloadStatus}
            </div>
          )}
          
          {uploadStatus && (
            <div className={`p-3 rounded-lg text-sm ${
              uploadStatus.includes('❌') 
                ? 'bg-red-900/20 border border-red-700/30 text-red-400'
                : uploadStatus.includes('✅')
                ? 'bg-green-900/20 border border-green-700/30 text-green-400'
                : 'bg-blue-900/20 border border-blue-700/30 text-blue-400'
            }`}>
              <strong>Upload:</strong> {uploadStatus}
            </div>
          )}
        </div>
        
        {/* Upload URL Result */}
        {uploadedUrl && (
          <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
            <p className="text-green-400 font-semibold mb-2">🎉 Your file is ready! Share this URL:</p>
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
        <h4 className="text-sm font-semibold text-primary-400 mb-2">All-in-One Features:</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            One-click download and upload process
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            High-quality MP3 conversion (320kbps)
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            Direct shareable links via Catbox
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            Option for download-only if preferred
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            Real-time process status updates
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AllinoneDownloadUpload;