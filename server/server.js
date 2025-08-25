require('dotenv').config()

const express = require('express')
const app = express()
const downloadYT = require('./routes/downloadyt')
const ytmp3Scraper = require('./routes/ytmp3-scraper')
const upload = require('./routes/upload')
const allinone = require('./routes/allinone')

const cors = require('cors')
const corsOptions = require('./config/corsOptions')

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
  res.send('Hello, World!');
})

// Basic health check for API
app.get('/api', (req, res) => {
  res.json({ status: 'ok' })
})

// Prefix routes with /api to match client and Vercel routing
app.use('/api/download', downloadYT)
app.use('/api/ytmp3', ytmp3Scraper)
app.use('/api/upload', upload)
app.use('/api/allinone', allinone)


// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// ❌ remove app.listen()
// ✅ instead, export the app as a handler
module.exports = app;