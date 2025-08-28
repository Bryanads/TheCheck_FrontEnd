import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rlfnpverbtibeveejzpg.supabase.co';      
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZm5wdmVyYnRpYmV2ZWVqenBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzM1MzIsImV4cCI6MjA2OTIwOTUzMn0.esnF_dvxvHdGRGz-WxMQtiVnSO_Sk2OqKsrEzpZOdM0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Garante que ele leia o # da URL
  },
});