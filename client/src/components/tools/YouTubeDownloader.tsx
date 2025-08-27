import React, { useState } from 'react';
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import { validateYouTubeUrl } from '../../utils/youtubeValidator';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowPathIcon,
  CloudArrowDownIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  SparklesIcon,
  PlayIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

interface YouTubeDownloaderProps {
  className?: string;
}

const YouTubeDownloader: React.FC<YouTubeDownloaderProps> = ({ className = '' }) => {
  // Auth context
  const { user, isAuthenticated, refreshUser } = useAuth();
  
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [urlValidationError, setUrlValidationError] = useState('');

  const handleDownload = async (e: React.FormEvent) => {
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
    
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      setDownloadStatus('Error: Please log in to use this feature.');
      return;
    }

    // Check if user has enough credits
    if (user.credits < 1) {
      setDownloadStatus('Error: Insufficient credits. You need at least 1 credit to download.');
      return;
    }
    
    setIsDownloading(true);
    setDownloadStatus('Processing your request...');

    try {
      // Make a direct request to the backend server to download the YouTube video as MP3 using ytmp3.as
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.YTMP3)}?url=${encodeURIComponent(youtubeUrl)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob data from the response
      const blob = await response.blob();
      
      // Debug: Log all response headers
      console.log('Response headers:');
      for (let [key, value] of response.headers.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      // Extract video title from response headers
      const videoTitle = response.headers.get('X-Video-Title') || `youtube-audio-${Date.now()}`;
      console.log('Extracted video title:', videoTitle);
      const filename = `${videoTitle}.mp3`;
      
      // Create a blob URL and trigger download programmatically
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename; // Use video title as filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
      
      setDownloadStatus('Download completed successfully!');
      
      // Refresh user data to update credits
      await refreshUser();
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('Error: Unable to process the video. Please check the URL and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl ${className}`}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl">
              <SpeakerWaveIcon className="w-8 h-8 text-red-400" />
            </div>
            <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">YouTube to MP3</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Convert and download YouTube videos as high-quality MP3 files
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
            isDownloading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
          }`}></div>
          <span className="text-sm text-gray-400">
            {isDownloading ? 'Processing' : 'Ready'}
          </span>
        </div>
      </div>
      
      <form onSubmit={handleDownload} className="space-y-6">
        {/* URL Input Section */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
            <LinkIcon className="w-4 h-4 text-red-400" />
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
                  : 'border-white/20 focus:ring-red-500/50 focus:border-red-500/50'
              }`}
              required
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <PlayIcon className="w-5 h-5 text-gray-400 group-focus-within:text-red-400 transition-colors" />
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
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="submit"
            disabled={isDownloading || !youtubeUrl.trim()}
            className="group relative flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CloudArrowDownIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Download MP3</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setYoutubeUrl('');
              setDownloadStatus('');
              setUrlValidationError('');
            }}
            className="group flex items-center justify-center space-x-3 px-6 py-4 bg-white/5 text-gray-400 rounded-xl font-semibold hover:bg-red-500/10 hover:text-red-400 border border-white/20 hover:border-red-500/30 transition-all duration-200"
          >
            <XMarkIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            <span>Clear</span>
          </button>
        </div>
        
        {downloadStatus && (
          <div className="mt-8">
            <div className={`relative p-6 rounded-2xl border backdrop-blur-sm ${
              downloadStatus.includes('Error') || downloadStatus.includes('Failed') 
                ? 'bg-red-500/10 border-red-500/30 text-red-200'
                : downloadStatus.includes('Success') || downloadStatus.includes('completed')
                ? 'bg-green-500/10 border-green-500/30 text-green-200'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
            }`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {downloadStatus.includes('Error') || downloadStatus.includes('Failed') ? (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  ) : downloadStatus.includes('Success') || downloadStatus.includes('completed') ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-relaxed">{downloadStatus}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
      
      {/* Features Section */}
      <div className="mt-12">
        <div className="text-center mb-8">
          <h4 className="text-2xl font-bold text-white mb-2">Premium MP3 Conversion</h4>
          <p className="text-gray-400">Experience the fastest and highest quality YouTube to MP3 conversion</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-colors">
                <SparklesIcon className="w-6 h-6 text-red-400" />
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
                <span>Lightning-fast processing speeds</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>No registration or sign-up required</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>Completely free to use forever</span>
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
                <span>Click "Download MP3" button</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-400">3</span>
                </div>
                <span>Wait for our servers to process</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-400">4</span>
                </div>
                <span>Download your high-quality MP3!</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeDownloader;