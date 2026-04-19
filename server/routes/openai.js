const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { toFile } = require('openai');
const authMiddleware = require('../middleware/auth');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Helper: decode base64 data URL to Buffer ─────────────────────────────────
function base64ToBuffer(dataUrl) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64, 'base64');
}

// POST /api/openai/analyze
// GPT-4o Vision: extract product metadata from image
router.post('/analyze', authMiddleware, async (req, res) => {
  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required.' });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this product image. Return ONLY a JSON object with these exact keys: product_name (string), key_attributes (array of 4 strings), target_audience (array of 3 strings), price_tier (string), marketing_angle (string).'
          },
          { type: 'image_url', image_url: { url: imageBase64 } }
        ]
      }]
    });

    res.json(JSON.parse(response.choices[0].message.content));
  } catch (err) {
    console.error('Analyze error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/openai/generate
// GPT-4o: generate a platform-specific caption
router.post('/generate', authMiddleware, async (req, res) => {
  const { platform, analysis } = req.body;
  if (!platform || !analysis) return res.status(400).json({ error: 'platform and analysis are required.' });

  const prompts = {
    facebook: `Write a Facebook post for ${analysis.product_name}. 300 characters max. Warm, professional tone. Angle: ${analysis.marketing_angle}. Output ONLY the post text.`,
    twitter: `Write an X/Twitter post for ${analysis.product_name}. 280 characters max. Punchy with 2 relevant hashtags. Angle: ${analysis.marketing_angle}. Output ONLY the post text.`,
    instagram: `Write an Instagram post for ${analysis.product_name}. 200 characters max. Aspirational with emojis. Angle: ${analysis.marketing_angle}. Output ONLY the post text.`,
    linkedin: `Write a LinkedIn post for ${analysis.product_name}. Professional business tone, focused on product innovation/design. Angle: ${analysis.marketing_angle}. Output ONLY the post text.`,
    tiktok: `Write a TikTok caption for ${analysis.product_name}. Fast-paced, trendy, Gen-Z tone, with several hashtags. Angle: ${analysis.marketing_angle}. Output ONLY the caption.`
  };

  if (!prompts[platform]) return res.status(400).json({ error: 'Invalid platform.' });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompts[platform] }],
      temperature: 0.8
    });
    res.json({ text: response.choices[0].message.content.trim() });
  } catch (err) {
    console.error('Generate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/openai/humanize
// GPT-4o: rewrite a caption to sound genuinely human
router.post('/humanize', authMiddleware, async (req, res) => {
  const { platform, text } = req.body;
  if (!platform || !text) return res.status(400).json({ error: 'platform and text are required.' });

  const toneGuide = {
    linkedin: 'professional but human — like a genuine person sharing a real opinion',
    twitter: 'casual and punchy — short, direct, no filler',
    tiktok: 'relaxed and fun — like texting a friend',
    facebook: 'friendly and conversational',
    instagram: 'natural and aspirational without sounding try-hard'
  };

  const prompt = `Rewrite this ${platform} caption so it sounds completely natural — like a real person wrote it, not a marketing tool or AI.

Rules:
- Remove hollow buzzwords (elevate, transform, unlock, game-changer, revolutionize, seamlessly, etc.)
- Remove excessive punctuation and emojis unless the platform calls for it
- Keep the core message and similar length
- Match this tone: ${toneGuide[platform] || 'friendly and conversational'}
- Output ONLY the rewritten caption, nothing else

Original caption:
${text}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85
    });
    res.json({ text: response.choices[0].message.content.trim() });
  } catch (err) {
    console.error('Humanize error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/openai/edit-image
// gpt-image-1: apply a structural AI edit to the product image
router.post('/edit-image', authMiddleware, async (req, res) => {
  const { imageBase64, prompt } = req.body;
  if (!imageBase64 || !prompt) return res.status(400).json({ error: 'imageBase64 and prompt are required.' });

  try {
    const imageBuffer = base64ToBuffer(imageBase64);
    const imageFile = await toFile(imageBuffer, 'product.png', { type: 'image/png' });

    const response = await openai.images.edit({
      model: 'dall-e-2',
      image: imageFile,
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json'
    });

    const b64 = response.data[0].b64_json;
    res.json({ imageBase64: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error('Image edit error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
