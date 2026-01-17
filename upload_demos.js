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

async function uploadDemos() {
    console.log("Uploading Demos from", DEMO_DIR);

    if (!fs.existsSync(DEMO_DIR)) {
        console.error("Demo dir not found!");
        return;
    }

    const files = fs.readdirSync(DEMO_DIR);

    for (const file of files) {
        if (!file.endsWith('.stl')) continue;

        const filePath = path.join(DEMO_DIR, file);
        const buffer = fs.readFileSync(filePath);

        console.log(`Uploading ${file}...`);

        const { data, error } = await supabase.storage
            .from('models')
            .upload(`demos/${file}`, buffer, {
                upsert: true
            });

        if (error) console.error(`Error uploading ${file}:`, error.message);
        else console.log(`Success: demos/${file}`);
    }
}

uploadDemos();
