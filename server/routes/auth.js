const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    // Create user via admin (auto-confirms email so no verification step needed in dev)
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (createError) return res.status(400).json({ error: createError.message });

    // Immediately sign in to get the session token
    const { data: session, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) return res.status(400).json({ error: signInError.message });

    res.json({
      user: session.user,
      token: session.session.access_token
    });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  res.json({
    user: data.user,
    token: data.session.access_token
  });
});

// GET /api/auth/me — validate token and return user profile
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req, res) => {
  await supabase.auth.admin.signOut(req.token);
  res.json({ success: true });
});

module.exports = router;
