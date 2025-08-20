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
});

app.use('/download', downloadYT);
app.use('/upload', upload);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});