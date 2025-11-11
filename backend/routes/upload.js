const express = require('express');
const { upload, uploadFile } = require('../services/storage');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Upload episode file (audio or video)
router.post('/episode', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const result = await uploadFile(req.file, 'episodes');
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

// Upload podcast cover image
router.post('/cover', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Validate image type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
    }
    
    const result = await uploadFile(req.file, 'covers');
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

// Upload clip file
router.post('/clip', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const result = await uploadFile(req.file, 'clips');
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

module.exports = router;

