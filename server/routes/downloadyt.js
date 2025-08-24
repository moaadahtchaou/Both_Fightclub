const express = require('express');
const ytdl = require('@distube/ytdl-core');
const { HttpsProxyAgent } = require('https-proxy-agent');
const fs = require('fs');
const fetch = require('node-fetch');


const router = express.Router();

async function testProxy(proxy) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 2000);

  try {
    const agent = new HttpsProxyAgent(proxy);
    const res = await fetch("https://www.youtube.com", { agent, method: "GET", signal: controller.signal });
    if (res.status === 200) {
      return proxy;
    }
  } catch (err) {
    // console.error(`Proxy failed: ${proxy}`, err.message);
  } finally {
    clearTimeout(timeout);
  }
  return null;
}

async function getWorkingProxy(proxyFile) {
    const proxies = fs.readFileSync(proxyFile, 'utf8').split('\n').filter(proxy => proxy.trim());
    const workingProxies = [];
    for (const proxy of proxies) {
        const workingProxy = await testProxy(proxy);
        if (workingProxy) {
            workingProxies.push(workingProxy);
        }
    }
    if (workingProxies.length > 0) {
        return workingProxies[Math.floor(Math.random() * workingProxies.length)];
    }
    return null;
}


router.get('/', async (req, res) => {
  
  const { url, type } = req.query;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const proxyFile ='validiadress.txt';
    let agent;
    if (proxyFile) {
        const workingProxy = await getWorkingProxy(proxyFile);
        if (workingProxy) {
          console.log('Working proxy:', workingProxy);
          agent = ytdl.createProxyAgent({ uri: workingProxy });
          console.log('Using proxy:', workingProxy);
        }
    }
    agent=ytdl.createProxyAgent({ uri: "http://AceAlgo_KplPN:Moaad073022+@dc.oxylabs.io:8001" })
    const info = await ytdl.getInfo(url,{agent} );
    console.log('info:');
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9\\s]/g, '');

    res.header('Access-Control-Expose-Headers', 'X-Video-Title');
    res.header('X-Video-Title', title);
    
    //Audio
    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');
    ytdl(url, { filter: 'audioonly',agent}).pipe(res);

    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Error downloading the video' });
  }
});



module.exports = router;