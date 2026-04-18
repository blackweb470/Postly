const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB max
});

// POST /api/images/upload
// Accepts a multipart image file, uploads to Supabase Storage, returns public URL
router.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided.' });

  const { buffer, mimetype, originalname } = req.file;
  const ext = originalname.split('.').pop() || 'jpg';
  const filePath = `${req.user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, buffer, { contentType: mimetype, upsert: false });

  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  res.json({ url: publicUrl, path: filePath });
});

module.exports = router;
