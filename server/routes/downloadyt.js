const express = require('express');
const ytdl = require('@distube/ytdl-core');
const router = express.Router();
const fs = require('fs');
const { SocksProxyAgent } = require('socks-proxy-agent');
// Read cookies from file
const cookies = [
{
    "name": "__Secure-1PAPISID",
    "value": "AEzWWcpeAT8PtlGA/AUBzMXW51BoikwzMO"
},
{
    "name": "__Secure-1PSID",
    "value": "g.a0000QgDA7RPamwnUemc2G_VUm_p-8pyp2vqB6zXJuDFhaqgtbG5qcSWXObkBG9ORQ_xIJooPQACgYKAcwSARMSFQHGX2MisKZVT2gUj9cBSbhTkTHPAhoVAUF8yKp1FTHkHl1LSiNkKnG0qheI0076"
},
{
    "name": "__Secure-1PSIDCC",
    "value": "AKEyXzXB84aZzMhsKpu3EHhJjbxXHmv6O6Khjgns2sKUYfigBP7uM0YkaGrT02_avGuYVkbzxi4"
},
{
    "name": "__Secure-1PSIDTS",
    "value": "sidts-CjIB5H03P-CyBEri5Od5xc1ybTYG-EB-JYohppNlN7P8Lj4IGyTZzg_z887Og08ZmJXYExAA"
},
{
    "name": "__Secure-3PAPISID",
    "value": "AEzWWcpeAT8PtlGA/AUBzMXW51BoikwzMO"
},
{
    "name": "__Secure-3PSID",
    "value": "g.a0000QgDA7RPamwnUemc2G_VUm_p-8pyp2vqB6zXJuDFhaqgtbG5NbalHTSQpIm0ErT80qS77AACgYKAVwSARMSFQHGX2Mi4rNUShCDqSxPaiPzkF29IBoVAUF8yKo12imuutNy10_VM1OrDy120076"
},
{
    "name": "__Secure-3PSIDCC",
    "value": "AKEyXzVmDpPF8tRzve0HVq71xf2t62Yqlhdll7oVb7nwhnsEi87GPOkug8HOQIsdQDH7dZfYkaI"
},
{
    "name": "__Secure-3PSIDTS",
    "value": "sidts-CjIB5H03P-CyBEri5Od5xc1ybTYG-EB-JYohppNlN7P8Lj4IGyTZzg_z887Og08ZmJXYExAA"
},
{
    "name": "APISID",
    "value": "mhMgyVYlsXIrt6BQ/AUiXjnezWV1058qnj"
},
{
    "name": "HSID",
    "value": "AmcxpCRydDgPIZ832"
},
{
    "name": "LOGIN_INFO",
    "value": "AFmmF2swRQIgLXBcThOT-TNOUJRDh9g_j8xtGkrAJ3XllSdm2R-MBRICIQDbA4CVx_qadI10b8aynMgohfQuBiY0ZYgIBjdDVXe-9w:QUQ3MjNmem9haXVaaW0yRXBCVV9hejJjV3BuVml6UG8wbXpQc3hCTjFjeHFGbkFYSkRrT1FCWW5VdXZ2LWVjRXhwU2VOcXZfSXdrOVVIMW1ENVhPSjJuUGU1S3ZIODFOUTNTbW5lNmRMRUVKeGdQMXNtLUh3eWpYZlp3ZGdrM201bzQzOVFjOVF6UW1HNjFocS1zRjIxQVZINVNEQTRnVjR3"
},
{
    "name": "PREF",
    "value": "f4=4000000&f6=40000000&tz=Africa.Casablanca&f7=100"
},
{
    "name": "SAPISID",
    "value": "AEzWWcpeAT8PtlGA/AUBzMXW51BoikwzMO"
},
{
    "name": "SID",
    "value": "g.a0000QgDA7RPamwnUemc2G_VUm_p-8pyp2vqB6zXJuDFhaqgtbG5LJWjjEVPP4OihyCJIB0SYQACgYKAbcSARMSFQHGX2MiqGMhmrtAEwdCQTrEQVE0ahoVAUF8yKq8A9N78zGQzCsF92g5Dzxc0076"
},
{
    "name": "SIDCC",
    "value": "AKEyXzUrll7ml_TTy4U9zK8vw0CZvS2KzgMMGVRFBv4-2gfeg3HOccZUeRxgLB5rPvZ0Ru5aKTI"
},
{
    "name": "SSID",
    "value": "AXSfeC65XdkEDlrgD"
},
{
    "name": "ST-1b",
    "value": "disableCache=true&itct=CBcQsV4iEwjdj7b75Z6PAxWFwEkHHeLADIXKAQRtQ2VP&csn=b7pfV2O9j-6U77AT&session_logininfo=AFmmF2swRQIgLXBcThOT-TNOUJRDh9g_j8xtGkrAJ3XllSdm2R-MBRICIQDbA4CVx_qadI10b8aynMgohfQuBiY0ZYgIBjdDVXe-9w%3AQUQ3MjNmem9haXVaaW0yRXBCVV9hejJjV3BuVml6UG8wbXpQc3hCTjFjeHFGbkFYSkRrT1FCWW5VdXZ2LWVjRXhwU2VOcXZfSXdrOVVIMW1ENVhPSjJuUGU1S3ZIODFOUTNTbW5lNmRMRUVKeGdQMXNtLUh3eWpYZlp3ZGdrM201bzQzOVFjOVF6UW1HNjFocS1zRjIxQVZINVNEQTRnVjR3&endpoint=%7B%22clickTrackingParams%22%3A%22CBcQsV4iEwjdj7b75Z6PAxWFwEkHHeLADIXKAQRtQ2VP%22%2C%22commandMetadata%22%3A%7B%22webCommandMetadata%22%3A%7B%22url%22%3A%22%2F%22%2C%22webPageType%22%3A%22WEB_PAGE_TYPE_BROWSE%22%2C%22rootVe%22%3A3854%2C%22apiUrl%22%3A%22%2Fyoutubei%2Fv1%2Fbrowse%22%7D%7D%2C%22browseEndpoint%22%3A%7B%22browseId%22%3A%22FEwhat_to_watch%22%7D%7D"
},
{
    "name": "ST-yve142",
    "value": "session_logininfo=AFmmF2swRQIgLXBcThOT-TNOUJRDh9g_j8xtGkrAJ3XllSdm2R-MBRICIQDbA4CVx_qadI10b8aynMgohfQuBiY0ZYgIBjdDVXe-9w%3AQUQ3MjNmem9haXVaaW0yRXBCVV9hejJjV3BuVml6UG8wbXpQc3hCTjFjeHFGbkFYSkRrT1FCWW5VdXZ2LWVjRXhwU2VOcXZfSXdrOVVIMW1ENVhPSjJuUGU1S3ZIODFOUTNTbW5lNmRMRUVKeGdQMXNtLUh3eWpYZlp3ZGdrM201bzQzOVFjOVF6UW1HNjFocS1zRjIxQVZINVNEQTRnVjR3"
},
{
    "name": "wide",
    "value": "0"
}
]

// It's recommended to use environment variables for your proxy credentials
const proxy = process.env.PROXY_URL; // e.g., 'socks5://user:pass@host:port'
// const agent = proxy ? new SocksProxyAgent(proxy) : null;
const agent = ytdl.createAgent(cookies);

router.get('/', async (req, res) => {
  const { url, type } = req.query;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url, {agent});

    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9\s]/g, '');

    res.header('Access-Control-Expose-Headers', 'X-Video-Title');
    res.header('X-Video-Title', title);
    
    //Audio
    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');
    ytdl(url, { filter: 'audioonly', agent }).pipe(res);

    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Error downloading the video' });
  }
});



module.exports = router;