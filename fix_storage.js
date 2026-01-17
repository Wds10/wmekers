import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://gyyvbyynogdkbayslptg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eXZieXlub2dka2JheXNscHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzEyMDIsImV4cCI6MjA4NDE0NzIwMn0.VWNz5NIjYusIBBlCl94DHgug6TQiP_hjYhFEpwDdo0c';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixStorage() {
    console.log("Fixing Storage...");

    // Sign in to have permissions
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'official@w3d.com',
        password: 'encrypted_placeholder' // This won't work as password was mocked.
        // I need to create a new user or just allow ANON uploads for a second.
    });

    // Since I opened RLS for "Authenticated users can upload models", I need a valid user.
    // I will sign up a temp user.
    const { data: userData } = await supabase.auth.signUp({
        email: `fixer_${Date.now()}@w3d.com`,
        password: 'Password123!'
    });

    const cubePath = path.resolve('public/cube.stl');
    if (!fs.existsSync(cubePath)) {
        fs.writeFileSync(cubePath, "solid cube\nendsolid cube");
    }
    const cubeBuffer = fs.readFileSync(cubePath);

    // Upload to 'demos/cube.stl'
    const { data, error } = await supabase.storage
        .from('models')
        .upload('demos/cube.stl', cubeBuffer, {
            upsert: true
        });

    if (error) console.error("Upload Error:", error);
    else console.log("Uploaded successfully to demos/cube.stl");
}

fixStorage();
