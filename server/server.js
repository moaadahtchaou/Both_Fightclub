require('dotenv').config()

const express = require('express')
const app = express()
const { connectDB } = require('./config/database')
const downloadYT = require('./routes/downloadyt')
const ytmp3Scraper = require('./routes/ytmp3-scraper')
const upload = require('./routes/upload')
const allinone = require('./routes/allinone')
const testRoute = require('./routes/test')
const authRoute = require('./routes/auth')
const usersRoute = require('./routes/users')
const audioRoute = require('./routes/audio')
const bcrypt = require('bcryptjs')
const User = require('./models/User')

const cors = require('cors')
const corsOptions = require('./config/corsOptions')

app.use(cors(corsOptions))
// Increase payload size limits for file uploads
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

// Initialize MongoDB connection
connectDB()

// Initialize admin account
async function initializeAdminAccount() {
  try {
    const adminUsername = 'Bunny#9332'
    const adminPassword = 'moaad+'
    
    // Check if admin account already exists
    const existingAdmin = await User.findOne({ username: adminUsername })
    
    if (!existingAdmin) {
      // Hash the password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds)
      
      // Create admin account
      const adminUser = new User({
        username: adminUsername,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      })
      
      await adminUser.save()
      console.log('✅ Admin account created successfully:', adminUsername)
    } else {
      console.log('✅ Admin account already exists:', adminUsername)
    }
  } catch (error) {
    console.error('❌ Error initializing admin account:', error.message)
  }
}

// Initialize admin account after database connection
setTimeout(initializeAdminAccount, 2000)


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
app.use('/api/test', testRoute)
app.use('/api/auth', authRoute)
app.use('/api/users', usersRoute)
app.use('/api/audio', audioRoute)


// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}/api`);
// });

// ❌ remove app.listen()
// ✅ instead, export the app as a handler
module.exports = app;