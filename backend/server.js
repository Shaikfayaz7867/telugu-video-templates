import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

// Import models and config
import Video from './models/Video.js';
import { uploadFileToS3, generateSignedUrl } from './config/aws.js';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
// Bind to localhost by default; allow override for deployments
const HOST = process.env.HOST || '127.0.0.1';

// Middleware
// Trust proxy only when explicitly enabled (useful on Render/NGINX)
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// CORS: allow specific origins in production; default to * for dev
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin === '*' ? true : allowedOrigin.split(',').map(s => s.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Parsing and logging
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan('dev'));

// Configure multer for memory storage (for S3 upload)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes

// Health check for connectivity testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET videos with optional search and pagination
app.get('/api/videos', async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    let query = {};

    // If search query is provided, use text search
    if (q) {
      query = { $text: { $search: q } };
    }

    // If page/limit not provided, maintain legacy behavior (return full list)
    if (Number.isNaN(page) || Number.isNaN(limit)) {
      const videos = await Video.find(query).sort({ createdAt: -1 });
      return res.json(videos);
    }

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const total = await Video.countDocuments(query);
    const items = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit);

    const hasMore = safePage * safeLimit < total;

    res.json({ items, page: safePage, limit: safeLimit, total, hasMore });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET download link for a video
app.get('/api/videos/:id/download', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Generate signed URL valid for 10 minutes
    const signedUrl = await generateSignedUrl(video.key, 600);
    
    res.json({ 
      url: signedUrl,
      filename: video.name,
      mimeType: video.mimeType
    });
  } catch (error) {
    console.error('Error generating download link:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST upload a new video
app.post('/api/videos', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }
    
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Video name is required' });
    }
    
    // Generate unique filename for S3
    const fileExtension = path.extname(req.file.originalname);
    const key = `videos/${uuidv4()}${fileExtension}`;
    
    // Upload to S3
    await uploadFileToS3(
      req.file.buffer,
      key,
      req.file.mimetype
    );
    
    // Create video document in MongoDB
    const newVideo = new Video({
      name,
      key,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
    
    await newVideo.save();
    
    res.status(201).json({
      message: 'Video uploaded successfully',
      video: newVideo
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Email request endpoint using Resend
app.post('/api/requests', async (req, res) => {
  try {
    const { name, email, message, videoName } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'name, email and message are required' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const TO = process.env.RESEND_TO_EMAIL;
    const FROM = process.env.RESEND_FROM_EMAIL;
    if (!RESEND_API_KEY || !TO || !FROM) {
      return res.status(500).json({ message: 'Email not configured on server' });
    }

    const resend = new Resend(RESEND_API_KEY);
    const subject = `New Video Request from ${name}`;
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      videoName ? `Requested Video: ${videoName}` : undefined,
      `Message: ${message}`,
      `Time: ${new Date().toISOString()}`,
    ].filter(Boolean).join('\n');

    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      subject,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ message: 'Failed to send email', error: String(error) });
    }

    res.status(200).json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error('Error handling request email:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found', path: req.originalUrl });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Start server: bind to HOST (localhost by default)
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down...`);
  server.close(async () => {
    try {
      await mongoose.connection.close(false);
    } catch (e) {
      console.error('Error closing MongoDB connection:', e);
    } finally {
      process.exit(0);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
