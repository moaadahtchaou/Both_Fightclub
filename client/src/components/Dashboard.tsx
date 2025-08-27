import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl, getAuthHeaders } from '../config/api';
import { 
  SpeakerWaveIcon,
  MusicalNoteIcon,
  LinkIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface AudioFile {
  _id: string;
  user: {
    _id: string;
    username: string;
  };
  originalName: string;
  source: 'youtube' | 'direct_upload' | 'url_import' | 'other';
  sourceUrl?: string;
  uploadUrl: string;
  ipAddress: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}


const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'public' | 'myAudio'>('public');

  const [copiedUrls, setCopiedUrls] = useState<Set<string>>(new Set());
  
  // New state for AudioFile interface
  const [publicAudioFiles, setPublicAudioFiles] = useState<AudioFile[]>([]);
  const [userAudioFiles, setUserAudioFiles] = useState<AudioFile[]>([]);
  

  
  // Form and UI state - removed add/edit functionality
  
  // Filter and sort state
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'originalName' | 'source'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch public audio files from MongoDB API
  const fetchPublicAudioFiles = async () => {
    try {
      const response = await fetch(buildApiUrl('/audio/public'), {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: AudioFile[] = await response.json();
      
      // Validate data structure
      const validatedData = data.filter(file => 
        file._id && 
        file.originalName && 
        file.source && 
        file.uploadUrl &&
        typeof file.isPublic === 'boolean'
      );
      
      setPublicAudioFiles(validatedData);
      

      
    } catch (err) {
      console.error('Error fetching public audio files:', err);
      setError('Failed to load public audio files. Please check your connection and try again.');
      // Clear data on error
      setPublicAudioFiles([]);
    }
  };

  // Fetch user's own audio files from MongoDB API
  const fetchUserAudioFiles = async () => {
    try {
      const response = await fetch(buildApiUrl('/audio/user'), {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: AudioFile[] = await response.json();
      
      // Validate data structure
      const validatedData = data.filter(file => 
        file._id && 
        file.originalName && 
        file.source && 
        file.uploadUrl &&
        typeof file.isPublic === 'boolean'
      );
      
      setUserAudioFiles(validatedData);
      
      
    } catch (err) {
      console.error('Error fetching user audio files:', err);
      setError('Failed to load your audio files. Please check your connection and try again.');
      // Clear data on error
      setUserAudioFiles([]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPublicAudioFiles(), fetchUserAudioFiles()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Utility functions for filtering and sorting
  const getFilteredAndSortedAudioFiles = (files: AudioFile[]) => {
    let filtered = files;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by source
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(file => file.source === sourceFilter);
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(file => 
        selectedTags.some(tag => file.tags.includes(tag))
      );
    }

    // Sort files
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'originalName':
          comparison = a.originalName.localeCompare(b.originalName);
          break;
        case 'source':
          comparison = a.source.localeCompare(b.source);
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  // Get all unique tags from audio files
  const getAllTags = () => {
    const allTags = new Set<string>();
    [...publicAudioFiles, ...userAudioFiles].forEach(file => {
      file.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get source icon and color
  const getSourceInfo = (source: string) => {
    switch (source) {
      case 'youtube':
        return { icon: '🎥', color: 'text-red-400', bg: 'bg-red-900/20' };
      case 'direct_upload':
        return { icon: '📁', color: 'text-blue-400', bg: 'bg-blue-900/20' };
      case 'url_import':
        return { icon: '🔗', color: 'text-green-400', bg: 'bg-green-900/20' };
      case 'other':
      default:
        return { icon: '📄', color: 'text-gray-400', bg: 'bg-gray-900/20' };
    }
  };



  // Generate Transformice-compatible URL
  const generateTransformiceUrl = (uploadUrl: string): string => {
    // Extract the Catbox URL from the upload URL
    // Assuming uploadUrl is already a Catbox URL or contains one
    const catboxUrl = uploadUrl.includes('catbox.moe') ? uploadUrl : uploadUrl;
    return `/music ${catboxUrl}`;
  };

  // Clean YouTube URL by removing query parameters after video ID
  const cleanYouTubeUrl = (url: string): string => {
    if (!url.includes('youtube.com/watch?v=') && !url.includes('youtu.be/')) {
      return url;
    }
    
    // Extract video ID from YouTube URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch) {
      return `https://www.youtube.com/watch?v=${videoIdMatch[1]}`;
    }
    
    return url;
  };

  // Copy URL to clipboard
  const copyToClipboard = async (url: string, audioId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrls(prev => new Set([...prev, audioId]));
      // Remove the copied state after 2 seconds
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(audioId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUrls(prev => new Set([...prev, audioId]));
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(audioId);
          return newSet;
        });
      }, 2000);
    }
  };

  const togglePublicStatus = async (audioId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(buildApiUrl(`/audio/${audioId}/toggle-public`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle public status');
      }

      const result = await response.json();
      
      // Update the local state
      setUserAudioFiles(prev => 
        prev.map(audio => 
          audio._id === audioId 
            ? { ...audio, isPublic: !currentStatus }
            : audio
        )
      );

      // Also update public audio files if the audio is now public
      if (!currentStatus) {
        // Audio is now public, add it to public list
        fetchPublicAudioFiles();
      } else {
        // Audio is now private, remove it from public list
        setPublicAudioFiles(prev => prev.filter(audio => audio._id !== audioId));
      }

      console.log(result.message);
    } catch (error) {
      console.error('Error toggling public status:', error);
      alert('Failed to toggle public status. Please try again.');
    }
  };

  // Audio creation is handled by the allinone route

  // Legacy function for backward compatibility - removed add functionality

 

  // Audio deletion is not available in this interface

  // Audio editing is not available in this interface

  // Legacy functions for backward compatibility - removed delete functionality

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading audio files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Transformice Music Dashboard</h1>
              <p className="text-gray-400">Get Transformice-compatible URLs for your audio files - click to copy!</p>
              
              {/* Usage Instructions */}
              <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 text-blue-300 rounded-lg">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">How to use in Transformice:</h3>
                    <p className="text-sm text-blue-200">
                      Copy any URL below and paste it directly into Transformice chat. The URLs are formatted as "/music" + your audio file URL for instant playback in-game.
                    </p>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                  {error}
                </div>
              )}
            </div>
            {user && (
              <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                <SparklesIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">{user.credits} Credits</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('public')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'public'
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <LinkIcon className="w-4 h-4" />
                  <span>Public Transformice URLs ({publicAudioFiles.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('myAudio')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'myAudio'
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MusicalNoteIcon className="w-4 h-4" />
                  <span>My Transformice URLs ({userAudioFiles.length})</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="mb-6 bg-gray-800/30 p-4 rounded-lg border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, user, or tags..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Sources</option>
                <option value="youtube">🎥 YouTube</option>
                <option value="direct_upload">📁 Direct Upload</option>
                <option value="url_import">🔗 URL Import</option>
                <option value="other">📄 Other</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'originalName' | 'source')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="originalName">Name</option>
                <option value="source">Source</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Tags Filter */}
          {getAllTags().length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Tags</label>
              <div className="flex flex-wrap gap-2">
                {getAllTags().map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Public Audio Files Tab */}
        {activeTab === 'public' && (
          <div className="space-y-6">
            {/* Add New Audio Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Public Transformice URLs</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchPublicAudioFiles().finally(() => setLoading(false));
                  }}
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                  title="Refresh"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
                {/* Audio creation is now handled by the allinone route */}
              </div>
            </div>

            {/* Audio creation/editing form removed - now handled by allinone route */}

            {/* Public Audio Files List */}
            <div className="grid gap-4">
              {getFilteredAndSortedAudioFiles(publicAudioFiles).length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-800/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No public audio files yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto text-sm">Audio files are managed through the conversion tools. Upload and share your music to see it here.</p>
                </div>
              ) : (
                getFilteredAndSortedAudioFiles(publicAudioFiles).map((audioFile) => {
                  const sourceInfo = getSourceInfo(audioFile.source);
                  return (
                    <div key={audioFile._id} className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-12 h-12 ${sourceInfo.bg} rounded-xl flex items-center justify-center flex-shrink-0 text-2xl shadow-md`}>
                            {sourceInfo.icon}
                          </div>
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <h3 className="text-white font-bold text-lg leading-tight">{audioFile.originalName}</h3>
                                <span className={`px-3 py-1.5 text-xs rounded-full ${sourceInfo.bg} ${sourceInfo.color} font-semibold uppercase tracking-wide`}>
                                  {audioFile.source.replace('_', ' ')}
                                </span>
                                {audioFile.isPublic && (
                                  <span className="px-3 py-1.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                                    PUBLIC
                                  </span>
                                )}
                              </div>
                              
                              {audioFile.user && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-5 h-5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">{(audioFile.user.username || 'A')[0].toUpperCase()}</span>
                                  </div>
                                  <span className="text-gray-300 text-sm font-medium">{audioFile.user.username || 'Anonymous'}</span>
                                </div>
                              )}
                            </div>
                            
                            {audioFile.sourceUrl && (
                              <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/50">
                                <p className="text-gray-400 text-xs font-medium mb-1">🔗 Original Source</p>
                                <a href={audioFile.sourceUrl} target="_blank" rel="noopener noreferrer" 
                                   className="text-primary-400 hover:text-primary-300 transition-colors text-sm break-all">
                                  {cleanYouTubeUrl(audioFile.sourceUrl)}
                                </a>
                              </div>
                            )}
                            
                            {audioFile.uploadUrl && (
                              <button
                                onClick={() => copyToClipboard(generateTransformiceUrl(audioFile.uploadUrl), audioFile._id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                  copiedUrls.has(audioFile._id)
                                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-emerald-500/40 shadow-md shadow-emerald-500/25'
                                    : 'bg-gradient-to-r from-primary-500/10 to-primary-600/10 border-primary-500/20 hover:from-primary-500/15 hover:to-primary-600/15 hover:border-primary-500/30'
                                }`}
                                title="Click to copy Transformice URL"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <p className="text-primary-300 text-sm font-semibold flex items-center space-x-1">
                                      <span>🎮</span>
                                      <span>Transformice URL</span>
                                    </p>
                                    <div className="text-primary-200 text-xs bg-gray-900/50 px-2 py-1 rounded break-all font-mono">
                                      {generateTransformiceUrl(audioFile.uploadUrl)}
                                    </div>
                                  </div>
                                  <div className={`ml-3 px-3 py-2 rounded-lg text-sm font-medium ${
                                    copiedUrls.has(audioFile._id)
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-primary-600 text-white'
                                  }`}>
                                    {copiedUrls.has(audioFile._id) ? (
                                      <div className="flex items-center space-x-1">
                                        <CheckIcon className="w-3 h-3" />
                                        <span>Copied!</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-1">
                                        <ClipboardDocumentIcon className="w-3 h-3" />
                                        <span>Copy</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            )}
                            
                            {audioFile.tags && audioFile.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {audioFile.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-700/40 text-gray-300 text-xs rounded-full border border-gray-600/50">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-400 pt-1 border-t border-gray-700/50">
                              <div className="flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                                <span>Created {formatDate(audioFile.createdAt)}</span>
                              </div>
                              {audioFile.updatedAt !== audioFile.createdAt && (
                                <div className="flex items-center space-x-1">
                                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                                  <span>Updated {formatDate(audioFile.updatedAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* My Audio Files Tab */}
        {activeTab === 'myAudio' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">My Transformice URLs</h2>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-400">
                  {userAudioFiles.length} file{userAudioFiles.length !== 1 ? 's' : ''}
                </div>
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchUserAudioFiles().finally(() => setLoading(false));
                  }}
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                  title="Refresh"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
                {/* Audio creation is now handled by the allinone route */}
              </div>
            </div>

            {/* User Audio Files List */}
            <div className="grid gap-4">
              {getFilteredAndSortedAudioFiles(userAudioFiles).length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-800/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <SpeakerWaveIcon className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No audio files yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto text-sm">Upload some audio files using our tools to see them here. Your personal music library awaits!</p>
                </div>
              ) : (
                getFilteredAndSortedAudioFiles(userAudioFiles).map((audioFile) => {
                  const sourceInfo = getSourceInfo(audioFile.source);
                  return (
                    <div key={audioFile._id} className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-12 h-12 ${sourceInfo.bg} rounded-xl flex items-center justify-center flex-shrink-0 text-2xl shadow-md`}>
                            {sourceInfo.icon}
                          </div>
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <h3 className="text-white font-bold text-lg leading-tight">{audioFile.originalName}</h3>
                                <span className={`px-3 py-1.5 text-xs rounded-full ${sourceInfo.bg} ${sourceInfo.color} font-semibold uppercase tracking-wide`}>
                                  {audioFile.source.replace('_', ' ')}
                                </span>
                                {audioFile.isPublic ? (
                                  <span className="px-3 py-1.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                                    PUBLIC
                                  </span>
                                ) : (
                                  <span className="px-3 py-1.5 text-xs rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                                    PRIVATE
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {audioFile.sourceUrl && (
                              <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/50">
                                <p className="text-gray-400 text-xs font-medium mb-1">🔗 Original Source</p>
                                <a href={audioFile.sourceUrl} target="_blank" rel="noopener noreferrer" 
                                   className="text-primary-400 hover:text-primary-300 transition-colors text-sm break-all">
                                  {cleanYouTubeUrl(audioFile.sourceUrl)}
                                </a>
                              </div>
                            )}
                            
                            {audioFile.uploadUrl && (
                              <>
                                
                                <button
                                  onClick={() => copyToClipboard(generateTransformiceUrl(audioFile.uploadUrl), audioFile._id)}
                                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                    copiedUrls.has(audioFile._id)
                                      ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-emerald-500/40 shadow-md shadow-emerald-500/25'
                                      : 'bg-gradient-to-r from-primary-500/10 to-primary-600/10 border-primary-500/20 hover:from-primary-500/15 hover:to-primary-600/15 hover:border-primary-500/30'
                                  }`}
                                  title="Click to copy Transformice URL"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <p className="text-primary-300 text-sm font-semibold flex items-center space-x-1">
                                        <span>🎮</span>
                                        <span>Transformice URL</span>
                                      </p>
                                      <div className="text-primary-200 text-xs bg-gray-900/50 px-2 py-1 rounded break-all font-mono">
                                        {generateTransformiceUrl(audioFile.uploadUrl)}
                                      </div>
                                    </div>
                                    <div className={`ml-3 px-3 py-2 rounded-lg text-sm font-medium ${
                                      copiedUrls.has(audioFile._id)
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-primary-600 text-white'
                                    }`}>
                                      {copiedUrls.has(audioFile._id) ? (
                                        <div className="flex items-center space-x-1">
                                          <CheckIcon className="w-3 h-3" />
                                          <span>Copied!</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center space-x-1">
                                          <ClipboardDocumentIcon className="w-3 h-3" />
                                          <span>Copy</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </>
                            )}
                            
                            {audioFile.tags && audioFile.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {audioFile.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-700/40 text-gray-300 text-xs rounded-full border border-gray-600/50">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-400 pt-1 border-t border-gray-700/50">
                              <div className="flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                                <span>Created {formatDate(audioFile.createdAt)}</span>
                              </div>
                              {audioFile.updatedAt !== audioFile.createdAt && (
                                <div className="flex items-center space-x-1">
                                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                                  <span>Updated {formatDate(audioFile.updatedAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center space-y-2 ml-4">
                          {/* Show ownership indicator for shared files */}
                          {user && audioFile.user._id !== user.id && (
                            <div className="text-xs text-gray-500 text-center">
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                                Shared by {audioFile.user.username}
                              </span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => togglePublicStatus(audioFile._id, audioFile.isPublic)}
                            disabled={!user || audioFile.user._id !== user.id}
                             className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md ${
                                !user || audioFile.user._id !== user.id
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-gray-300/25'
                                  : audioFile.isPublic
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                                  : 'bg-gray-600 hover:bg-gray-700 text-white shadow-gray-500/25'
                              }`}
                              title={
                                !user || audioFile.user._id !== user.id
                                  ? 'Only the original uploader can change public status'
                                  : audioFile.isPublic ? 'Make Private' : 'Make Public'
                              }
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">{audioFile.isPublic ? '🌍' : '🔒'}</span>
                              <span className="text-xs">{audioFile.isPublic ? 'Public' : 'Private'}</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;