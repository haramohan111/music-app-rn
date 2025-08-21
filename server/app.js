require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const { globalErrorHandler } = require('./src/utills/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const webRoutes = require('./src/routes/webRoutes');
const adminRoutes = require('./src/routes/adminRoutes');


// Initialize Express app
const app = express();
// 1. Connect to MongoDB
connectDB();
app.use(cookieParser());

//Prevent browser caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
// 2. Middlewares
app.use(cors({
  origin: [process.env.FRONTEND_URL,process.env.ADMIN_URL],
  credentials: true,
}));
app.use(express.json());
app.use('/audio', express.static(path.join(__dirname, 'uploads/audio')));
app.use('/covers', express.static(path.join(__dirname, 'uploads/covers')));




app.get('/api/v1/audio/:filename', async (req, res) => {
  // You can check authentication here
  // if (!req.user) {
  //   return res.status(403).send('Unauthorized');
  // }

  const filePath = path.join(__dirname, 'uploads/audio', req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  // Prevent Content-Disposition: attachment (download)
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Accept-Ranges', 'bytes'); // Allows streaming

  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (range) {
    const [start, end] = range.replace(/bytes=/, '').split('-');
    const chunkStart = parseInt(start, 10);
    const chunkEnd = end ? parseInt(end, 10) : stat.size - 1;
    const chunkSize = chunkEnd - chunkStart + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${chunkStart}-${chunkEnd}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/mpeg',
    });

    fs.createReadStream(filePath, { start: chunkStart, end: chunkEnd }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': 'audio/mpeg',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});


app.use(morgan('dev')); // HTTP request logger

// 3. Routes
app.use('/api/v1', authRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1', webRoutes); // Example route for users

app.get('/', async (req, res) => {
  res.send("hi")
})

// 4. Handle 404 routes
// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// 5. Global error handler
app.use(globalErrorHandler);

// 6. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});