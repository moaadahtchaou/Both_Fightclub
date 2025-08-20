require('dotenv').config()

const express = require('express')
const app = express()
const downloadYT = require('./routes/downloadyt')
const upload = require('./routes/upload')

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
app.use('/api/upload', upload)


// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// ❌ remove app.listen()
// ✅ instead, export the app as a handler
module.exports = app;