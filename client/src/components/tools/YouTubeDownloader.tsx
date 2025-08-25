import React, { useState } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

interface YouTubeDownloaderProps {
  className?: string;
}

const YouTubeDownloader: React.FC<YouTubeDownloaderProps> = ({ className = '' }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setIsDownloading(true);
    setDownloadStatus('Processing your request...');

    try {
      // Make a direct request to the backend server to download the YouTube video as MP3 using ytmp3.as
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.YTMP3)}?url=${encodeURIComponent(youtubeUrl)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('Error: Unable to process the video. Please check the URL and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center mr-4">
          <span className="text-2xl">🎵</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">YouTube MP3 Downloader</h3>
          <p className="text-gray-400">Convert YouTube videos to high-quality MP3 files</p>
        </div>
      </div>
      
      <form onSubmit={handleDownload} className="space-y-4">
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
            type="submit"
            disabled={isDownloading || !youtubeUrl.trim()}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>Download MP3</>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setYoutubeUrl('');
              setDownloadStatus('');
            }}
            className="btn-secondary px-6"
          >
            Clear
          </button>
        </div>
        
        {downloadStatus && (
          <div className={`p-4 rounded-lg ${
            downloadStatus.includes('Error') 
              ? 'bg-red-900/20 border border-red-700/30 text-red-400'
              : downloadStatus.includes('ready')
              ? 'bg-green-900/20 border border-green-700/30 text-green-400'
              : 'bg-blue-900/20 border border-blue-700/30 text-blue-400'
          }`}>
            {downloadStatus}
          </div>
        )}
      </form>
      
      <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
        <h4 className="text-sm font-semibold text-primary-400 mb-2">Features:</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            High-quality MP3 conversion (320kbps)
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            Fast processing and download
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            No registration required
          </li>
          <li className="flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            Supports all YouTube video lengths
          </li>
        </ul>
      </div>
    </div>
  );
};

export default YouTubeDownloader;