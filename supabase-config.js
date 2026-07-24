// ===========================================================
// Supabase client setup
// Loaded BEFORE gallery.js on every category page.
//
// Replace the two placeholder values below with your real
// Supabase project URL and anon public key
// (Project Settings -> API in your Supabase dashboard).
// ===========================================================

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1Y2phY3doeXVnc293bXJ3YXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4ODg3MjcsImV4cCI6MjEwMDQ2NDcyN30.-7Hjx0Wr2sMcXpUSJ3lQJTkg92NNXJjtrnD-LlVcy1U";

// Creates a global `supabase` client that gallery.js uses.
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Name of the storage bucket where gallery images are uploaded.
// Create this bucket in Supabase Storage and make it Public.
const SUPABASE_BUCKET = "gallery-images";