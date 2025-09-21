/**
 * YouTube URL validation utility
 * Validates various YouTube URL formats including:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */

export interface YouTubeValidationResult {
  isValid: boolean;
  videoId?: string;
  error?: string;
}

/**
 * Validates if a URL is a valid YouTube URL and extracts the video ID
 * @param url - The URL to validate
 * @returns YouTubeValidationResult object with validation status and video ID
 */
export const validateYouTubeUrl = (url: string): YouTubeValidationResult => {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL is required'
    };
  }

  // Remove whitespace
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return {
      isValid: false,
      error: 'URL cannot be empty'
    };
  }

  // YouTube URL patterns
  const youtubePatterns = [
    // Standard YouTube URLs
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(&.*)?$/,
    // Shorts URLs
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(\/)?(\?.*)?$/,
    /^https?:\/\/(m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(\/)?(\?.*)?$/,
    /^(www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(\/)?(\?.*)?$/,
    // Short YouTube URLs
    /^https?:\/\/(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(\?.*)?$/,
    // Mobile YouTube URLs
    /^https?:\/\/(m\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(&.*)?$/,
    // Embed URLs
    /^https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(\?.*)?$/,
    // Old format URLs
    /^https?:\/\/(www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})(\?.*)?$/,
    // YouTube URLs without protocol
    /^(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(&.*)?$/,
    /^(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(\?.*)?$/
  ];

  for (const pattern of youtubePatterns) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      // Extract video ID from the match
      const videoId = match[2] || match[1];
      if (videoId && videoId.length === 11) {
        return {
          isValid: true,
          videoId: videoId
        };
      }
    }
  }

  return {
    isValid: false,
    error: 'Invalid YouTube URL format. Please enter a valid YouTube video URL.'
  };
};

/**
 * Checks if a URL is a valid YouTube URL (simple boolean check)
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  return validateYouTubeUrl(url).isValid;
};

/**
 * Extracts video ID from a YouTube URL
 * @param url - The YouTube URL
 * @returns video ID or null if invalid
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  const result = validateYouTubeUrl(url);
  return result.isValid ? result.videoId || null : null;
};

/**
 * Gets a user-friendly error message for invalid YouTube URLs
 * @param url - The URL that failed validation
 * @returns error message string
 */
export const getYouTubeUrlError = (url: string): string => {
  const result = validateYouTubeUrl(url);
  return result.error || 'Invalid YouTube URL';
};