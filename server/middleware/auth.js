const supabase = require('../lib/supabase');

/**
 * Middleware: Verifies the Supabase JWT sent as `Authorization: Bearer <token>`
 * Attaches req.user on success.
 */
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Token is invalid or has expired.' });
  }

  req.user = user;
  req.token = token;
  next();
};
