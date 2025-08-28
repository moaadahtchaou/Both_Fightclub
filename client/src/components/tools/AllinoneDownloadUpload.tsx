import React, { useState } from 'react';
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import { validateYouTubeUrl } from '../../utils/youtubeValidator';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowPathIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

interface AllinoneDownloadUploadProps {
  className?: string;
}

const AllinoneDownloadUpload: React.FC<AllinoneDownloadUploadProps> = ({ className = '' }) => {
  // Auth context
  const { user, isAuthenticated, refreshUser } = useAuth();
  
  // YouTube Download states
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [downloadMethod, setDownloadMethod] = useState('auto'); // 'auto', 'ezconv', 'ytmp3'
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [urlValidationError, setUrlValidationError] = useState('');

  
  // Upload states

  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  
  // Combined process state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');

  const handleDownloadAndUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    // Validate YouTube URL
    const validation = validateYouTubeUrl(youtubeUrl);
    if (!validation.isValid) {
      setUrlValidationError(validation.error || 'Invalid YouTube URL');
      return;
    }

    // Clear any previous validation errors
    setUrlValidationError('');
    setIsProcessing(true);
    setIsDownloading(true);
    setProcessStatus('🚀 Starting complete workflow...');
    setDownloadStatus('');
    setUploadStatus('');
    setUploadedUrl('');

    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        throw new Error('Please log in to use this feature');
      }

      // Check if user has enough credits
      if (user.credits < 1) {
        throw new Error('Insufficient credits. You need at least 1 credit to download.');
      }

      // Call the new all-in-one endpoint with authentication and method parameter
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.ALLINONE)}?url=${encodeURIComponent(youtubeUrl)}&method=${downloadMethod}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Store download method and format info
        
        
        if (result.isShared) {
          // Handle shared audio (duplicate detected)
          setDownloadStatus(`🔄 Duplicate detected - using existing audio! (Method: ${result.method || 'unknown'})`);
          setUploadStatus('✅ Audio shared with you successfully!');
          setUploadedUrl(result.catboxUrl);
          setProcessStatus(`📋 ${result.message || 'This audio already exists and has been shared with you.'}`);
        } else {
          // Handle new download
          setDownloadStatus(`✅ Download completed successfully! (Method: ${result.method || 'unknown'}, Format: ${result.format || 'unknown'})`);
          setUploadStatus('✅ File uploaded to Catbox successfully!');
          setUploadedUrl(result.catboxUrl);
          setProcessStatus('🎉 Process completed! Your file is ready to share.');
        }
        
        // Refresh user data to update credits (only if not shared)
        await refreshUser();
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
      } 
      else if (errorMessage.includes('credits')) {
        setDownloadStatus('❌ Error: Insufficient credits. Please add more credits to your account.');
        setProcessStatus('❌ Process failed. Please try again.');
      }
      else if (errorMessage.includes('download') || errorMessage.includes('YouTube')) {
        setDownloadStatus('❌ Error: Unable to download from YouTube. Please check the URL and try again.');
        setProcessStatus('❌ Download failed. Please try again.');
      } else {
        setDownloadStatus('❌ Error: Unable to process the video. Please check the URL and try again.');
        setProcessStatus('❌ Process failed. Please try again.');
      }
    } finally {
      setIsDownloading(false);
      setIsProcessing(false);
    }
  };



  const clearAll = () => {
    setYoutubeUrl('');
    setDownloadMethod('auto');
    setDownloadStatus('');
    setUploadStatus('');
    setUploadedUrl('');
    setProcessStatus('');
    setUrlValidationError('');
  };

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl ${className}`}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
              <ArrowPathIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">All-in-One Tool</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Download from YouTube and upload directly to Catbox in one seamless workflow
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
            isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
          }`}></div>
          <span className="text-sm text-gray-400">
            {isProcessing ? 'Processing' : 'Ready'}
          </span>
        </div>
      </div>
      
      <form className="space-y-6">
        {/* URL Input Section */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
            <LinkIcon className="w-4 h-4 text-purple-400" />
            <span>YouTube Video URL</span>
          </label>
          <div className="relative group">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => {
                setYoutubeUrl(e.target.value);
                // Clear validation error when user starts typing
                if (urlValidationError) {
                  setUrlValidationError('');
                }
              }}
              placeholder="Paste your YouTube video URL here..."
              className={`w-full px-6 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 pr-12 ${
                urlValidationError 
                  ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                  : 'border-white/20 focus:ring-purple-500/50 focus:border-purple-500/50'
              }`}
              required
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <PlayIcon className="w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            </div>
          </div>
          {urlValidationError && (
            <div className="flex items-center space-x-2 text-xs text-red-400">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>{urlValidationError}</span>
            </div>
          )}
          {youtubeUrl && !urlValidationError && validateYouTubeUrl(youtubeUrl).isValid && (
            <div className="flex items-center space-x-2 text-xs text-green-400">
              <CheckCircleIcon className="w-4 h-4" />
              <span>Valid YouTube URL detected</span>
            </div>
          )}
        </div>
        
        {/* Download Method Selection */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
            <ArrowPathIcon className="w-4 h-4 text-purple-400" />
            <span>Download Method</span>
          </label>
          <div className="relative">
            <select
              value={downloadMethod}
              onChange={(e) => setDownloadMethod(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="auto" className="bg-gray-800 text-white">Auto (Try EzConv first, fallback to Ytmp3)</option>
              <option value="ezconv" className="bg-gray-800 text-white">EzConv API (Fast & Reliable)</option>
              <option value="ytmp3" className="bg-gray-800 text-white">Ytmp3 Scraper (Traditional Method)</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div><strong>Auto:</strong> Intelligent method selection with automatic fallback</div>
            <div><strong>EzConv:</strong> Modern API with high success rate and quality</div>
            <div><strong>Ytmp3:</strong> Traditional scraping method as backup option</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleDownloadAndUpload}
            disabled={isProcessing || !youtubeUrl.trim()}
            className="group relative flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>{isDownloading ? 'Downloading...' : 'Uploading...'}</span>
              </>
            ) : (
              <>
                <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                <span>Download & Upload</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={clearAll}
            className="group flex items-center justify-center space-x-3 px-6 py-4 bg-white/5 text-gray-400 rounded-xl font-semibold hover:bg-red-500/10 hover:text-red-400 border border-white/20 hover:border-red-500/30 transition-all duration-200"
          >
            <XMarkIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            <span>Clear</span>
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
          <div className="mt-8">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-xl font-bold text-green-200">🎉 Your file is ready!</h4>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <LinkIcon className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Shareable URL</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-white/5 rounded-lg p-3 border border-white/10">
                    <span className="text-green-400 text-sm font-mono break-all">
                      /music {uploadedUrl}
                    </span>
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
                  onClick={() => navigator.clipboard.writeText("/music " +uploadedUrl)}
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
          <h4 className="text-2xl font-bold text-white mb-2">Why Choose Our Tool?</h4>
          <p className="text-gray-400">Experience the most efficient way to download and share audio content</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                <SparklesIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h5 className="text-lg font-bold text-white">Premium Features</h5>
            </div>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center space-x-3">
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>High-quality MP3 conversion up to 320kbps</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>Direct upload to Catbox hosting</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>Lightning-fast processing speeds</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>No file size or duration limits</span>
              </li>
            </ul>
          </div>
          
          <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <ArrowPathIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h5 className="text-lg font-bold text-white">Simple Process</h5>
            </div>
            <ol className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-400">1</span>
                </div>
                <span>Paste your YouTube video URL</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-400">2</span>
                </div>
                <span>Click "Download & Upload" button</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-400">3</span>
                </div>
                <span>Get your shareable Catbox link instantly</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-400">4</span>
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

export default AllinoneDownloadUpload;