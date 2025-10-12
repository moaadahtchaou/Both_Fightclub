import React, { useState } from 'react';
import { API_ENDPOINTS, buildApiUrl, getAuthHeaders } from '../../config/api';
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
  CloudArrowDownIcon,
} from '@heroicons/react/24/outline';

interface CnvMp3ToolProps {
  className?: string;
}

const CnvMp3Tool: React.FC<CnvMp3ToolProps> = ({ className = '' }) => {
  // Auth context
  const { user, isAuthenticated, refreshUser } = useAuth();
  
  // States
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [urlValidationError, setUrlValidationError] = useState('');
  const [downloadedUrl, setDownloadedUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  const handleCnvMp3Process = async (e: React.FormEvent) => {
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
    setProcessStatus('🚀 Starting download...');
    setDownloadedUrl('');
    setVideoTitle('');

    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        throw new Error('Please log in to use this feature');
      }

      // Check if user has enough credits
      if (user.credits < 1) {
        throw new Error('Insufficient credits. You need at least 1 credit to download.');
      }

      setProcessStatus('🔄 Processing with API...');

      // Call the cnvmp3 endpoint
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.CNVMP3)}?url=${encodeURIComponent(youtubeUrl)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setProcessStatus('🎉 download completed successfully!');
        setDownloadedUrl(result.data.audioUrl);
        setVideoTitle(result.data.title);
        
        // Refresh user data to update credits
        await refreshUser();
      } else {
        throw new Error(result.error || 'cnvmp3 process failed');
      }
      
    } catch (error) {
      console.error('cnvmp3 process error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        setProcessStatus('⏱️ Process timed out. Please try again with a shorter video.');
      } else if (errorMessage.includes('credits')) {
        setProcessStatus('❌ Insufficient credits. Please add more credits to your account.');
      } else if (errorMessage.includes('Invalid YouTube URL')) {
        setProcessStatus('❌ Invalid YouTube URL. Please check the URL and try again.');
      } else {
        setProcessStatus('❌ cnvmp3 process failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const clearAll = () => {
    setYoutubeUrl('');
    setProcessStatus('');
    setUrlValidationError('');
    setDownloadedUrl('');
    setVideoTitle('');
  };

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl ${className}`}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl">
              <CloudArrowDownIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">fk u freexx</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Download YouTube videos as MP3 using API
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
      
      <form onSubmit={handleCnvMp3Process} className="space-y-6">
        {/* URL Input Section */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
            <LinkIcon className="w-4 h-4 text-blue-400" />
            <span>YouTube Video URL</span>
          </label>
          <div className="relative group">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 group-hover:border-white/20"
              disabled={isProcessing}
            />
            {youtubeUrl && (
              <button
                type="button"
                onClick={() => setYoutubeUrl('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
          {urlValidationError && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>{urlValidationError}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={!youtubeUrl.trim() || isProcessing}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isProcessing ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CloudArrowDownIcon className="w-5 h-5" />
                <span>Download with Tool</span>
              </>
            )}
          </button>

          {(processStatus || downloadedUrl) && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl transition-all duration-300"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </form>

      {/* Status Section */}
      {processStatus && (
        <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {processStatus.includes('❌') ? (
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              ) : processStatus.includes('✅') || processStatus.includes('🎉') ? (
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              ) : (
                <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{processStatus}</p>
              {videoTitle && (
                <p className="text-gray-400 text-sm mt-1">Title: {videoTitle}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Download Result Section */}
      {downloadedUrl && (
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
                    /music {downloadedUrl}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={downloadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 flex-1"
              >
                <LinkIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Open File</span>
              </a>
              <button
                onClick={() => copyToClipboard("/music " + downloadedUrl)}
                className="group flex items-center justify-center space-x-3 px-6 py-3 bg-white/5 text-gray-300 rounded-xl font-semibold hover:bg-white/10 hover:text-white border border-white/20 transition-all duration-200 flex-1"
              >
                <DocumentDuplicateIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Copy URL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Warning */}
      {!isAuthenticated && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-300 text-sm">
              Please log in to use the tool.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CnvMp3Tool;