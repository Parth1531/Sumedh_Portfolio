const SUPABASE_URL = "https://zucjacwhyugsowmrwawz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1Y2phY3doeXVnc293bXJ3YXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODg3MjcsImV4cCI6MjEwMDQ2NDcyN30.-7Hjx0Wr2sMcXpUSJ3lQJTkg92NNXJjtrnD-LlVcy1U";
const SUPABASE_BUCKET = "gallery-images";

let supabase = null;

if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
  if (SUPABASE_URL && !SUPABASE_URL.includes('YOUR_') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR_')) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}

window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.SUPABASE_BUCKET = SUPABASE_BUCKET;
window.supabaseClient = supabase;