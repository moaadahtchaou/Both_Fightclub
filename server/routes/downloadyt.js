const express = require('express');
const ytdl = require('@distube/ytdl-core');
const router = express.Router();
const fs = require('fs');
const { SocksProxyAgent } = require('socks-proxy-agent');
// Read cookies from file


// It's recommended to use environment variables for your proxy credentials
const proxy = process.env.PROXY_URL; // e.g., 'socks5://user:pass@host:port'
// const agent = proxy ? new SocksProxyAgent(proxy) : null;
const agent = ytdl.createAgent([
{
    "domain": ".youtube.com",
    "expirationDate": 1771199378.749045,
    "hostOnly": false,
    "httpOnly": false,
    "name": "__Secure-1PAPISID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "AEzWWcpeAT8PtlGA/AUBzMXW51BoikwzMO",
    "id": 1
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771199378.74923,
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-1PSID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "g.a0000QgDA7RPamwnUemc2G_VUm_p-8pyp2vqB6zXJuDFhaqgtbG5qcSWXObkBG9ORQ_xIJooPQACgYKAcwSARMSFQHGX2MisKZVT2gUj9cBSbhTkTHPAhoVAUF8yKp1FTHkHl1LSiNkKnG0qheI0076",
    "id": 2
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771434196.699178,
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-1PSIDCC",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "AKEyXzXhfxauJpP_9weSFhSfNeEo1MiOT8Z5o1csf9X_UsXRQyz7BDjEyCYAJKxkDmeBg22jgIY",
    "id": 3
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771433893.470739,
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-1PSIDTS",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "sidts-CjIB5H03Pw5qvr-CtgQZFRXrP-ZSXyM0lu-O1-7K8yPVG_nO2D4D0Z3iEoRDuPlerZfdgxAA",
    "id": 4
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771199378.74906,
    "hostOnly": false,
    "httpOnly": false,
    "name": "__Secure-3PAPISID",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "AEzWWcpeAT8PtlGA/AUBzMXW51BoikwzMO",
    "id": 5
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771199378.749244,
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-3PSID",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "g.a0000QgDA7RPamwnUemc2G_VUm_p-8pyp2vqB6zXJuDFhaqgtbG5NbalHTSQpIm0ErT80qS77AACgYKAVwSARMSFQHGX2Mi4rNUShCDqSxPaiPzkF29IBoVAUF8yKo12imuutNy10_VM1OrDy120076",
    "id": 6
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771434196.6992,
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-3PSIDCC",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "AKEyXzWlTXkupmCgc1qqANFoewzVJhzdiQtjvuNCL-4QIT9mPmlHn52LcK4voGYbmCocOyVzKUU",
    "id": 7
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771433893.480159,
    "hostOnly": false,
    "httpOnly": true,
    "name": "__Secure-3PSIDTS",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "sidts-CjIB5H03Pw5qvr-CtgQZFRXrP-ZSXyM0lu-O1-7K8yPVG_nO2D4D0Z3iEoRDuPlerZfdgxAA",
    "id": 8
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771199378.749011,
    "hostOnly": false,
    "httpOnly": false,
    "name": "APISID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": false,
    "session": false,
    "storeId": "0",
    "value": "mhMgyVYlsXIrt6BQ/AUiXjnezWV1058qnj",
    "id": 9
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771199378.748938,
    "hostOnly": false,
    "httpOnly": true,
    "name": "HSID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": false,
    "session": false,
    "storeId": "0",
    "value": "AmcxpCRydDgPIZ832",
    "id": 10
},
{
    "domain": ".youtube.com",
    "expirationDate": 1765639887.88652,
    "hostOnly": false,
    "httpOnly": true,
    "name": "LOGIN_INFO",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "AFmmF2swRQIgLXBcThOT-TNOUJRDh9g_j8xtGkrAJ3XllSdm2R-MBRICIQDbA4CVx_qadI10b8aynMgohfQuBiY0ZYgIBjdDVXe-9w:QUQ3MjNmem9haXVaaW0yRXBCVV9hejJjV3BuVml6UG8wbXpQc3hCTjFjeHFGbkFYSkRrT1FCWW5VdXZ2LWVjRXhwU2VOcXZfSXdrOVVIMW1ENVhPSjJuUGU1S3ZIODFOUTNTbW5lNmRMRUVKeGdQMXNtLUh3eWpYZlp3ZGdrM201bzQzOVFjOVF6UW1HNjFocS1zRjIxQVZINVNEQTRnVjR3",
    "id": 11
},
{
    "domain": ".youtube.com",
    "expirationDate": 1756486993.79924,
    "hostOnly": false,
    "httpOnly": false,
    "name": "PREF",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "f4=4000000&f6=40000000&tz=Africa.Casablanca&f7=100",
    "id": 12
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771199378.749027,
    "hostOnly": false,
    "httpOnly": false,
    "name": "SAPISID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "AEzWWcpeAT8PtlGA/AUBzMXW51BoikwzMO",
    "id": 13
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771199378.749216,
    "hostOnly": false,
    "httpOnly": false,
    "name": "SID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": false,
    "session": false,
    "storeId": "0",
    "value": "g.a0000QgDA7RPamwnUemc2G_VUm_p-8pyp2vqB6zXJuDFhaqgtbG5LJWjjEVPP4OihyCJIB0SYQACgYKAbcSARMSFQHGX2MiqGMhmrtAEwdCQTrEQVE0ahoVAUF8yKq8A9N78zGQzCsF92g5Dzxc0076",
    "id": 14
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771434196.699128,
    "hostOnly": false,
    "httpOnly": false,
    "name": "SIDCC",
    "path": "/",
    "sameSite": "unspecified",
    "secure": false,
    "session": false,
    "storeId": "0",
    "value": "AKEyXzWZD-H_MttqvpLYd8rKiOr2x6CatMAS9_avrE3xw6yNDyaMa4F93-B_dCaMsWJZoyPYCRo",
    "id": 15
},
{
    "domain": ".youtube.com",
    "expirationDate": 1771199378.748994,
    "hostOnly": false,
    "httpOnly": true,
    "name": "SSID",
    "path": "/",
    "sameSite": "unspecified",
    "secure": true,
    "session": false,
    "storeId": "0",
    "value": "AXSfeC65XdkEDlrgD",
    "id": 16
},
{
    "domain": ".youtube.com",
    "hostOnly": false,
    "httpOnly": false,
    "name": "wide",
    "path": "/",
    "sameSite": "lax",
    "secure": true,
    "session": true,
    "storeId": "0",
    "value": "0",
    "id": 17
}
])

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