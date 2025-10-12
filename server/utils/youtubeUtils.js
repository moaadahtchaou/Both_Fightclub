/**
 * Helper function to extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if not found
 */
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:(?:v|e(?:mbed)?)\/|shorts\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Helper function to clean YouTube URL by removing extra parameters
 * @param {string} url - YouTube URL to clean
 * @returns {string} Cleaned YouTube URL
 */
function cleanYouTubeUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^m\./, ''); // normalize mobile subdomain
    const pathname = urlObj.pathname || '';

    // Handle Shorts URLs by converting to standard watch URL
    // Examples: https://www.youtube.com/shorts/VIDEO_ID, https://m.youtube.com/shorts/VIDEO_ID
    if (hostname === 'www.youtube.com' || hostname === 'youtube.com') {
      if (pathname.startsWith('/shorts/')) {
        const parts = pathname.split('/');
        const maybeId = parts[2] || '';
        if (maybeId && maybeId.length === 11) {
          return `https://www.youtube.com/watch?v=${maybeId}`;
        }
      }
      // Keep only essential parameters for standard watch URLs
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }

    // For youtu.be URLs, keep as is
    if (hostname === 'youtu.be') {
      return url;
    }

    return url;
  } catch (error) {
    console.log('⚠️ Error cleaning URL, using original:', error.message);
    return url;
  }
}

module.exports = {
  extractVideoId,
  cleanYouTubeUrl
};