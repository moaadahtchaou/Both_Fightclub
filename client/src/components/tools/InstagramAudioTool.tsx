import React, { useState } from 'react';
import { buildApiUrl, API_ENDPOINTS, getAuthHeaders } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  MusicalNoteIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { validateInstaFbUrl } from '../../utils/instaFbvalidator';

interface InstagramAudioToolProps {
  className?: string;
}

// Replace previous Instagram-only validator with unified Instagram/Facebook validator
const isValidInstagramUrl = (url: string): { isValid: boolean; error?: string } => {
  const result = validateInstaFbUrl(url);
  if (!result.isValid) return { isValid: false, error: result.error || 'Invalid Instagram/Facebook URL' };
  return { isValid: true };
};

const InstagramAudioTool: React.FC<InstagramAudioToolProps> = ({ className = '' }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();

  const [igUrl, setIgUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [urlValidationError, setUrlValidationError] = useState('');

  const [downloadStatus, setDownloadStatus] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPasting, setIsPasting] = useState(false);

  const getAudioType = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.endsWith('.mp3')) return 'audio/mpeg';
    if (lower.endsWith('.m4a') || lower.endsWith('.mp4')) return 'audio/mp4';
    if (lower.endsWith('.wav')) return 'audio/wav';
    if (lower.endsWith('.ogg')) return 'audio/ogg';
    return 'audio/mpeg';
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URL
    const validation = isValidInstagramUrl(igUrl);
    if (!validation.isValid) {
      setUrlValidationError(validation.error || 'Invalid Instagram URL');
      return;
    }

    setUrlValidationError('');
    setStatusMsg('🚀 Starting extraction and upload...');
    setDownloadStatus('');
    setUploadStatus('');
    setUploadedUrl('');
    setIsProcessing(true);

    try {
      if (!isAuthenticated || !user) {
        throw new Error('Please log in to use this feature');
      }
      if (user.credits < 1) {
        throw new Error('Insufficient credits. You need at least 1 credit.');
      }

      const resp = await fetch(`${buildApiUrl(API_ENDPOINTS.INSTAGRAM)}?url=${encodeURIComponent(igUrl)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!resp.ok) {
        let errorText = `HTTP error! status: ${resp.status}`;
        try {
          const errJson = await resp.json();
          errorText = errJson.error || errorText;
        } catch {}
        throw new Error(errorText);
      }

      const result = await resp.json();
      if (result?.success) {
        if (result.isShared) {
          setDownloadStatus(`🔄 Duplicate detected - existing audio reused${result.method ? ` (Method: ${result.method})` : ''}`);
          setUploadStatus('✅ Audio shared successfully!');
        } else {
          setDownloadStatus(`✅ Download complete${result.method ? ` (Method: ${result.method})` : ''}${result.format ? ` | Format: ${result.format}` : ''}`);
          setUploadStatus('✅ Uploaded to Catbox successfully!');
        }
        setUploadedUrl(result.catboxUrl);
        setStatusMsg(result.message || '🎉 Done! Your audio is ready.');
        await refreshUser();
      } else {
        throw new Error(result?.error || 'Extraction failed');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      if (msg.toLowerCase().includes('credits')) {
        setDownloadStatus('❌ Error: Insufficient credits');
      } else if (msg.toLowerCase().includes('unauthorized') || msg.includes('401')) {
        setDownloadStatus('❌ Error: Please log in again');
      } else if (msg.toLowerCase().includes('timeout')) {
        setDownloadStatus('❌ Error: Timeout - try a shorter reel');
      } else if (msg.toLowerCase().includes('upload') || msg.toLowerCase().includes('catbox')) {
        setDownloadStatus('✅ Download completed');
        setUploadStatus('❌ Upload to Catbox failed');
      } else {
        setDownloadStatus('❌ Error: Unable to process this Instagram URL');
      }
      setStatusMsg('❌ Process failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setIgUrl('');
    setStatusMsg('');
    setDownloadStatus('');
    setUploadStatus('');
    setUploadedUrl('');
    setUrlValidationError('');
  };


  return (
    <div className={`relative rounded-3xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-white/5 to-white/[0.03] backdrop-blur-xl ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-fuchsia-500/20 to-rose-500/20 rounded-2xl ring-1 ring-white/10">
              <MusicalNoteIcon className="w-8 h-8 text-fuchsia-400" />
            </div>
            <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-1 tracking-tight">Instagram/Facebook Audio Extractor</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Extract audio from Instagram and Facebook videos and reels, then upload directly to Catbox
            </p>
            {isAuthenticated && user && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-400/30">
                  <SparklesIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">Credits: {user.credits}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
          <span className="text-sm text-gray-400">{isProcessing ? 'Processing' : 'Ready'}</span>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handleExtract}>
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
            <LinkIcon className="w-4 h-4 text-fuchsia-400" />
            <span>Instagram/Facebook Reel/Video/Post URL</span>
          </label>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <InformationCircleIcon className="w-4 h-4 text-gray-500" />
            <span>Supports instagram.com and facebook.com links, including reels, videos and posts.</span>
          </p>
          <div className="relative group">
            <input
              type="url"
              value={igUrl}
              onChange={(e) => {
                setIgUrl(e.target.value);
                if (urlValidationError) setUrlValidationError('');
              }}
              placeholder="Paste your Instagram or Facebook URL here..."
              className={`w-full px-6 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 pr-28 ${
                urlValidationError
                  ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                  : 'border-white/20 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50'
              }`}
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  setIsPasting(true);
                  try {
                    const t = await navigator.clipboard.readText();
                    if (t) {
                      setIgUrl(t);
                      setUrlValidationError('');
                    }
                  } catch {}
                  setIsPasting(false);
                }}
                disabled={isPasting}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 flex items-center gap-1 ${
                  isPasting
                    ? 'bg-white/10 border-white/20 text-gray-300 cursor-wait'
                    : 'bg-white/5 hover:bg-white/10 border-white/20 text-gray-200'
                }`}
                title="Paste from clipboard"
              >
                {isPasting ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <DocumentDuplicateIcon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Paste</span>
              </button>
              <MusicalNoteIcon className="w-5 h-5 text-gray-400 group-focus-within:text-fuchsia-400 transition-colors" />
            </div>
          </div>
          {urlValidationError && (
            <div className="flex items-center space-x-2 text-xs text-red-400">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>{urlValidationError}</span>
            </div>
          )}
          {igUrl && !urlValidationError && isValidInstagramUrl(igUrl).isValid && (
            <div className="flex items-center space-x-2 text-xs text-green-400">
              <CheckCircleIcon className="w-4 h-4" />
              <span>Valid Instagram or Facebook URL detected</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isProcessing || !igUrl}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-sm ${
              isProcessing
                ? 'bg-gray-600/50 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-400/50'
            }`}
          >
            <span>{isProcessing ? 'Processing...' : 'Extract & Upload'}</span>
          </button>

          <button
            type="button"
            onClick={clearAll}
            className="px-6 py-3 rounded-xl font-semibold bg-white/5 text-gray-300 hover:bg-white/10 transition-all duration-200 border border-white/20 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <XMarkIcon className="w-5 h-5" />
            <span>Clear</span>
          </button>
        </div>
      </form>

      {/* Status */}
      {(statusMsg || downloadStatus || uploadStatus || uploadedUrl) && (
        <div className="mt-8 space-y-4">
          {statusMsg && (
            <div className={`p-4 rounded-xl border ${statusMsg.startsWith('❌') ? 'bg-rose-500/10 border-rose-400/30 text-rose-200' : 'bg-blue-500/10 border-blue-400/30 text-blue-200'}`}>
              {statusMsg}
            </div>
          )}
          {downloadStatus && (
            <div className={`p-4 rounded-xl border flex items-start gap-2 ${
              downloadStatus.startsWith('✅') || downloadStatus.startsWith('🔄')
                ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
                : 'bg-rose-500/10 border-rose-400/30 text-rose-200'
            }`}>
              <MusicalNoteIcon className="w-5 h-5 mt-0.5" />
              <span className="text-gray-100/90">{downloadStatus}</span>
            </div>
          )}
          {uploadStatus && (
            <div className={`p-4 rounded-xl border flex items-start gap-2 ${
              uploadStatus.startsWith('✅')
                ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
                : 'bg-rose-500/10 border-rose-400/30 text-rose-200'
            }`}>
              <SparklesIcon className="w-5 h-5 mt-0.5" />
              <span className="text-gray-100/90">{uploadStatus}</span>
            </div>
          )}
          {uploadedUrl && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-gray-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm text-gray-400 mb-1">Catbox URL</div>
                  <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{uploadedUrl}</a>

                  <div className="mt-3">
                    <audio controls className="w-full max-w-md">
                      <source src={uploadedUrl} type={getAudioType(uploadedUrl)} />
                      Your browser does not support the audio element. You can download it from the link above.
                    </audio>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(uploadedUrl);
                        setCopied(true);
                        setStatusMsg('📋 Copied link to clipboard!');
                        setTimeout(() => setCopied(false), 1200);
                      } catch {}
                    }}
                    className={`ml-0 md:ml-4 px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-all duration-200 border ${
                      copied
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                        : 'bg-white/10 hover:bg-white/20 border-white/20 text-gray-200'
                    }`}
                  >
                    {copied ? (
                      <ClipboardDocumentCheckIcon className="w-4 h-4" />
                    ) : (
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    )}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstagramAudioTool;