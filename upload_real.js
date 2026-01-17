import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SUPABASE_URL = 'https://gyyvbyynogdkbayslptg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eXZieXlub2dka2JheXNscHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzEyMDIsImV4cCI6MjA4NDE0NzIwMn0.VWNz5NIjYusIBBlCl94DHgug6TQiP_hjYhFEpwDdo0c';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEMO_DIR = path.resolve(__dirname, 'public/demos');

// Upload only the specific new files
const filesToUpload = ['charizard.obj', 'dragon_skull.obj', 'car.obj', 'pistol.obj'];

async function uploadRealValues() {
    console.log("Uploading Real Assets...");

    for (const f of filesToUpload) {
        if (!fs.existsSync(path.join(DEMO_DIR, f))) {
            console.log(`Skipping ${f}, not found`);
            continue;
        }

        const buffer = fs.readFileSync(path.join(DEMO_DIR, f));
        console.log(`Uploading ${f}...`);

        const { error } = await supabase.storage
            .from('models')
            .upload(`demos/${f}`, buffer, {
                upsert: true
            });

        if (error) console.error(error.message);
        else console.log(`Success: demos/${f}`);
    }
}

uploadRealValues();
