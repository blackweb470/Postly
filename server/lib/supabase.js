const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Service-role client — never exposed to the browser
// Bypasses RLS so the server can manage all data
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

module.exports = supabase;
