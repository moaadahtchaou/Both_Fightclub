// Unified Instagram/Facebook URL validation utility
// Accepts Instagram: /reel/, /reels/, /p/, /tv/
// Accepts Facebook: facebook.com (m., www.), fb.watch, with /reel/, /reels/, /videos/, /watch (with v param)

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  platform?: 'instagram' | 'facebook';
}

function isInstagramHost(host: string) {
  const h = host.toLowerCase();
  return h === 'instagram.com' || h.endsWith('.instagram.com') || h === 'ig.me' || h.endsWith('.ig.me');
}

function isFacebookHost(host: string) {
  const h = host.toLowerCase();
  return (
    h === 'facebook.com' ||
    h.endsWith('.facebook.com') ||
    h === 'fb.watch' ||
    h.endsWith('.fb.watch')
  );
}

export function validateInstaFbUrl(url: string): ValidationResult {
  if (!url || !url.trim()) {
    return { isValid: false, error: 'Please paste a URL' };
  }
  try {
    const u = new URL(url.trim());
    const hostValidInstagram = isInstagramHost(u.hostname);
    const hostValidFacebook = isFacebookHost(u.hostname);

    if (!hostValidInstagram && !hostValidFacebook) {
      return { isValid: false, error: 'URL must be from instagram.com or facebook.com' };
    }

    const path = u.pathname.toLowerCase();
    const hasIgPath = /(\/reel\/|\/reels\/|\/p\/|\/tv\/)/.test(path);
    const hasFbPath = (
      /(\/reel\/|\/reels\/|\/videos\/|\/watch\/)/.test(path) ||
      (path === '/watch' && u.searchParams.has('v')) ||
      isFacebookHost(u.hostname) && u.hostname.toLowerCase().includes('fb.watch')
    );

    if (hostValidInstagram && hasIgPath) return { isValid: true, platform: 'instagram' };
    if (hostValidFacebook && (hasFbPath || u.hostname.toLowerCase().includes('fb.watch'))) return { isValid: true, platform: 'facebook' };

    return { isValid: false, error: 'Please provide a valid Instagram/Facebook Reel/Video/Post URL' };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}
