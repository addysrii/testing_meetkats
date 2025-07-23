   // webappy/frontend/src/supabase/client.js
   import { createClient } from '@supabase/supabase-js';

   // const supabaseUrl = 'https://xmywufagimcjwcynooiz.supabase.co';
   // const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteXd1ZmFnaW1jandjeW5vb2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDA2MjgsImV4cCI6MjA2ODc3NjYyOH0.18_CAdslPEVKPAce9ZJ1Y7s2UEIW1uhRRvyv9lajb64';
   const supabaseUrl = 'https://wwvzyexzxbsdldljubxm.supabase.co';
   const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dnp5ZXh6eGJzZGxkbGp1YnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTgwMDQsImV4cCI6MjA2ODc3NDAwNH0.rrSeWyd-ATMtFV1YeUTKIO7kwCGXNh3NepmUA1ZTKAo';

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);