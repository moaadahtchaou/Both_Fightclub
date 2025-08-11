import { useState } from 'react';

const YouTubeDownloader = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!url) {
      alert('Please enter a YouTube URL');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3000/download?url=${encodeURIComponent(url)}&type=audio`);
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'audio.mp3';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error(error);
      alert('Error downloading the file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="youtube-downloader">
      <h2>YouTube Downloader</h2>
      <input
        type="text"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div className="buttons">
        <button onClick={handleDownload} disabled={loading}>
          {loading ? 'Downloading...' : 'Download MP3'}
        </button>
      </div>
    </div>
  );
};

export default YouTubeDownloader;