const fs = require('fs');
const path = require('path');

/**
 * Function to load and parse proxy addresses from validiadress.txt
 * @returns {string[]} Array of proxy URLs
 */
function loadProxies() {
  try {
    const proxyFile = path.join(__dirname, '..', 'validiadress.txt');
    const proxyData = fs.readFileSync(proxyFile, 'utf8');
    const proxies = proxyData.split('\n')
      .map(line => line.trim())
      .filter(line => line && line.startsWith('http'));
    return proxies;
  } catch (error) {
    console.log('⚠️ Could not load proxies:', error.message);
    return [];
  }
}

/**
 * Function to get a random proxy from the available proxies
 * @returns {string|null} Random proxy URL or null if no proxies available
 */
function getRandomProxy() {
  const proxies = loadProxies();
  if (proxies.length === 0) {
    console.log('⚠️ No proxies available, running without proxy');
    return null;
  }
  const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
  console.log('🔄 Using proxy:', randomProxy.replace(/:\/\/[^@]+@/, '://***:***@')); // Hide credentials in log
  return randomProxy;
}

/**
 * Function to parse proxy URL and extract components
 * @param {string} proxyUrl - The proxy URL to parse
 * @returns {Object|null} Parsed proxy configuration or null if parsing fails
 */
function parseProxy(proxyUrl) {
  try {
    const url = new URL(proxyUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port),
      username: url.username,
      password: url.password
    };
  } catch (error) {
    console.log('⚠️ Error parsing proxy URL:', error.message);
    return null;
  }
}

module.exports = {
  loadProxies,
  getRandomProxy,
  parseProxy
};