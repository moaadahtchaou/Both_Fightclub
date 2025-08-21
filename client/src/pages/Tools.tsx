import React, { useState, useRef, useEffect } from 'react';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

const Tools = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  
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

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setIsDownloading(true);
    setDownloadStatus('Processing your request...');

    try {
      // Make a direct request to the backend server to download the YouTube video as MP3
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.DOWNLOAD)}?url=${encodeURIComponent(youtubeUrl)}&type=audio`, {
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

  const tools = [
    {
      name: "YouTube MP3 Downloader",
      description: "Convert YouTube videos to high-quality MP3 files instantly",
      icon: "🎵",
      category: "Media",
      status: "Active",
      component: "downloader"
    },
    {
      name: "MP3 File Uploader",
      description: "Upload MP3 files to Catbox for easy sharing and storage",
      icon: "📤",
      category: "Media",
      status: "Active",
      component: "uploader"
    },
    {
      name: "Map Code Generator",
      description: "Generate custom map codes for Transformice",
      icon: "🗺️",
      category: "Gaming",
      status: "Coming Soon",
      component: null
    },
    {
      name: "Event Scheduler",
      description: "Schedule and manage tribe events efficiently",
      icon: "📅",
      category: "Management",
      status: "Coming Soon",
      component: null
    },
    {
      name: "Member Stats Tracker",
      description: "Track and analyze member performance statistics",
      icon: "📊",
      category: "Analytics",
      status: "Coming Soon",
      component: null
    },
    {
      name: "Discord Bot Commands",
      description: "Comprehensive list of available bot commands",
      icon: "🤖",
      category: "Discord",
      status: "Coming Soon",
      component: null
    },
    {
      name: "Tribe Logo Generator",
      description: "Create custom logos and banners for your tribe",
      icon: "🎨",
      category: "Design",
      status: "Coming Soon",
      component: null
    }
  ];

  const categories = [...new Set(tools.map(tool => tool.category))];

  const MP3Uploader = () => (
    <div className="card">
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

  const YouTubeDownloader = () => (
    <div className="card">
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

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title">Tribe Tools</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Exclusive tools and utilities designed to enhance your Fight Club 01 experience. 
            From media conversion to gaming utilities, we've got you covered.
          </p>
        </div>
        
        {/* Active Tools */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <span className="text-primary-400 mr-3">🛠️</span>
            Active Tools
          </h2>
          
          <div className="space-y-8">
            <YouTubeDownloader />
            <MP3Uploader />
          </div>
        </section>
        
        {/* All Tools Overview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <span className="text-primary-400 mr-3">🔧</span>
            All Tools
          </h2>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium">
              All Categories
            </button>
            {categories.map(category => (
              <button key={category} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                {category}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <div 
                key={tool.name}
                className="card group hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-xl">{tool.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary-300 transition-colors">
                        {tool.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-primary-900/30 text-primary-300 rounded-full border border-primary-700/30">
                        {tool.category}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tool.status === 'Active' 
                      ? 'bg-green-900/30 text-green-400 border border-green-700/30'
                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30'
                  }`}>
                    {tool.status}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mb-4">{tool.description}</p>
                
                <div className="flex gap-2">
                  {tool.status === 'Active' ? (
                    <button className="btn-primary flex-1 text-sm py-2">
                      Use Tool
                    </button>
                  ) : (
                    <button className="btn-secondary flex-1 text-sm py-2" disabled>
                      Coming Soon
                    </button>
                  )}
                  <button className="btn-secondary px-4 text-sm py-2">
                    Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Tool Requests */}
        <section className="mb-16">
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-primary-400 mr-3">💡</span>
              Request a Tool
            </h2>
            <p className="text-gray-400 mb-6">
              Have an idea for a tool that would benefit the tribe? Let us know and we'll consider adding it to our toolkit.
            </p>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tool Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter tool name"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                    <option value="" disabled hidden>Select category</option>
                    <option value="media">Media</option>
                    <option value="gaming">Gaming</option>
                    <option value="management">Management</option>
                    <option value="analytics">Analytics</option>
                    <option value="discord">Discord</option>
                    <option value="design">Design</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe what this tool should do and how it would help the tribe..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>
              
              <button type="submit" className="btn-primary">
                Submit Request
              </button>
            </form>
          </div>
        </section>
        
        {/* Development Roadmap */}
        <section className="mb-16">
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-primary-400 mr-3">🗺️</span>
              Development Roadmap
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="text-green-400 font-semibold">Q1 2024 - Completed</div>
                  <div className="text-gray-300">YouTube MP3 Downloader</div>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="text-blue-400 font-semibold">Q2 2024 - In Progress</div>
                  <div className="text-gray-300">Map Code Generator, Event Scheduler</div>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="text-yellow-400 font-semibold">Q3 2024 - Planned</div>
                  <div className="text-gray-300">Member Stats Tracker, Discord Bot Commands</div>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-900/20 border border-gray-700/30 rounded-lg">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="text-gray-400 font-semibold">Q4 2024 - Future</div>
                  <div className="text-gray-300">Tribe Logo Generator, Advanced Analytics</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="text-center py-12 border-t border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-4">Need Help?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            If you encounter any issues with our tools or have suggestions for improvements, 
            don't hesitate to reach out to our development team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="btn-primary">
              Contact Support
            </a>
            <a href="https://discord.gg/fightclub01" className="btn-secondary">
              Join Discord
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Tools;
