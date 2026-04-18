const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');

// POST /api/campaigns — save a completed campaign (image + posts + metadata)
router.post('/', authMiddleware, async (req, res) => {
  const { imageBase64, metadata, posts } = req.body;
  if (!imageBase64 || !metadata || !posts) {
    return res.status(400).json({ error: 'imageBase64, metadata, and posts are required.' });
  }

  try {
    // Upload image to Supabase Storage
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const filePath = `${req.user.id}/${Date.now()}-campaign.png`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageBuffer, { contentType: 'image/png', upsert: false });

    if (uploadError) return res.status(500).json({ error: `Storage upload failed: ${uploadError.message}` });

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    // Save campaign record
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: req.user.id,
        image_url: publicUrl,
        metadata,
        posts
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error('Save campaign error:', err.message);
    res.status(500).json({ error: 'Failed to save campaign.' });
  }
});

// GET /api/campaigns — list all campaigns for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, image_url, metadata, created_at')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/campaigns/:id — get a single full campaign
router.get('/:id', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error) return res.status(404).json({ error: 'Campaign not found.' });
  res.json(data);
});

// DELETE /api/campaigns/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
